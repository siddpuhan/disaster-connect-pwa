// DocumentService.ts — CRUD for AI-generated documents
import { getDB } from '../../config/db.js';
import { areDocumentsSimilar } from '../ai/DeduplicationService.js';

export class DocumentService {
  /**
   * Helper to record a message source in workspace_item_sources.
   */
  static async recordSource(docId: string, messageId: string, client?: any) {
    if (!messageId) return;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(messageId)) return;

    const db = client || getDB();
    try {
      await db.query(
        `INSERT INTO workspace_item_sources (workspace_item_id, item_type, message_id)
         VALUES ($1, 'document', $2)
         ON CONFLICT (workspace_item_id, message_id) DO NOTHING`,
        [docId, messageId]
      );
    } catch (err: any) {
      console.warn(`[DOC SERVICE] Provenance record failed (non-fatal):`, err.message);
    }
  }

  /**
   * Finds an existing matching document in the room using deterministic semantic matching.
   */
  static async findMatchingDocument(roomId: string, category: string, title: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `SELECT * FROM documents WHERE room_id = $1 AND category = $2 AND deleted_at IS NULL ORDER BY updated_at DESC`,
      [roomId, category]
    );

    for (const row of result.rows) {
      if (areDocumentsSimilar({ category, title }, { category: row.category, title: row.title })) {
        return row;
      }
    }
    return null;
  }

  /**
   * Prevent duplicate documents.
   */
  static async isDuplicate(roomId: string, category: string, title: string, client?: any) {
    const match = await this.findMatchingDocument(roomId, category, title, client);
    return !!match;
  }

  static async getRecentDocument(roomId: string, category: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `SELECT id FROM documents WHERE room_id = $1 AND category = $2 AND created_at > NOW() - INTERVAL '15 minutes' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      [roomId, category]
    );
    return result.rows[0];
  }

  /**
   * Create a new AI document.
   */
  static async create(
    { roomId, category, title, status = 'draft', summary, content, participants, sourceMessages, confidence, sourceMessageId }: {
      roomId: string;
      category: string;
      title: string;
      status?: string;
      summary?: string;
      content?: string;
      participants?: any[];
      sourceMessages?: any[];
      confidence?: number;
      sourceMessageId?: string | null;
    },
    client?: any
  ) {
    const db = client || getDB();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const safeSourceMessageId = (sourceMessageId && UUID_REGEX.test(sourceMessageId))
      ? sourceMessageId
      : null;

    const result = await db.query(`
      INSERT INTO documents (room_id, category, title, status, summary, content, participants, source_messages, confidence, source_message_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      roomId,
      category,
      title,
      status,
      summary || '',
      content || '',
      JSON.stringify(participants || []),
      JSON.stringify(sourceMessages || []),
      confidence || 0.7,
      safeSourceMessageId
    ]);

    const doc = result.rows[0];

    if (safeSourceMessageId) {
      await this.recordSource(doc.id, safeSourceMessageId, db);
    }

    return doc;
  }

  /**
   * Upsert a document: update existing document if matching, or create a new one.
   * Returns { document, action: 'created' | 'updated' }
   */
  static async upsertDocument(
    docData: {
      roomId: string;
      category: string;
      title: string;
      status?: string;
      summary?: string;
      content?: string;
      participants?: any[];
      sourceMessages?: any[];
      confidence?: number;
      sourceMessageId?: string | null;
    },
    client?: any
  ) {
    const db = client || getDB();
    const existing = await this.findMatchingDocument(docData.roomId, docData.category, docData.title, db);

    if (existing) {
      const updatedContent = docData.content || existing.content;
      const updatedSummary = docData.summary || existing.summary;
      const result = await db.query(
        `UPDATE documents
         SET content = $1, summary = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [updatedContent, updatedSummary, existing.id]
      );
      const updatedDoc = result.rows[0];
      if (docData.sourceMessageId) {
        await this.recordSource(updatedDoc.id, docData.sourceMessageId, db);
      }
      return { document: updatedDoc, action: 'updated' as const };
    }

    const newDoc = await this.create(docData, db);
    return { document: newDoc, action: 'created' as const };
  }

  static async update(docId: string, updates: Record<string, any>, client?: any) {
    const db = client || getDB();
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (['category', 'title', 'status', 'summary', 'content', 'participants', 'source_messages', 'confidence', 'archived'].includes(key)) {
        fields.push(`${key} = $${queryIndex}`);
        values.push(key === 'participants' || key === 'source_messages' ? JSON.stringify(value) : value);
        queryIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(docId);

    const result = await db.query(`
      UPDATE documents SET ${fields.join(', ')}
      WHERE id = $${queryIndex}
      RETURNING *
    `, values);

    return result.rows[0];
  }

  static async getByRoom(roomId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(
      `SELECT * FROM documents WHERE room_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
      [roomId]
    );
    return result.rows;
  }

  static async softDelete(docId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE documents SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [docId]);

    if (result.rows.length === 0) throw new Error(`Document ${docId} not found`);
    return result.rows[0];
  }

  static async restore(docId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE documents SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [docId]);

    if (result.rows.length === 0) throw new Error(`Document ${docId} not found`);
    return result.rows[0];
  }

  static async hardDelete(docId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`DELETE FROM documents WHERE id = $1 RETURNING *`, [docId]);
    if (result.rows.length === 0) throw new Error(`Document ${docId} not found`);
    return result.rows[0];
  }

  static async toggleArchive(docId: string, archived: boolean, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE documents SET archived = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `, [archived, docId]);

    if (result.rows.length === 0) throw new Error(`Document ${docId} not found`);
    return result.rows[0];
  }
}
