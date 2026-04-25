import React from 'react';

const MessageBubble = ({ message, isOwnMessage }) => {
  const bubbleClass = isOwnMessage ? 'message-bubble own-message' : 'message-bubble other-message';
  const avatarInitial = isOwnMessage ? 'Y' : 'O';
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
