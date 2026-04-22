const BASE_URL = "http://localhost:5000";

export const fetchMessagesApi = async () => {
  const response = await fetch(`${BASE_URL}/api/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Failed to fetch messages");
  }

  return payload.data || [];
};

export const sendMessageApi = async (text, sender = "You") => {
  const response = await fetch(`${BASE_URL}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, sender }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || "Failed to send message");
  }

  return payload.data;
};
