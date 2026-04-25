import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "database.db");

let db;

const connectDB = async () => {
  try {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        sender TEXT DEFAULT 'Anonymous',
        timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('need', 'offer')),
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
    `);

    console.log("SQLite connected successfully");
  } catch (error) {
    console.error("SQLite connection error:", error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
};

export default connectDB;
