const OFFLINE_MESSAGES_KEY = 'offlineMessages';

export const getOfflineMessages = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_MESSAGES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read offline messages:', error);
    return [];
  }
};

export const saveOfflineMessages = (messages) => {
  try {
    localStorage.setItem(OFFLINE_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save offline messages:', error);
  }
};

export const queueOfflineMessage = (message) => {
  const currentMessages = getOfflineMessages();
  currentMessages.push(message);
  saveOfflineMessages(currentMessages);
};

export const clearOfflineMessages = () => {
  try {
    localStorage.removeItem(OFFLINE_MESSAGES_KEY);
  } catch (error) {
    console.error('Failed to clear offline messages:', error);
  }
};
