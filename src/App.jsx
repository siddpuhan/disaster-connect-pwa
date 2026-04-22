
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
  const messageListRef = useRef(null);
  const socketRef = useRef(null);
  const isSyncingOfflineRef = useRef(false);


  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('receive_message', (incomingMessage) => {
      setMessages((prevMessages) => addMessageIfMissing(prevMessages, incomingMessage));
    });

    return () => {
      socket.off('receive_message');
      socket.disconnect();
      socketRef.current = null;
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
  }, []);


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

  return (
    <div className="app-container">
      <header className="header">
        <span>Disaster Connect</span>
        <button onClick={simulateIncomingMessage} className="simulate-button">
          Simulate Incoming
        </button>
      </header>
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
