
import React, { useState, useEffect, useRef } from 'react';
import { addMessage, getAllMessages } from './db';
import MessageBubble from './MessageBubble';
import './App.css';
import LandingPage from './LandingPage';
import ResourceBoard from './ResourceBoard';

const CURRENT_USER_ID = 'You';


function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentScreen, setCurrentScreen] = useState('landing');
  const messageListRef = useRef(null);


  useEffect(() => {
    if (currentScreen === 'chat') {
      async function fetchMessages() {
        const allMessages = await getAllMessages();
        setMessages(allMessages);
      }
      fetchMessages();
    }
  }, [currentScreen]);


  useEffect(() => {
    if (currentScreen === 'chat' && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, currentScreen]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      text: newMessage,
      timestamp: new Date().toISOString(),
      author: CURRENT_USER_ID,
    };

    await addMessage(message);
    setNewMessage('');
    const allMessages = await getAllMessages();
    setMessages(allMessages);
  };


  const simulateIncomingMessage = async () => {
    const simulatedMessage = {
      text: 'This is a simulated incoming message.',
      timestamp: new Date().toISOString(),
      author: 'Other',
    };
    await addMessage(simulatedMessage);
    const allMessages = await getAllMessages();
    setMessages(allMessages);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Landing page
  if (currentScreen === 'landing') {
    return (
      <LandingPage
        onEnterChat={() => setCurrentScreen('chat')}
        onEnterResources={() => setCurrentScreen('resources')}
      />
    );
  }

  // Resource board
  if (currentScreen === 'resources') {
    return <ResourceBoard onBack={() => setCurrentScreen('landing')} />;
  }

  // Chat UI
  return (
    <div className="app-container">
      <header className="header">
        <span>Disaster Connect</span>
        <button onClick={simulateIncomingMessage} className="simulate-button">
          Simulate Incoming
        </button>
      </header>
      <div className="message-list" ref={messageListRef}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.author === CURRENT_USER_ID}
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
