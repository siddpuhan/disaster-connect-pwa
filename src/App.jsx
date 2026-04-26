
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useUser, UserButton } from '@clerk/clerk-react';
import MessageBubble from './MessageBubble';
import AnimatedBackground from './AnimatedBackground';
import { fetchMessagesApi, sendMessageApi } from './api/messagesApi';
import { clearOfflineMessages, getOfflineMessages, queueOfflineMessage, saveOfflineMessages } from './utils/offlineSync';
import './App.css';
import LandingPage from './LandingPage';
import ResourceBoard from './ResourceBoard';

const CURRENT_USER_ID = 'You';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin.replace(/:\d+$/, ':5000');
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

const generateUUID = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const mergeServerWithPending = (serverMessages, currentMessages) => {
  const pendingMessages = currentMessages.filter(
    (msg) => typeof msg.id === 'string' && msg.id.startsWith('temp-')
  );

  return [...serverMessages, ...pendingMessages];
};

const addMessageIfMissing = (currentMessages, incomingMessage) => {
  const duplicateById = incomingMessage.id
    ? currentMessages.some((msg) => msg.id === incomingMessage.id)
    : false;

  const duplicateByPayload = currentMessages.some(
    (msg) =>
      msg.text === incomingMessage.text &&
      (msg.sender || msg.author) === (incomingMessage.sender || incomingMessage.author) &&
      msg.timestamp === incomingMessage.timestamp
  );

  if (duplicateById || duplicateByPayload) {
    return currentMessages;
  }

  return [...currentMessages, incomingMessage];
};

const markMessageStatus = (currentMessages, clientId, status) =>
  currentMessages.map((msg) => (msg.clientId === clientId ? { ...msg, status } : msg));

const updateMode = (connectionState, online) => {
  if (!online) return 'offline';
  if (connectionState === 'connected') return 'webrtc';
  return 'server';
};


function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onEnterChat={() => navigate('/chat')}
            onEnterResources={() => navigate('/resources')}
          />
        }
      />
      <Route 
        path="/chat" 
        element={
          <>
            <SignedIn>
              <ChatPage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        } 
      />
      <Route 
        path="/resources" 
        element={
          <>
            <SignedIn>
              <ResourceBoard onBack={() => navigate('/')} />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        } 
      />
    </Routes>
  );
}

const StatusBadge = ({ mode }) => {
  const badge = {
    webrtc: { text: 'WebRTC Connected', color: 'green' },
    server: { text: 'Server Mode', color: 'yellow' },
    offline: { text: 'Offline Mode', color: 'red' },
  }[mode];

  return (
    <div className={`status-badge ${badge.color}`}>
      <span className="status-dot"></span>
      {badge.text}
    </div>
  );
};

function ChatPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const currentUserIdRef = useRef(null);
  const currentUserNameRef = useRef('You');
  const currentUserEmailRef = useRef(null);

  useEffect(() => {
    if (user) {
      currentUserIdRef.current = user.id;
      currentUserNameRef.current = user.fullName || user.username || user.firstName || 'You';
      currentUserEmailRef.current = user.primaryEmailAddress?.emailAddress || null;
    }
  }, [user]);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mode, setMode] = useState(navigator.onLine ? 'server' : 'offline');
  const [chatMode, setChatMode] = useState('server');
  const [roomInput, setRoomInput] = useState('');
  const [activeRoom, setActiveRoom] = useState('');
  const [rtcStatus, setRtcStatus] = useState('Not connected');
  const messageListRef = useRef(null);
  const socketRef = useRef(null);
  const isSyncingOfflineRef = useRef(false);
  const activeRoomRef = useRef('');
  const chatModeRef = useRef('server');
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const isRoomCreatorRef = useRef(false);
  const pendingIceCandidatesRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const hasSentOfferRef = useRef(false);
  const offerTimerRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    chatModeRef.current = chatMode;
  }, [chatMode]);

  useEffect(() => {
    console.log('navigator.onLine (initial):', navigator.onLine);
  }, []);

  const setDataChannelHandlers = (channel) => {
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log('OPEN');
      console.log('DataChannel open');
      setRtcStatus('Connected');
    };

    channel.onclose = () => {
      setRtcStatus('Disconnected');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    channel.onmessage = (event) => {
      console.log('DataChannel message received:', event.data);

      try {
        const parsed = JSON.parse(event.data);

        if (parsed?.type === 'ack' && parsed?.clientId) {
          setMessages((prevMessages) => markMessageStatus(prevMessages, parsed.clientId, 'delivered'));
          return;
        }

        if (parsed?.type === 'chat-message') {
          const incomingMessage = {
            id: `rtc-peer-${Date.now()}-${Math.random()}`,
            clientId: parsed.clientId,
            text: parsed.text,
            sender: parsed.sender || 'Peer',
            timestamp: parsed.timestamp || new Date().toISOString(),
            status: 'delivered',
          };
          setMessages((prevMessages) => addMessageIfMissing(prevMessages, incomingMessage));

          if (parsed.clientId && dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(
              JSON.stringify({
                type: 'ack',
                clientId: parsed.clientId,
              })
            );
          }
          return;
        }
      } catch {
        // Backward compatibility for plain text payloads.
      }

      const incomingMessage = {
        id: `rtc-peer-${Date.now()}-${Math.random()}`,
        text: event.data,
        sender: 'Peer',
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };
      setMessages((prevMessages) => addMessageIfMissing(prevMessages, incomingMessage));
    };
  };

  const flushPendingIceCandidates = async (peerConnection) => {
    if (pendingIceCandidatesRef.current.length === 0) {
      return;
    }

    const queued = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of queued) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE added from queue');
        console.log('ICE candidate applied from queue');
      } catch (error) {
        console.error('Error applying queued ICE candidate:', error);
      }
    }
  };

  const setupPeerConnection = () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    console.log('RTCPeerConnection created');

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && activeRoomRef.current) {
        console.log('ICE sent');
        socketRef.current?.emit('ice-candidate', {
          roomId: activeRoomRef.current,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ondatachannel = (event) => {
      setDataChannelHandlers(event.channel);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state change');
      console.log('STATE:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setRtcStatus('Connected');
        setMode(updateMode(peerConnection.connectionState, navigator.onLine));
      }
      if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        setRtcStatus('Disconnected');
        setMode(updateMode(peerConnection.connectionState, navigator.onLine));
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE state change:', peerConnection.iceConnectionState);
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const createDataChannel = () => {
    const peerConnection = setupPeerConnection();
    const channel = peerConnection.createDataChannel('chat');
    console.log('DataChannel created by creator side');
    setDataChannelHandlers(channel);
  };

  const startOfferFlow = async (roomId) => {
    if (!isRoomCreatorRef.current || hasSentOfferRef.current) {
      return;
    }

    try {
      const peerConnection = setupPeerConnection();
      if (!dataChannelRef.current) {
        createDataChannel();
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log('Offer created');

      socketRef.current?.emit('offer', {
        roomId,
        offer,
      });
      hasSentOfferRef.current = true;
      setRtcStatus('Offer sent');
    } catch (error) {
      console.error('Error creating offer:', error);
      setMessageError('Failed to create WebRTC offer');
    }
  };


  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('receive_message', (incomingMessage) => {
      if (chatModeRef.current === 'server') {
        setMessages((prevMessages) =>
          addMessageIfMissing(prevMessages, {
            ...incomingMessage,
            status: incomingMessage.status || 'delivered',
          })
        );

        if ((incomingMessage.sender || incomingMessage.author) !== CURRENT_USER_ID && incomingMessage.clientId) {
          socket.emit('message-delivered', {
            clientId: incomingMessage.clientId,
            senderSocketId: incomingMessage.senderSocketId,
          });
        }
      }
    });

    socket.on('message-delivered', ({ clientId }) => {
      if (!clientId) {
        return;
      }
      setMessages((prevMessages) => markMessageStatus(prevMessages, clientId, 'delivered'));
    });

    socket.on('peer-joined', async ({ roomId }) => {
      console.log('Peer joined');
      if (!isRoomCreatorRef.current || roomId !== activeRoomRef.current) {
        return;
      }

      if (offerTimerRef.current) {
        clearTimeout(offerTimerRef.current);
      }

      offerTimerRef.current = setTimeout(() => {
        startOfferFlow(roomId);
      }, 500);
    });

    socket.on('offer', async ({ roomId, offer }) => {
      console.log('Offer received');
      if (isRoomCreatorRef.current || roomId !== activeRoomRef.current) {
        return;
      }

      try {
        const peerConnection = setupPeerConnection();
        remoteDescSetRef.current = false;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescSetRef.current = true;
        await flushPendingIceCandidates(peerConnection);
        const answer = await peerConnection.createAnswer();
        console.log('Answer created');
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', {
          roomId,
          answer,
        });
        setRtcStatus('Answer sent');
      } catch (error) {
        console.error('Error handling offer:', error);
        setMessageError('Failed to handle WebRTC offer');
      }
    });

    socket.on('answer', async ({ roomId, answer }) => {
      console.log('Answer received');
      if (!isRoomCreatorRef.current || roomId !== activeRoomRef.current) {
        return;
      }

      try {
        const peerConnection = setupPeerConnection();
        remoteDescSetRef.current = false;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSetRef.current = true;
        await flushPendingIceCandidates(peerConnection);
        setRtcStatus('Connected');
      } catch (error) {
        console.error('Error handling answer:', error);
        setMessageError('Failed to handle WebRTC answer');
      }
    });

    socket.on('ice-candidate', async ({ roomId, candidate }) => {
      if (roomId !== activeRoomRef.current || !peerConnectionRef.current || !candidate) {
        return;
      }

      try {
        if (remoteDescSetRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              console.log('ICE received');
        } else {
          pendingIceCandidatesRef.current.push(candidate);
              console.log('ICE received (queued)');
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message-delivered');
      socket.off('peer-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      if (offerTimerRef.current) {
        clearTimeout(offerTimerRef.current);
        offerTimerRef.current = null;
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);


  useEffect(() => {
    const goOnline = () => {
      console.log('ONLINE EVENT');
      console.log('navigator.onLine:', navigator.onLine);
      setIsOnline(true);
    };
    const goOffline = () => {
      console.log('OFFLINE EVENT');
      console.log('navigator.onLine:', navigator.onLine);
      setIsOnline(false);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        console.log('Polling detected offline; navigator.onLine:', navigator.onLine);
        setIsOnline(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOnline) {
      console.log('Switching to OFFLINE mode');
      setMode('offline');
      return;
    }

    const connectionState = peerConnectionRef.current?.connectionState;
    setMode(updateMode(connectionState, isOnline));
  }, [isOnline]);

  useEffect(() => {
    console.log('MODE CHANGED:', mode);
  }, [mode]);


  useEffect(() => {
    async function fetchMessages() {
      if (chatMode !== 'server') {
        return;
      }
      setLoadingMessages(true);
      setMessageError('');
      try {
        const token = await getToken();
        const allMessages = await fetchMessagesApi(token);
        setMessages((prevMessages) => mergeServerWithPending(allMessages, prevMessages));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessageError('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchMessages();
  }, [chatMode]);


  useEffect(() => {
    const syncOfflineMessages = async () => {
      if (!isOnline || isSyncingOfflineRef.current) {
        return;
      }

      const queuedMessages = getOfflineMessages();
      if (queuedMessages.length === 0) {
        return;
      }

      isSyncingOfflineRef.current = true;
      const remainingMessages = [];

      const token = await getToken();
      for (const queuedMessage of queuedMessages) {
        try {
          const savedMessage = await sendMessageApi(
            queuedMessage.text,
            queuedMessage.sender,
            token,
            { senderName: queuedMessage.senderName, senderEmail: queuedMessage.senderEmail }
          );
          socketRef.current?.emit('send_message', {
            ...savedMessage,
            clientId: queuedMessage.clientId,
            status: 'sent',
          });

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.clientId === queuedMessage.clientId
                ? { ...savedMessage, clientId: queuedMessage.clientId, status: 'sent' }
                : msg
            )
          );
        } catch (error) {
          console.error('Error syncing offline message:', error);
          remainingMessages.push(queuedMessage);
        }
      }

      if (remainingMessages.length === 0) {
        clearOfflineMessages();
      } else {
        saveOfflineMessages(remainingMessages);
      }

      try {
        const token = await getToken();
        const allMessages = await fetchMessagesApi(token);
        setMessages((prevMessages) => mergeServerWithPending(allMessages, prevMessages));
      } catch (error) {
        console.error('Error refreshing messages after offline sync:', error);
      }

      isSyncingOfflineRef.current = false;
    };

    syncOfflineMessages();
  }, [isOnline]);


  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const textToSend = newMessage.trim();
    const clientId = generateUUID();
    const tempMessage = {
      id: `temp-${generateUUID()}`,
      clientId,
      text: textToSend,
      timestamp: new Date().toISOString(),
      sender: CURRENT_USER_ID,
      pending: !isOnline,
      status: mode === 'offline' ? 'pending' : 'sending',
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage('');
    setMessageError('');

    if (mode === 'webrtc' && dataChannelRef.current?.readyState === 'open') {
      try {
        dataChannelRef.current.send(
          JSON.stringify({
            type: 'chat-message',
            clientId,
            text: textToSend,
            timestamp: tempMessage.timestamp,
            sender: currentUserIdRef.current || CURRENT_USER_ID,
            senderName: currentUserNameRef.current,
            senderEmail: currentUserEmailRef.current,
          })
        );
        setMessages((prevMessages) => markMessageStatus(prevMessages, clientId, 'sent'));
      } catch (error) {
        console.error('Error sending WebRTC message:', error);
        setMessages((prevMessages) => markMessageStatus(prevMessages, clientId, 'failed'));
        setMessageError('WebRTC send failed');
      }
    } else if (mode === 'server') {
      try {
        const token = await getToken();
        const savedMessage = await sendMessageApi(
          textToSend, 
          currentUserIdRef.current || CURRENT_USER_ID, 
          token, 
          { senderName: currentUserNameRef.current, senderEmail: currentUserEmailRef.current }
        );
        setMessages((prevMessages) => {
          const withoutTemp = prevMessages.filter((msg) => msg.id !== tempMessage.id);
          const alreadyExists = withoutTemp.some((msg) => msg.id === savedMessage.id);
          return alreadyExists
            ? withoutTemp
            : [...withoutTemp, { ...savedMessage, clientId, status: 'sent' }];
        });
        socketRef.current?.emit('send_message', {
          ...savedMessage,
          clientId,
          status: 'sent',
        });
      } catch (error) {
        console.error('Error sending message:', error);
        queueOfflineMessage({
          clientId,
          text: textToSend,
          sender: CURRENT_USER_ID,
          timestamp: tempMessage.timestamp,
          status: 'pending',
        });
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempMessage.id ? { ...msg, pending: true, status: 'failed' } : msg
          )
        );
        setMessageError('Message queued offline and will sync when online');
      }
    } else {
      queueOfflineMessage({
        clientId,
        text: textToSend,
        sender: CURRENT_USER_ID,
        timestamp: tempMessage.timestamp,
        status: 'pending',
      });
      setMessages((prevMessages) => markMessageStatus(prevMessages, clientId, 'pending'));
    }
  };


  const simulateIncomingMessage = async () => {
    if (chatMode === 'webrtc') {
      return;
    }
    try {
      const savedMessage = await sendMessageApi('This is a simulated incoming message.', 'Other');
      socketRef.current?.emit('send_message', savedMessage);
      const allMessages = await fetchMessagesApi();
      setMessages(allMessages);
    } catch (error) {
      console.error('Error simulating incoming message:', error);
      setMessageError('Failed to simulate incoming message');
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleCreateRoom = () => {
    const roomId = roomInput.trim();
    if (!roomId || !socketRef.current) {
      return;
    }

    console.log('Creating room:', roomId);
    activeRoomRef.current = roomId;
    chatModeRef.current = 'webrtc';
    hasSentOfferRef.current = false;
    remoteDescSetRef.current = false;
    pendingIceCandidatesRef.current = [];
    setChatMode('webrtc');
    setActiveRoom(roomId);
    isRoomCreatorRef.current = true;
    setRtcStatus('Waiting for peer');

    setupPeerConnection();
    socketRef.current.emit('join-room', roomId);
  };

  const handleJoinRoom = () => {
    const roomId = roomInput.trim();
    if (!roomId || !socketRef.current) {
      return;
    }

    console.log('Joining room:', roomId);
    activeRoomRef.current = roomId;
    chatModeRef.current = 'webrtc';
    hasSentOfferRef.current = false;
    remoteDescSetRef.current = false;
    pendingIceCandidatesRef.current = [];
    setChatMode('webrtc');
    setActiveRoom(roomId);
    isRoomCreatorRef.current = false;
    setRtcStatus('Joined room');

    setupPeerConnection();
    socketRef.current.emit('join-room', roomId);
  };

  const switchToServerMode = () => {
    console.log('Switching to server mode');
    activeRoomRef.current = '';
    chatModeRef.current = 'server';
    pendingIceCandidatesRef.current = [];
    remoteDescSetRef.current = false;
    hasSentOfferRef.current = false;
    setChatMode('server');
    setMode(isOnline ? 'server' : 'offline');
    setActiveRoom('');
    setRtcStatus('Not connected');

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  return (
    <div className="chat-page-container">
      <AnimatedBackground />
      <header className="chat-header">
        <h1>Disaster Connect</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={simulateIncomingMessage} className="chat-button-subtle">
            Simulate Incoming
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="chat-controls-bar">
        <div className="chat-controls">
          <input
            type="text"
            className="chat-input-room"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button type="button" className="chat-button" onClick={handleCreateRoom}>
            Create Room
          </button>
          <button type="button" className="chat-button" onClick={handleJoinRoom}>
            Join Room
          </button>
          <button type="button" className="chat-button-secondary" onClick={switchToServerMode}>
            Exit to Server Mode
          </button>
        </div>
        <StatusBadge mode={mode} />
      </div>

      <div className="chat-main-area">
        <div className="chat-container">
          <div className="message-list" ref={messageListRef}>
            {loadingMessages ? (
              <div className="empty-state">Loading messages...</div>
            ) : messageError ? (
              <div className="empty-state">{messageError}</div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id ?? `${msg.timestamp}-${msg.text}`}
                  message={msg}
                  isOwnMessage={(msg.sender_id || msg.sender || msg.author) === (currentUserIdRef.current || CURRENT_USER_ID)}
                />
              ))
            ) : (
              <div className="empty-state">
                <h2>Welcome!</h2>
                <p>No messages yet. Start the conversation or join a room.</p>
              </div>
            )}
          </div>
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input-field"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button type="submit" className="chat-send-button" disabled={!newMessage.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
