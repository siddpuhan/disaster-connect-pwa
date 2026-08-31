// @ts-nocheck
import { API_BASE_URL } from '../apiConfig';
const BASE_URL = API_BASE_URL;

export const fetchMessagesApi = async (token, roomId) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const queryParams = roomId ? `?roomId=${encodeURIComponent(roomId)}` : '';

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/messages${queryParams}`, {
      headers,
    });
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
    }
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Failed to fetch messages');
  }

  return payload.data || [];
};

export const sendMessageApi = async (text, sender_id, token = null, sender_name = 'Anonymous', room_id = null, id = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id,
        text,
        sender_id,
        sender_name,
        room_id
      }),
    });
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
    }
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Failed to send message');
  }

  return payload.data;
};
