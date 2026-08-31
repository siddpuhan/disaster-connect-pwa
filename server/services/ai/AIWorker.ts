import { getDB } from "../../config/db.js";
import { groq, withGroqRetry } from "../../utils/groqClient.js";
import { GroqPromptManager } from "./GroqPromptManager.js";
import { GroqJsonParser, GroqPayload } from "./GroqJsonParser.js";
import { TaskService } from "../tasks/TaskService.js";
import { NotesService } from "../notes/NotesService.js";
import { DocumentService } from "../documents/DocumentService.js";
import { logger } from "../../utils/logger.js";
import { Server } from "socket.io";

export class AIWorker {
  // Debounce window in milliseconds (8 seconds)
  private static readonly DEBOUNCE_MS = 8000;

  // Active timers per room
  private static timers = new Map<string, ReturnType<typeof setTimeout>>();

  // Active AbortControllers per room
  private static abortControllers = new Map<string, AbortController>();

  // In-memory mutex per room for fast single-process debouncing
  private static activeRooms = new Set<string>();

  /**
   * Structured logging helper.
   */
  private static logStage(stage: string, meta: Record<string, unknown> = {}) {
    logger.info("PIPELINE", JSON.stringify({ stage, ...meta }));
  }

  /**
   * Enqueues a room for AI processing.
   * Debounces execution and cancels any in-flight requests.
   */
  static enqueueMessage(
    roomId: string,
    message: { id: string; text: string; sender_name: string; user_id?: string },
    io: Server
  ) {
    this.logStage("MESSAGE_QUEUED", { roomId, messageId: message.id });

    if (this.timers.has(roomId)) {
      clearTimeout(this.timers.get(roomId)!);
      this.timers.delete(roomId);
    }

    if (this.abortControllers.has(roomId)) {
      this.logStage("REQUEST_CANCELLED", { roomId });
      this.abortControllers.get(roomId)!.abort();
      this.abortControllers.delete(roomId);
    }

    const abortController = new AbortController();
    this.abortControllers.set(roomId, abortController);

    const timer = setTimeout(async () => {
      this.timers.delete(roomId);
      try {
        await this.processBurst(roomId, message.user_id || null, io, abortController.signal);
      } catch (err: any) {
        if (err.name === "AbortError" || err.message?.includes("aborted")) {
          this.logStage("PIPELINE_ABORTED", { roomId });
        } else {
          this.logStage("PIPELINE_FAILED", { roomId, error: err.message });
        }
      } finally {
        if (this.abortControllers.get(roomId) === abortController) {
          this.abortControllers.delete(roomId);
        }
      }
    }, this.DEBOUNCE_MS);

    this.timers.set(roomId, timer);
  }

  /**
   * Runs the incremental Groq AI extraction burst on new unprocessed messages.
   * Uses PostgreSQL transactional advisory lock (`pg_try_advisory_xact_lock`) to serialize
   * cross-process execution safely.
   */
  static async processBurst(
    roomId: string,
    userId: string | null,
    io: Server,
    signal?: AbortSignal
  ) {
    if (!groq) {
      logger.warn("AI-WORKER", "Groq client is not configured. Skipping background analysis.");
      return;
    }

    // In-process fast lock
    if (this.activeRooms.has(roomId)) {
      this.logStage("AI_WORKER_BUSY_IN_MEMORY", { roomId, message: "Room processing in-flight in this process." });
      return;
    }

    this.activeRooms.add(roomId);
    const pool = getDB();
    const dbClient = await pool.connect();

    try {
      // 1. Begin DB transaction and acquire PostgreSQL transaction-scoped advisory lock
      await dbClient.query('BEGIN');

      const lockRes = await dbClient.query(
        `SELECT pg_try_advisory_xact_lock(hashtext($1)) as acquired`,
        [roomId]
      );

      if (!lockRes.rows[0]?.acquired) {
        this.logStage("AI_WORKER_BUSY_DB_LOCK", { roomId, message: "Room processing locked by another process." });
        await dbClient.query('ROLLBACK');
        return;
      }

      // 2. Fetch current watermark cursor for room within transaction
      const cursorResult = await dbClient.query(
        `SELECT last_analyzed_message_id, last_analyzed_created_at
         FROM room_ai_cursors WHERE room_id = $1 FOR UPDATE`,
        [roomId]
      );
      const cursorRow = cursorResult.rows[0];

      let newMessages: Array<{ id: string; text: string; sender_name: string; created_at: Date }> = [];
      let previousCursorDesc = "None (Start of room history)";

      if (cursorRow && cursorRow.last_analyzed_created_at) {
        previousCursorDesc = `${cursorRow.last_analyzed_message_id || 'N/A'} (${cursorRow.last_analyzed_created_at.toISOString()})`;
        // Compound watermark comparison: created_at > cursor.created_at OR (created_at = cursor.created_at AND id > cursor.message_id) ORDER BY created_at ASC, id ASC
        const newMsgResult = await dbClient.query(
          `SELECT id, text, sender_name, created_at FROM messages
           WHERE room_id = $1
             AND (created_at > $2 OR (created_at = $2 AND id > $3))
           ORDER BY created_at ASC, id ASC`,
          [roomId, cursorRow.last_analyzed_created_at, cursorRow.last_analyzed_message_id || '00000000-0000-0000-0000-000000000000']
        );
        newMessages = newMsgResult.rows;
      } else {
        // First run for room: fetch all messages ordered chronologically
        const newMsgResult = await dbClient.query(
          `SELECT id, text, sender_name, created_at FROM messages
           WHERE room_id = $1
           ORDER BY created_at ASC, id ASC`,
          [roomId]
        );
        newMessages = newMsgResult.rows;
      }

      if (newMessages.length === 0) {
        this.logStage("AI_GROQ_SKIPPED", { roomId, reason: "no_unprocessed_messages" });
        await dbClient.query('COMMIT');
        return;
      }

      // 3. Fetch up to 10 historical messages prior to the first unprocessed message for background context ONLY
      const firstNewMsg = newMessages[0];
      const historyResult = await dbClient.query(
        `SELECT id, text, sender_name, created_at FROM messages
         WHERE room_id = $1
           AND (created_at < $2 OR (created_at = $2 AND id < $3))
         ORDER BY created_at DESC, id DESC
         LIMIT 10`,
        [roomId, firstNewMsg.created_at, firstNewMsg.id]
      );
      const historicalMessages = historyResult.rows.reverse();

      // 4. Fetch rolling summary
      const summaryResult = await dbClient.query(
        `SELECT content FROM summaries WHERE room_id = $1 LIMIT 1`,
        [roomId]
      );
      const rollingSummary = summaryResult.rows[0]?.content || "";

      // 5. Compile prompts
      const systemPrompt = GroqPromptManager.getSystemPrompt(rollingSummary);
      const userPrompt = GroqPromptManager.formatUserPrompt(historicalMessages, newMessages);

      this.logStage("AI_GROQ_STARTED", { roomId, newMessagesCount: newMessages.length, historyCount: historicalMessages.length });
      io.to(roomId).emit("task_generation_status", { status: "generating" });

      // 6. Call Groq
      const completion = await withGroqRetry((retrySignal) => {
        const activeSignal = signal || retrySignal;
        return groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
          max_tokens: 1500
        }, { signal: activeSignal });
      });

      const rawJson = completion.choices[0]?.message?.content || "";
      if (!rawJson.trim()) {
        throw new Error("Received empty response payload from Groq.");
      }

      const payload: GroqPayload = GroqJsonParser.parse(rawJson);

      // 7. Server-Side sourceMessageId Validation
      const validNewMsgIds = new Set(newMessages.map((m) => m.id));
      const fallbackSourceId = newMessages[newMessages.length - 1].id;

      const sanitizeSourceId = (idCandidate?: string | null): string => {
        if (idCandidate && validNewMsgIds.has(idCandidate)) {
          return idCandidate;
        }
        return fallbackSourceId;
      };

      // Tracking metrics for structured logging
      let tasksExtracted = payload.tasks?.length || 0;
      let tasksInserted = 0;
      let tasksUpdated = 0;
      let tasksSkipped = 0;

      let notesExtracted = payload.notes?.length || 0;
      let notesInserted = 0;
      let notesSkipped = 0;

      let docsExtracted = payload.documents?.length || 0;
      let docsInserted = 0;
      let docsUpdated = 0;
      let docsSkipped = 0;

      const timestamp = new Date().toISOString();
      const eventsToEmit: Array<{ eventName: string; payload: any }> = [];

      // 8. DB Persistence (within transaction)

      // A. Summary update
      if (payload.summary) {
        await dbClient.query(
          `INSERT INTO summaries (room_id, content, confidence, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (room_id)
           DO UPDATE SET content = EXCLUDED.content, confidence = EXCLUDED.confidence, updated_at = NOW()`,
          [roomId, payload.summary, payload.confidence]
        );
        eventsToEmit.push({
          eventName: "summary_updated",
          payload: { roomId, summary: payload.summary, messageId: fallbackSourceId, timestamp, userId }
        });
      }

      // B. Process Tasks
      if (payload.tasks && payload.tasks.length > 0) {
        for (const task of payload.tasks) {
          if (task.confidence < 0.6) {
            tasksSkipped++;
            continue;
          }

          const targetSourceId = sanitizeSourceId(task.source_message_id);

          const result = await TaskService.upsertTask({
            roomId,
            sourceMessageId: targetSourceId,
            title: task.title,
            description: "",
            assignedTo: task.assigned_to,
            priority: task.priority,
            status: "pending",
            deadline: task.deadline,
            confidence: task.confidence,
            aiGenerated: true,
            createdBy: "AI_SYSTEM"
          }, dbClient);

          if (result.action === 'created') {
            tasksInserted++;
            eventsToEmit.push({
              eventName: "task_created",
              payload: {
                id: result.task.id,
                roomId,
                sourceMessageId: targetSourceId,
                title: result.task.title,
                description: result.task.description,
                assignedToName: result.task.assigned_to_name,
                priority: result.task.priority,
                status: result.task.status,
                deadline: result.task.deadline,
                confidence: result.task.confidence,
                aiGenerated: true,
                createdBy: "AI_SYSTEM",
                timestamp,
                userId
              }
            });
          } else if (result.action === 'updated') {
            tasksUpdated++;
            eventsToEmit.push({
              eventName: "task_updated",
              payload: {
                ...result.task,
                assignedToName: result.task.assigned_to_name || null,
                timestamp,
                userId
              }
            });
          } else {
            tasksSkipped++;
          }
        }
      }

      // C. Process Notes
      if (payload.notes && payload.notes.length > 0) {
        for (const note of payload.notes) {
          if (note.confidence < 0.6) {
            notesSkipped++;
            continue;
          }

          const isDup = await NotesService.isDuplicate(roomId, note.type, note.content, dbClient);
          if (isDup) {
            notesSkipped++;
            continue;
          }

          const targetSourceId = sanitizeSourceId(note.source_message_id);

          const newNote = await NotesService.create({
            roomId,
            type: note.type,
            title: note.content.substring(0, 80),
            content: note.content,
            confidence: note.confidence,
            createdBy: "AI_SYSTEM",
            sourceMessageId: targetSourceId
          }, dbClient);

          notesInserted++;
          eventsToEmit.push({
            eventName: "note_created",
            payload: {
              id: newNote.id,
              roomId,
              sourceMessageId: targetSourceId,
              type: newNote.type,
              title: newNote.title,
              content: newNote.content,
              confidence: newNote.confidence,
              timestamp,
              userId
            }
          });
        }
      }

      // D. Process Documents
      if (payload.documents && payload.documents.length > 0) {
        for (const doc of payload.documents) {
          if (doc.confidence < 0.65) {
            docsSkipped++;
            continue;
          }

          const targetSourceId = sanitizeSourceId(doc.source_message_id);

          const result = await DocumentService.upsertDocument({
            roomId,
            category: doc.type,
            title: doc.title,
            status: "draft",
            summary: doc.content.substring(0, 200) + "...",
            content: doc.content,
            participants: [],
            sourceMessages: [targetSourceId],
            confidence: doc.confidence,
            sourceMessageId: targetSourceId
          }, dbClient);

          if (result.action === 'created') {
            docsInserted++;
            eventsToEmit.push({
              eventName: "document_created",
              payload: {
                id: result.document.id,
                roomId,
                sourceMessageId: targetSourceId,
                category: result.document.category,
                title: result.document.title,
                status: result.document.status,
                summary: result.document.summary,
                content: result.document.content,
                timestamp,
                userId
              }
            });
          } else if (result.action === 'updated') {
            docsUpdated++;
            eventsToEmit.push({
              eventName: "document_updated",
              payload: {
                ...result.document,
                timestamp,
                userId
              }
            });
          } else {
            docsSkipped++;
          }
        }
      }

      // E. Advance Watermark Cursor ONLY AFTER all extractions persist!
      const latestProcessedMsg = newMessages[newMessages.length - 1];
      await dbClient.query(
        `INSERT INTO room_ai_cursors (room_id, last_analyzed_message_id, last_analyzed_created_at, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (room_id)
         DO UPDATE SET last_analyzed_message_id = EXCLUDED.last_analyzed_message_id,
                       last_analyzed_created_at = EXCLUDED.last_analyzed_created_at,
                       updated_at = NOW()`,
        [roomId, latestProcessedMsg.id, latestProcessedMsg.created_at]
      );

      // Commit DB transaction (automatically releases pg_try_advisory_xact_lock)
      await dbClient.query('COMMIT');

      const newCursorDesc = `${latestProcessedMsg.id} (${latestProcessedMsg.created_at.toISOString()})`;

      // Output Required Development Log Format
      console.log(`\nAI Worker:`);
      console.log(`room=${roomId}`);
      console.log(`previousCursor=${previousCursorDesc}`);
      console.log(`newMessages=[${newMessages.map((m) => m.id).join(", ")}]`);
      console.log(`groqInputMessages=${newMessages.length}`);
      console.log(`tasks: extracted=${tasksExtracted} inserted=${tasksInserted} updated=${tasksUpdated} skipped=${tasksSkipped}`);
      console.log(`notes: extracted=${notesExtracted} inserted=${notesInserted} skipped=${notesSkipped}`);
      console.log(`documents: extracted=${docsExtracted} inserted=${docsInserted} updated=${docsUpdated} skipped=${docsSkipped}`);
      console.log(`newCursor=${newCursorDesc}\n`);

      // 9. Post-Commit Socket.IO Emissions (Socket.IO delivery failure does NOT rollback DB)
      for (const ev of eventsToEmit) {
        try {
          io.to(roomId).emit(ev.eventName, ev.payload);
        } catch (socketErr: any) {
          logger.warn("AI-WORKER", `Socket event emission failed post-commit (${ev.eventName}): ${socketErr.message}`);
        }
      }

    } catch (err: any) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
      this.activeRooms.delete(roomId);
      io.to(roomId).emit("task_generation_status", { status: "idle" });
    }
  }
}
