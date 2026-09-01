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
    console.log(`[AI_DEBUG] WORKER_STARTED\nroom=${roomId}`);

    if (!groq) {
      logger.warn("AI-WORKER", "Groq client is not configured. Skipping background analysis.");
      console.log(`[AI_DEBUG] WORKER_SKIPPED\nroom=${roomId}\nreason=groq_not_configured`);
      return;
    }

    // In-process fast lock
    if (this.activeRooms.has(roomId)) {
      this.logStage("AI_WORKER_BUSY_IN_MEMORY", { roomId, message: "Room processing in-flight in this process." });
      console.log(`[AI_DEBUG] WORKER_SKIPPED\nroom=${roomId}\nreason=busy_in_memory`);
      return;
    }

    this.activeRooms.add(roomId);
    const pool = getDB();
    const dbClient = await pool.connect();

    let currentStage = "init";

    try {
      currentStage = "db_lock";
      // 1. Begin DB transaction and acquire PostgreSQL transaction-scoped advisory lock
      await dbClient.query('BEGIN');

      const lockRes = await dbClient.query(
        `SELECT pg_try_advisory_xact_lock(hashtext($1)) as acquired`,
        [roomId]
      );

      const acquired = Boolean(lockRes.rows[0]?.acquired);
      console.log(`[AI_DEBUG] DB_LOCK\nroom=${roomId}\nacquired=${acquired}`);

      if (!acquired) {
        this.logStage("AI_WORKER_BUSY_DB_LOCK", { roomId, message: "Room processing locked by another process." });
        console.log(`[AI_DEBUG] WORKER_SKIPPED\nroom=${roomId}\nreason=db_lock_failed`);
        await dbClient.query('ROLLBACK');
        return;
      }

      currentStage = "cursor_lookup";
      // 2. Fetch current watermark cursor for room within transaction (with microsecond precision)
      const cursorResult = await dbClient.query(
        `SELECT last_analyzed_message_id, to_char(last_analyzed_created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as last_analyzed_created_at_str
         FROM room_ai_cursors WHERE room_id = $1 FOR UPDATE`,
        [roomId]
      );
      const cursorRow = cursorResult.rows[0];

      const cursorCreatedAtStr = cursorRow?.last_analyzed_created_at_str || null;
      console.log(`[AI_DEBUG] CURSOR\nroom=${roomId}\nlast_created=${cursorCreatedAtStr || 'null'}\nlast_message=${cursorRow?.last_analyzed_message_id || 'null'}`);

      let newMessages: Array<{ id: string; text: string; sender_name: string; created_at: Date }> = [];
      let previousCursorDesc = "None (Start of room history)";

      currentStage = "query_new_messages";
      if (cursorRow && cursorCreatedAtStr) {
        previousCursorDesc = `${cursorRow.last_analyzed_message_id || 'N/A'} (${cursorCreatedAtStr})`;
        // Compound watermark comparison using microsecond timestamp string
        const newMsgResult = await dbClient.query(
          `SELECT id, text, sender_name, created_at FROM messages
           WHERE room_id = $1
             AND (created_at > $2::timestamptz OR (created_at = $2::timestamptz AND id > $3))
           ORDER BY created_at ASC, id ASC`,
          [roomId, cursorCreatedAtStr, cursorRow.last_analyzed_message_id || '00000000-0000-0000-0000-000000000000']
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

      console.log(`[AI_DEBUG] NEW_MESSAGES\nroom=${roomId}\ncount=${newMessages.length}\nids=${newMessages.map(m => m.id).join(',')}`);

      if (newMessages.length === 0) {
        this.logStage("AI_GROQ_SKIPPED", { roomId, reason: "no_unprocessed_messages" });
        console.log(`[AI_DEBUG] WORKER_SKIPPED\nroom=${roomId}\nreason=no_unprocessed_messages`);
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
      console.log(`[AI_DEBUG] GROQ_REQUEST\nroom=${roomId}\nnew_messages=${newMessages.length}\nhistorical_messages=${historicalMessages.length}`);
      io.to(roomId).emit("task_generation_status", { status: "generating" });

      currentStage = "groq_invocation";
      // 6. Call Groq with model fallback hierarchy
      const callModel = async (modelName: string, activeSignal?: AbortSignal) => {
        return groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
          max_tokens: 1500
        }, { signal: activeSignal });
      };

      const isModelFallbackError = (err: any): boolean => {
        if (!err) return false;
        const status = err.status || err.statusCode;
        const msg = (err.message || "").toLowerCase();
        const code = (err.error?.error?.code || err.code || "").toLowerCase();

        if (status === 429 || msg.includes("rate_limit") || msg.includes("rate limit")) return true;

        if (status === 404 || status === 400) {
          if (code.includes("model_decommissioned") || code.includes("model_not_found") ||
              msg.includes("decommissioned") || msg.includes("does not exist") || msg.includes("not found")) {
            return true;
          }
        }

        return false;
      };

      const modelsToTry = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"];
      let completion;

      for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];
        try {
          completion = await withGroqRetry((retrySignal) => callModel(modelName, signal || retrySignal), 2);
          break;
        } catch (err: any) {
          const hasNextModel = i < modelsToTry.length - 1;
          if (hasNextModel && isModelFallbackError(err)) {
            logger.warn("AI-WORKER", `Model "${modelName}" failed (${err.status || err.message}). Switching to fallback model "${modelsToTry[i + 1]}".`);
            continue;
          }
          throw err;
        }
      }

      const rawJson = completion.choices[0]?.message?.content || "";
      console.log(`[AI_DEBUG] GROQ_RESPONSE\nroom=${roomId}\nresponse_received=${Boolean(rawJson.trim())}\nresponse_length=${rawJson.length}`);

      if (!rawJson.trim()) {
        throw new Error("Received empty response payload from Groq.");
      }

      currentStage = "json_parse";
      const payload: GroqPayload = GroqJsonParser.parse(rawJson);

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

      console.log(`[AI_DEBUG] EXTRACTION_RESULT\nroom=${roomId}\ntasks=${tasksExtracted}\nnotes=${notesExtracted}\ndocuments=${docsExtracted}`);
      console.log(`[AI_DEBUG] PERSIST\nroom=${roomId}\ntasks=${tasksExtracted}\nnotes=${notesExtracted}\ndocuments=${docsExtracted}`);

      // 7. Server-Side sourceMessageId Validation
      const validNewMsgIds = new Set(newMessages.map((m) => m.id));
      const fallbackSourceId = newMessages[newMessages.length - 1].id;

      const sanitizeSourceId = (idCandidate?: string | null): string => {
        if (idCandidate && validNewMsgIds.has(idCandidate)) {
          return idCandidate;
        }
        return fallbackSourceId;
      };

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
            console.log(`[AI_DEBUG] TASK_SKIPPED reason=low_confidence confidence=${task.confidence}`);
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
            createdBy: "AI_SYSTEM",
            isUpdate: task.is_update,
            updateType: task.update_type
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
            console.log(`[AI_DEBUG] TASK_SKIPPED reason=skipped`);
          }
        }
      }

      // C. Process Notes
      if (payload.notes && payload.notes.length > 0) {
        for (const note of payload.notes) {
          if (note.confidence < 0.6) {
            notesSkipped++;
            console.log(`[AI_DEBUG] NOTE_SKIPPED reason=low_confidence confidence=${note.confidence}`);
            continue;
          }

          const isDup = await NotesService.isDuplicate(roomId, note.type, note.content, dbClient);
          if (isDup) {
            notesSkipped++;
            console.log(`[AI_DEBUG] NOTE_SKIPPED reason=duplicate_content`);
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
        const ALLOWED_DOC_CATEGORIES = new Set([
          'Decision', 'Meeting Summary', 'Catch Up Summary', 'Architecture',
          'Brainstorm', 'Research', 'Requirements', 'Sprint Summary',
          'Design Notes', 'General Documentation'
        ]);

        for (const doc of payload.documents) {
          if (doc.confidence < 0.65) {
            docsSkipped++;
            console.log(`[AI_DEBUG] DOCUMENT_SKIPPED reason=low_confidence confidence=${doc.confidence}`);
            continue;
          }

          let sanitizedCategory = doc.type;
          if (!ALLOWED_DOC_CATEGORIES.has(sanitizedCategory)) {
            if (sanitizedCategory.toLowerCase().includes('summary') || sanitizedCategory.toLowerCase().includes('project')) {
              sanitizedCategory = 'Meeting Summary';
            } else {
              sanitizedCategory = 'General Documentation';
            }
          }

          const targetSourceId = sanitizeSourceId(doc.source_message_id);

          const result = await DocumentService.upsertDocument({
            roomId,
            category: sanitizedCategory,
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
            console.log(`[AI_DEBUG] DOCUMENT_SKIPPED reason=skipped`);
          }
        }
      }

      // E. Advance Watermark Cursor ONLY AFTER all extractions persist!
      const latestProcessedMsg = newMessages[newMessages.length - 1];
      await dbClient.query(
        `INSERT INTO room_ai_cursors (room_id, last_analyzed_message_id, last_analyzed_created_at, updated_at)
         SELECT room_id, id, created_at, NOW()
         FROM messages WHERE room_id = $1 AND id = $2
         ON CONFLICT (room_id)
         DO UPDATE SET last_analyzed_message_id = EXCLUDED.last_analyzed_message_id,
                       last_analyzed_created_at = EXCLUDED.last_analyzed_created_at,
                       updated_at = NOW()`,
        [roomId, latestProcessedMsg.id]
      );

      // Commit DB transaction (automatically releases pg_try_advisory_xact_lock)
      await dbClient.query('COMMIT');
      console.log(`[AI_DEBUG] COMMITTED\nroom=${roomId}`);
      console.log(`[AI_DEBUG] CURSOR_ADVANCED\nroom=${roomId}\nnew_message=${latestProcessedMsg.id}`);

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
      console.log(`[AI_DEBUG] PIPELINE_ERROR\nroom=${roomId}\nstage=${currentStage}\nerror=${err?.stack || err?.message || err}`);
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
      this.activeRooms.delete(roomId);
      io.to(roomId).emit("task_generation_status", { status: "idle" });
    }
  }
}
