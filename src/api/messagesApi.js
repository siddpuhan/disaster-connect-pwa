const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const fetchMessagesApi = async (token) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/messages`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Failed to fetch messages');
  }

  return payload.data || [];
};

export const sendMessageApi = async (text, sender = 'You', token = null, userMeta = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      text, 
      sender,
      senderName: userMeta.senderName,
      senderEmail: userMeta.senderEmail
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Failed to send message');
  }

  return payload.data;
};
