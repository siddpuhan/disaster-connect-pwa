import { getDB } from "./config/db.js";

async function createUsersTable() {
  const pool = getDB();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  } finally {
    process.exit(0);
  }
}

createUsersTable();
