import { getDB } from "../config/db.js";

export const createMessage = async (req, res) => {
  try {
    const { text, sender } = req.body;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }

    const trimmedSender = typeof sender === 'string' ? sender.trim() : '';

    const db = getDB();
    const insertMessage = db.prepare(
      'INSERT INTO messages (text, sender) VALUES (?, ?)'
    );
    const result = insertMessage.run(trimmedText, trimmedSender || 'Anonymous');
    const newMessage = db
      .prepare('SELECT id, text, sender, timestamp FROM messages WHERE id = ?')
      .get(result.lastInsertRowid);

    return res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create message',
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const db = getDB();
    const messages = db
      .prepare("SELECT id, text, sender, timestamp FROM messages ORDER BY timestamp ASC")
      .all();
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};
