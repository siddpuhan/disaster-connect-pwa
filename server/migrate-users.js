import { getDB } from "./config/db.js";

async function migrateUsersTable() {
  const pool = getDB();
  try {
    // Drop existing users table to ensure fresh start with correct schema
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    
    await pool.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY, -- Clerk User ID
        name TEXT,
        email TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    console.log('Users table migrated successfully');
  } catch (error) {
    console.error('Error migrating users table:', error);
  } finally {
    process.exit(0);
  }
}

migrateUsersTable();
