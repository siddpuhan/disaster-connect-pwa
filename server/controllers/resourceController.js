import { getDB } from "../config/db.js";

export const createResource = async (req, res) => {
  try {
    const { type, category, description } = req.body;

    const trimmedType = typeof type === 'string' ? type.trim().toLowerCase() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim().toLowerCase() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';

    if (!trimmedType || !trimmedCategory || !trimmedDescription) {
      return res.status(400).json({
        success: false,
        message: 'type, category and description are required',
      });
    }

    if (!['need', 'offer'].includes(trimmedType)) {
      return res.status(400).json({
        success: false,
        message: "type must be either 'need' or 'offer'",
      });
    }

    const db = getDB();
    const insertResource = db.prepare(
      'INSERT INTO resources (type, category, description) VALUES (?, ?, ?)'
    );
    const result = insertResource.run(trimmedType, trimmedCategory, trimmedDescription);
    const newResource = db
      .prepare(
        'SELECT id, type, category, description, createdAt FROM resources WHERE id = ?'
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({ success: true, data: newResource });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create resource',
      error: error.message,
    });
  }
};

export const getResources = async (req, res) => {
  try {
    const db = getDB();
    const resources = db
      .prepare(
        "SELECT id, type, category, description, createdAt FROM resources ORDER BY createdAt DESC"
      )
      .all();
    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
};
