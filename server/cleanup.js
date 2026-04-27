import { getDB } from "./config/db.js";

async function cleanup() {
  const pool = getDB();
  try {
    const result = await pool.query(`
      UPDATE messages
      SET sender_name = 'Unknown User'
      WHERE sender_name LIKE 'user_%'
    `);
    console.log(`Updated ${result.rowCount} rows`);
  } catch (error) {
    console.error('Error updating DB:', error);
  } finally {
    process.exit(0);
  }
}

cleanup();
