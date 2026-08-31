// TaskService.ts — Database operations for AI-extracted tasks
// IMPORTANT: assigned_to stores a DISPLAY NAME string (TEXT), not a user FK.

import { getDB } from '../../config/db.js';
import { areTasksSimilar } from '../ai/DeduplicationService.js';

export class TaskService {
  /**
   * Finds an existing active task in the room that is semantically similar to the target task.
   */
  static async findMatchingTask(
    roomId: string,
    title: string,
    assignedTo?: string | null,
    deadline?: string | Date | null,
    client?: any
  ) {
    const db = client || getDB();
    const result = await db.query(
      `SELECT * FROM tasks WHERE room_id = $1 AND is_deleted = false ORDER BY created_at ASC`,
      [roomId]
    );

    const candidates = result.rows;
    for (const candidate of candidates) {
      if (
        areTasksSimilar(
          { title, assignedTo, deadline },
          { title: candidate.title, assigned_to_name: candidate.assigned_to_name, deadline: candidate.deadline }
        )
      ) {
        return candidate;
      }
    }
    return null;
  }

  /**
   * Helper to record a message source in workspace_item_sources.
   */
  static async recordSource(taskId: string, messageId: string, client?: any) {
    if (!messageId) return;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(messageId)) return;

    const db = client || getDB();
    try {
      await db.query(
        `INSERT INTO workspace_item_sources (workspace_item_id, item_type, message_id)
         VALUES ($1, 'task', $2)
         ON CONFLICT (workspace_item_id, message_id) DO NOTHING`,
        [taskId, messageId]
      );
    } catch (err: any) {
      console.warn(`[TASK SERVICE] Provenance record failed (non-fatal):`, err.message);
    }
  }

  /**
   * Upserts a task: either updates an existing semantically similar task or creates a new one.
   * Returns { task, action: 'created' | 'updated' | 'skipped' }
   */
  static async upsertTask(taskData: any, client?: any) {
    const db = client || getDB();
    const {
      roomId,
      sourceMessageId,
      title,
      description,
      assignedTo,
      priority,
      status,
      deadline,
      confidence,
      aiGenerated,
      createdBy
    } = taskData;

    const existing = await this.findMatchingTask(roomId, title, assignedTo, deadline, db);

    if (existing) {
      // UPDATE existing task with merged fields
      const newDeadline = deadline ? new Date(deadline).toISOString() : existing.deadline;
      const newAssignedTo = assignedTo || existing.assigned_to_name;
      const newPriority = priority || existing.priority;

      const updateResult = await db.query(
        `UPDATE tasks
         SET deadline = COALESCE($1, deadline),
             assigned_to_name = COALESCE($2, assigned_to_name),
             priority = COALESCE($3, priority),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [newDeadline, newAssignedTo, newPriority, existing.id]
      );

      const updatedTask = updateResult.rows[0];
      if (sourceMessageId) {
        await this.recordSource(updatedTask.id, sourceMessageId, db);
      }
      return { task: updatedTask, action: 'updated' as const };
    }

    // CREATE new task
    const newTask = await this.create(taskData, db);
    return { task: newTask, action: 'created' as const };
  }

  /**
   * Create a new task. assigned_to is a display name string or null.
   */
  static async create(taskData: any, client?: any) {
    const db = client || getDB();
    const {
      roomId,
      sourceMessageId,
      title,
      description,
      assignedTo,
      priority,
      status,
      deadline,
      confidence,
      aiGenerated,
      createdBy
    } = taskData;

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const safeSourceMessageId = (sourceMessageId && UUID_REGEX.test(sourceMessageId))
      ? sourceMessageId
      : null;

    let sanitizedDeadline = null;
    if (deadline) {
      try {
        const d = new Date(deadline);
        if (!isNaN(d.getTime())) {
          sanitizedDeadline = d.toISOString();
        }
      } catch {
        // ignore invalid deadline
      }
    }

    const result = await db.query(`
      INSERT INTO tasks (
        room_id, source_message_id, title, description,
        assigned_to_name, priority, status, deadline, confidence, ai_generated, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      roomId,
      safeSourceMessageId,
      title,
      description || '',
      assignedTo || null,
      priority || 'medium',
      status || 'pending',
      sanitizedDeadline,
      confidence || 0.7,
      aiGenerated !== undefined ? aiGenerated : true,
      createdBy || 'AI_SYSTEM'
    ]);

    const newTask = result.rows[0];

    if (safeSourceMessageId) {
      await this.recordSource(newTask.id, safeSourceMessageId, db);
    }

    try {
      await db.query(`
        INSERT INTO task_activity (task_id, activity_type, actor_id)
        VALUES ($1, $2, $3)
      `, [newTask.id, 'created', createdBy || 'AI_SYSTEM']);
    } catch {
      // non-fatal
    }

    return newTask;
  }

  static async updateStatus(taskId: string, newStatus: string, actorId?: string, client?: any) {
    const db = client || getDB();
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const result = await db.query(`
      UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `, [newStatus, taskId]);

    if (result.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updatedTask = result.rows[0];
    try {
      await db.query(`
        INSERT INTO task_activity (task_id, activity_type, actor_id, metadata)
        VALUES ($1, $2, $3, $4)
      `, [taskId, 'status_updated', actorId || 'SYSTEM', JSON.stringify({ newStatus })]);
    } catch {
      // ignore
    }

    return updatedTask;
  }

  static async getTasksByRoom(roomId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      SELECT * FROM tasks WHERE room_id = $1 ORDER BY created_at DESC
    `, [roomId]);
    return result.rows;
  }

  static async complete(taskId: string, actorId?: string, client?: any) {
    return this.updateStatus(taskId, 'completed', actorId, client);
  }

  static async update(taskId: string, { title, description }: { title: string; description: string }, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE tasks SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *
    `, [title, description, taskId]);

    if (result.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }
    return result.rows[0];
  }

  static async softDelete(taskId: string, actorId?: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE tasks SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [taskId]);

    if (result.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }
    return result.rows[0];
  }

  static async restore(taskId: string, actorId?: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE tasks SET is_deleted = false, deleted_at = null, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [taskId]);

    if (result.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }
    return result.rows[0];
  }

  static async hardDelete(taskId: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`DELETE FROM tasks WHERE id = $1 RETURNING *`, [taskId]);
    if (result.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }
    return result.rows[0];
  }

  static async toggleArchive(taskId: string, isArchived: boolean, actorId?: string, client?: any) {
    const db = client || getDB();
    const result = await db.query(`
      UPDATE tasks SET is_archived = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `, [isArchived, taskId]);

    if (result.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }
    return result.rows[0];
  }
}
