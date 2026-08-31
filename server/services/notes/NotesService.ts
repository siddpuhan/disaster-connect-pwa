import { getDB } from '../../config/db.js';
import { logger } from '../../utils/logger.js';
import { areNotesSimilar } from '../ai/DeduplicationService.js';

export class NotesService {
  /**
   * Helper to record a message source in workspace_item_sources.
   */
  static async recordSource(noteId: string, messageId: string, client?: any) {
    if (!messageId) return;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(messageId)) return;

    const db = client || getDB();
    try {
      await db.query(
        `INSERT INTO workspace_item_sources (workspace_item_id, item_type, message_id)
         VALUES ($1, 'note', $2)
         ON CONFLICT (workspace_item_id, message_id) DO NOTHING`,
        [noteId, messageId]
      );
    } catch (err: any) {
      console.warn(`[NOTES SERVICE] Provenance record failed (non-fatal):`, err.message);
    }
  }

  /**
   * Check for duplicate note in room using deterministic semantic matching.
   */
  static async isDuplicate(roomId: string, type: string, content: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `SELECT * FROM notes WHERE room_id = $1 AND type = $2 AND deleted_at IS NULL`,
      [roomId, type]
    );

    for (const row of result.rows) {
      if (areNotesSimilar({ type, content }, { type: row.type, content: row.content })) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create a note, supporting transaction client and sourceMessageId.
   */
  static async create(
    { roomId, type, title, content, confidence, createdBy, sourceMessageId }: {
      roomId: string;
      type: string;
      title: string;
      content: string;
      confidence?: number;
      createdBy?: string;
      sourceMessageId?: string | null;
    },
    client?: any
  ) {
    const db = client || getDB();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const safeSourceMessageId = (sourceMessageId && UUID_REGEX.test(sourceMessageId))
      ? sourceMessageId
      : null;

    const result = await db.query(
      `INSERT INTO notes (room_id, type, title, content, confidence, created_by, source_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [roomId, type, title, content || title, confidence || 0.7, createdBy || 'AI_SYSTEM', safeSourceMessageId]
    );

    const newNote = result.rows[0];

    if (safeSourceMessageId) {
      await this.recordSource(newNote.id, safeSourceMessageId, db);
    }

    logger.info("NOTE", JSON.stringify({ stage: "NOTE_CREATED", roomId, noteId: newNote.id, type }));
    return newNote;
  }

  static async getByRoom(roomId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`SELECT * FROM notes WHERE room_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`, [roomId]);
    return result.rows;
  }

  static async softDelete(noteId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `UPDATE notes SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [noteId]
    );
    if (result.rows.length === 0) throw new Error(`Note ${noteId} not found`);
    return result.rows[0];
  }

  static async restore(noteId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `UPDATE notes SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [noteId]
    );
    if (result.rows.length === 0) throw new Error(`Note ${noteId} not found`);
    return result.rows[0];
  }

  static async hardDelete(noteId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`DELETE FROM notes WHERE id = $1 RETURNING *`, [noteId]);
    if (result.rows.length === 0) throw new Error(`Note ${noteId} not found`);
    return result.rows[0];
  }

  static async toggleArchive(noteId: string, isArchived: boolean, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `UPDATE notes SET archived_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [noteId, isArchived ? new Date() : null]
    );
    if (result.rows.length === 0) throw new Error(`Note ${noteId} not found`);
    return result.rows[0];
  }
}
