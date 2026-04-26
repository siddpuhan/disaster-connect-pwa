import React from 'react';

const MessageBubble = ({ message, isOwnMessage }) => {
  const bubbleClass = isOwnMessage ? 'message-bubble own-message' : 'message-bubble other-message';
  const displayName = isOwnMessage 
    ? 'You' 
    : (message.sender_name || message.senderName || message.sender || 'Anonymous');
  
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const statusIcon = {
    sending: '🕒',
    pending: '🕒',
    sent: '✓',
    delivered: '✓✓',
    failed: '⚠',
  }[message.status];

  return (
    <div className={bubbleClass}>
      <div className="avatar">{avatarInitial}</div>
      <div className="message-content">
        {!isOwnMessage && <div className="message-sender-name" style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px', color: '#888' }}>{displayName}</div>}
        <div className="message-text">{message.text}</div>
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOwnMessage && statusIcon ? <span className="message-status"> {statusIcon}</span> : null}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
