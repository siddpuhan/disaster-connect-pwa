const getStorageKey = (roomId) => `offlineMessages_${roomId || 'global'}`;

export const getOfflineMessages = (roomId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(roomId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read offline messages:', error);
    return [];
  }
};

export const saveOfflineMessages = (roomId, messages) => {
  try {
    localStorage.setItem(getStorageKey(roomId), JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save offline messages:', error);
  }
};

export const queueOfflineMessage = (roomId, message) => {
  const currentMessages = getOfflineMessages(roomId);
  currentMessages.push(message);
  saveOfflineMessages(roomId, currentMessages);
};

export const clearOfflineMessages = (roomId) => {
  try {
    localStorage.removeItem(getStorageKey(roomId));
  } catch (error) {
    console.error('Failed to clear offline messages:', error);
  }
};
