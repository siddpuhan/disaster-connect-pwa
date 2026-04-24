
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import { fetchMessagesApi, sendMessageApi } from './api/messagesApi';
import { clearOfflineMessages, getOfflineMessages, queueOfflineMessage, saveOfflineMessages } from './utils/offlineSync';
import './App.css';
import LandingPage from './LandingPage';
import ResourceBoard from './ResourceBoard';

const CURRENT_USER_ID = 'You';
const SOCKET_URL = 'http://localhost:5000';
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

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
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/resources" element={<ResourceBoard onBack={() => navigate('/')} />} />
    </Routes>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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
      const incomingMessage = {
        id: `rtc-peer-${Date.now()}-${Math.random()}`,
        text: event.data,
        sender: 'Peer',
        timestamp: new Date().toISOString(),
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
      }
      if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        setRtcStatus('Disconnected');
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
        setMessages((prevMessages) => addMessageIfMissing(prevMessages, incomingMessage));
      }
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    async function fetchMessages() {
      if (chatMode !== 'server') {
        return;
      }
      setLoadingMessages(true);
      setMessageError('');
      try {
        const allMessages = await fetchMessagesApi();
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

      for (const queuedMessage of queuedMessages) {
        try {
          const savedMessage = await sendMessageApi(queuedMessage.text, queuedMessage.sender);
          socketRef.current?.emit('send_message', savedMessage);

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.clientId === queuedMessage.clientId
                ? { ...savedMessage, clientId: queuedMessage.clientId }
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
        const allMessages = await fetchMessagesApi();
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
    const clientId = `client-${Date.now()}`;
    const tempMessage = {
      id: `temp-${Date.now()}`,
      clientId,
      text: textToSend,
      timestamp: new Date().toISOString(),
      sender: CURRENT_USER_ID,
      pending: !isOnline,
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage('');
    setMessageError('');

    if (chatMode === 'webrtc') {
      if (dataChannelRef.current?.readyState === 'open') {
        try {
          dataChannelRef.current.send(textToSend);
        } catch (error) {
          console.error('Error sending WebRTC message:', error);
          setMessageError('WebRTC send failed');
        }
      } else {
        console.log('Channel not open yet');
        setMessageError('WebRTC channel is not connected yet');
      }
      return;
    }

    if (!isOnline) {
      queueOfflineMessage({
        clientId,
        text: textToSend,
        sender: CURRENT_USER_ID,
        timestamp: tempMessage.timestamp,
      });
      return;
    }

    try {
      const savedMessage = await sendMessageApi(textToSend, CURRENT_USER_ID);
      setMessages((prevMessages) => {
        const withoutTemp = prevMessages.filter((msg) => msg.id !== tempMessage.id);
        const alreadyExists = withoutTemp.some((msg) => msg.id === savedMessage.id);
        return alreadyExists ? withoutTemp : [...withoutTemp, { ...savedMessage, clientId }];
      });
      socketRef.current?.emit('send_message', savedMessage);

      fetchMessagesApi()
        .then((allMessages) => {
          setMessages((prevMessages) => mergeServerWithPending(allMessages, prevMessages));
        })
        .catch((syncError) => {
          console.error('Error syncing messages after send:', syncError);
        });
    } catch (error) {
      console.error('Error sending message:', error);
      queueOfflineMessage({
        clientId,
        text: textToSend,
        sender: CURRENT_USER_ID,
        timestamp: tempMessage.timestamp,
      });
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, pending: true } : msg))
      );
      setMessageError('Message queued offline and will sync when online');
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
    <div className="app-container">
      <header className="header">
        <span>Disaster Connect</span>
        <button onClick={simulateIncomingMessage} className="simulate-button">
          Simulate Incoming
        </button>
      </header>
      <div className="webrtc-toolbar">
        <input
          type="text"
          className="webrtc-input"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          placeholder="Room ID"
        />
        <button type="button" className="simulate-button" onClick={handleCreateRoom}>
          Create Room
        </button>
        <button type="button" className="simulate-button" onClick={handleJoinRoom}>
          Join Room
        </button>
        <button type="button" className="simulate-button" onClick={switchToServerMode}>
          Server Mode
        </button>
      </div>
      <div className="webrtc-status">
        Mode: {chatMode === 'webrtc' ? `WebRTC (${activeRoom || 'no room'})` : 'Server'} | Status: {rtcStatus}
      </div>
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
              isOwnMessage={(msg.sender || msg.author) === CURRENT_USER_ID}
            />
          ))
        ) : (
          <div className="empty-state">
            No messages yet. Start the conversation.
          </div>
        )}
      </div>
      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="input-field"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          &#10148;
        </button>
      </form>
    </div>
  );
}

export default App;
