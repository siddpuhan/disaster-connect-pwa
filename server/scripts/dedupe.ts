// server/scripts/dedupe.ts — Explicit one-time deduplication command for AI Workspace
// Usage: npm run workspace:dedupe

import connectDB, { getDB } from '../config/db.js';
import { areTasksSimilar, areNotesSimilar, areDocumentsSimilar } from '../services/ai/DeduplicationService.js';

async function runDeduplication() {
  console.log('\n======================================================');
  console.log('  ThinkRoom AI Workspace — One-Time Deduplication CLI');
  console.log('======================================================\n');

  await connectDB();
  const pool = getDB();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch all distinct rooms
    const roomResult = await client.query(
      `SELECT DISTINCT room_id FROM messages WHERE room_id IS NOT NULL`
    );
    const roomIds = roomResult.rows.map((r: any) => r.room_id);
    console.log(`Found ${roomIds.length} rooms to reconcile.`);

    let totalTasksRemoved = 0;
    let totalNotesRemoved = 0;
    let totalDocsRemoved = 0;

    for (const roomId of roomIds) {
      console.log(`\nReconciling room: "${roomId}"...`);

      // 1. Reconcile Tasks
      const tasksResult = await client.query(
        `SELECT * FROM tasks WHERE room_id = $1 AND is_deleted = false ORDER BY created_at ASC`,
        [roomId]
      );
      const tasks = tasksResult.rows;
      const keptTasks: any[] = [];
      for (const task of tasks) {
        let isDup = false;
        for (const kept of keptTasks) {
          if (
            areTasksSimilar(
              { title: task.title, assigned_to_name: task.assigned_to_name, deadline: task.deadline },
              { title: kept.title, assigned_to_name: kept.assigned_to_name, deadline: kept.deadline }
            )
          ) {
            isDup = true;
            console.log(`  [TASK DUP REMOVED] ID: ${task.id} | Title: "${task.title}" (matches ${kept.id})`);
            await client.query(`UPDATE tasks SET is_deleted = true, deleted_at = NOW() WHERE id = $1`, [task.id]);
            totalTasksRemoved++;
            break;
          }
        }
        if (!isDup) {
          keptTasks.push(task);
        }
      }

      // 2. Reconcile Notes
      const notesResult = await client.query(
        `SELECT * FROM notes WHERE room_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
        [roomId]
      );
      const notes = notesResult.rows;
      const keptNotes: any[] = [];
      for (const note of notes) {
        let isDup = false;
        for (const kept of keptNotes) {
          if (areNotesSimilar({ type: note.type, content: note.content }, { type: kept.type, content: kept.content })) {
            isDup = true;
            console.log(`  [NOTE DUP REMOVED] ID: ${note.id} | Type: ${note.type} | Title: "${note.title}"`);
            await client.query(`UPDATE notes SET deleted_at = NOW() WHERE id = $1`, [note.id]);
            totalNotesRemoved++;
            break;
          }
        }
        if (!isDup) {
          keptNotes.push(note);
        }
      }

      // 3. Reconcile Documents
      const docsResult = await client.query(
        `SELECT * FROM documents WHERE room_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
        [roomId]
      );
      const docs = docsResult.rows;
      const keptDocs: any[] = [];
      for (const doc of docs) {
        let isDup = false;
        for (const kept of keptDocs) {
          if (areDocumentsSimilar({ category: doc.category, title: doc.title }, { category: kept.category, title: kept.title })) {
            isDup = true;
            console.log(`  [DOC DUP REMOVED] ID: ${doc.id} | Category: ${doc.category} | Title: "${doc.title}"`);
            await client.query(`UPDATE documents SET deleted_at = NOW() WHERE id = $1`, [doc.id]);
            totalDocsRemoved++;
            break;
          }
        }
        if (!isDup) {
          keptDocs.push(doc);
        }
      }

      // 4. Align room watermark cursor to latest message created_at & id
      const maxMsgResult = await client.query(
        `SELECT id, created_at FROM messages WHERE room_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1`,
        [roomId]
      );
      if (maxMsgResult.rows.length > 0) {
        const latestMsg = maxMsgResult.rows[0];
        await client.query(
          `INSERT INTO room_ai_cursors (room_id, last_analyzed_message_id, last_analyzed_created_at, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (room_id)
           DO UPDATE SET last_analyzed_message_id = EXCLUDED.last_analyzed_message_id,
                         last_analyzed_created_at = EXCLUDED.last_analyzed_created_at,
                         updated_at = NOW()`,
          [roomId, latestMsg.id, latestMsg.created_at]
        );
        console.log(`  [CURSOR ALIGNED] Room: ${roomId} -> messageId: ${latestMsg.id}, created_at: ${latestMsg.created_at.toISOString()}`);
      }
    }

    await client.query('COMMIT');
    console.log('\n======================================================');
    console.log(`  Deduplication Complete!`);
    console.log(`  Tasks Removed: ${totalTasksRemoved}`);
    console.log(`  Notes Removed: ${totalNotesRemoved}`);
    console.log(`  Docs Removed:  ${totalDocsRemoved}`);
    console.log('======================================================\n');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Deduplication failed and rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

runDeduplication();
