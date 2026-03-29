import React from 'react';

const MessageBubble = ({ message, isOwnMessage }) => {
  const bubbleClass = isOwnMessage ? 'message-bubble own-message' : 'message-bubble other-message';
  const avatarInitial = isOwnMessage ? 'Y' : 'O';

  return (
    <div className={bubbleClass}>
      <div className="avatar">{avatarInitial}</div>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
