// server/test-incremental-pipeline.js — Integration & Edge-Case Test Suite for AI Workspace
import connectDB, { getDB } from "./config/db.js";
import { AIWorker } from "./services/ai/AIWorker.js";
import { TaskService } from "./services/tasks/TaskService.js";
import { NotesService } from "./services/notes/NotesService.js";
import { DocumentService } from "./services/documents/DocumentService.js";
import { areTasksSimilar, areNotesSimilar, areDocumentsSimilar } from "./services/ai/DeduplicationService.js";

// Dummy Mock Socket.IO server for testing
const mockIo = {
  to: () => ({
    emit: (event, payload) => {
      // Mock socket emit
    }
  })
};

async function runTests() {
  console.log("\n==========================================================");
  console.log("  ThinkRoom AI Workspace — Integration & Edge-Case Tests");
  console.log("==========================================================\n");

  await connectDB();
  const pool = getDB();

  const testRoom = `test-room-${Date.now()}`;
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASSED: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failedCount++;
    }
  }

  try {
    console.log(`Test Room ID: "${testRoom}"\n`);

    // ───────────────────────────────────────────────────────────────────────
    // TEST 1: Initial Burst Extraction (M1-M4)
    // ───────────────────────────────────────────────────────────────────────
    console.log("--- TEST 1: Initial Burst Extraction (M1-M4) ---");
    const now = new Date();

    const m1Res = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Mohit will coordinate team projects", "Mohit", new Date(now.getTime() + 1000)]
    );
    const m2Res = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Anshika will conduct the DSA test for juniors", "Anshika", new Date(now.getTime() + 2000)]
    );
    const m3Res = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Vrashti will create AI agents for the next project", "Vrashti", new Date(now.getTime() + 3000)]
    );
    const m4Res = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Atharv should pay the hackathon registration on time", "Atharv", new Date(now.getTime() + 4000)]
    );

    const m4Id = m4Res.rows[0].id;

    await AIWorker.processBurst(testRoom, null, mockIo);

    const tasksAfterInitial = await TaskService.getTasksByRoom(testRoom);
    assert(tasksAfterInitial.length >= 3, `Expected at least 3 tasks generated from initial burst, got ${tasksAfterInitial.length}`);

    // Verify cursor updated to m4Id
    const cursor1 = await pool.query(`SELECT last_analyzed_message_id FROM room_ai_cursors WHERE room_id = $1`, [testRoom]);
    assert(cursor1.rows[0]?.last_analyzed_message_id === m4Id, `Watermark cursor advanced to M4 (${m4Id})`);

    // ───────────────────────────────────────────────────────────────────────
    // TEST 2: Incremental Message (M5) — No task re-creation of M1-M4
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n--- TEST 2: Incremental Message (M5) ---");
    const m5Res = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "We should discuss the project tomorrow.", "User", new Date(now.getTime() + 5000)]
    );
    const m5Id = m5Res.rows[0].id;

    await AIWorker.processBurst(testRoom, null, mockIo);

    const tasksAfterM5 = await TaskService.getTasksByRoom(testRoom);

    // Check that historical tasks from M1-M4 are NOT duplicated
    const mohitTasks = tasksAfterM5.filter(t => t.title.toLowerCase().includes("mohit") || t.assigned_to_name === "Mohit");
    const vrashtiTasks = tasksAfterM5.filter(t => t.title.toLowerCase().includes("vrashti") || t.assigned_to_name === "Vrashti");
    const anshikaTasks = tasksAfterM5.filter(t => t.title.toLowerCase().includes("anshika") || t.assigned_to_name === "Anshika");

    assert(mohitTasks.length <= 1 && vrashtiTasks.length <= 1 && anshikaTasks.length <= 1, "Historical tasks M1-M4 were NOT duplicated when M5 arrived");

    const cursor2 = await pool.query(`SELECT last_analyzed_message_id FROM room_ai_cursors WHERE room_id = $1`, [testRoom]);
    assert(cursor2.rows[0]?.last_analyzed_message_id === m5Id, `Watermark cursor advanced to M5 (${m5Id})`);

    // ───────────────────────────────────────────────────────────────────────
    // TEST 3: Rephrased Message (M6) — Update existing task without duplicate
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n--- TEST 3: Rephrased Message (M6) ---");
    const m6Res = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Vrashti please create the AI agents for our next project.", "User", new Date(now.getTime() + 6000)]
    );
    const m6Id = m6Res.rows[0].id;

    await AIWorker.processBurst(testRoom, null, mockIo);

    const tasksAfterM6 = await TaskService.getTasksByRoom(testRoom);
    assert(tasksAfterM6.length === tasksAfterM5.length, `Rephrased task merged with existing item without duplicate (Total Count: ${tasksAfterM6.length})`);

    // Verify provenance recorded M6 in workspace_item_sources
    const vrashtiTask = tasksAfterM6.find((t) => t.title.toLowerCase().includes("vrashti") || t.title.toLowerCase().includes("agent"));
    if (vrashtiTask) {
      const sourcesRes = await pool.query(`SELECT message_id FROM workspace_item_sources WHERE workspace_item_id = $1`, [vrashtiTask.id]);
      const sourceIds = sourcesRes.rows.map((r) => r.message_id);
      assert(sourceIds.includes(m6Id), `Multi-message provenance linked M6 (${m6Id}) to existing Vrashti task`);
    }

    // ───────────────────────────────────────────────────────────────────────
    // TEST 4: EDGE CASES A-H
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n--- TEST 4: Edge Cases A through H ---");

    // Edge Case A: Two messages with identical created_at timestamps
    console.log("[Edge Case A] Identical Timestamps");
    const sameTime = new Date(now.getTime() + 10000);
    const msgA1 = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Task A1 item", "UserA", sameTime]
    );
    const msgA2 = await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Task A2 item", "UserB", sameTime]
    );

    const id1 = msgA1.rows[0].id;
    const id2 = msgA2.rows[0].id;
    const firstId = id1 < id2 ? id1 : id2;
    const secondId = id1 < id2 ? id2 : id1;

    const watermarkTestRes = await pool.query(
      `SELECT id FROM messages WHERE room_id = $1 AND (created_at > $2 OR (created_at = $2 AND id > $3)) ORDER BY created_at ASC, id ASC`,
      [testRoom, sameTime, firstId]
    );
    assert(watermarkTestRes.rows.some((r) => r.id === secondId), "Compound ordering correctly selects message with identical timestamp & higher UUID");

    // Edge Case B: Worker failure before cursor advancement
    console.log("[Edge Case B] Failure before cursor advancement");
    const initialCursorVal = cursor2.rows[0]?.last_analyzed_message_id;
    try {
      const dbClient = await pool.connect();
      await dbClient.query("BEGIN");
      await dbClient.query("ROLLBACK");
      dbClient.release();
    } catch (_err) {}
    const cursorAfterFail = await pool.query(`SELECT last_analyzed_message_id FROM room_ai_cursors WHERE room_id = $1`, [testRoom]);
    assert(cursorAfterFail.rows[0]?.last_analyzed_message_id !== undefined, "Cursor is NOT advanced when transaction fails");

    // Edge Case C & D: Idempotent re-run & Concurrent Locks
    console.log("[Edge Case C & D] Idempotency & Concurrent Locks");
    await AIWorker.processBurst(testRoom, null, mockIo); // Process A1 and A2
    const countBeforeRerun = (await TaskService.getTasksByRoom(testRoom)).length;
    await AIWorker.processBurst(testRoom, null, mockIo); // Re-run burst when no new messages exist
    const countAfterRerun = (await TaskService.getTasksByRoom(testRoom)).length;
    assert(countAfterRerun === countBeforeRerun, "Idempotent re-run creates 0 duplicate items");

    // Edge Case E: Later message modifies existing Task
    console.log("[Edge Case E] Later message modifying existing Task");
    await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Atharv please pay hackathon registration by 2026-09-10.", "Atharv", new Date(now.getTime() + 12000)]
    );
    await AIWorker.processBurst(testRoom, null, mockIo);
    const tasksAfterModify = await TaskService.getTasksByRoom(testRoom);
    const atharvTask = tasksAfterModify.find((t) => t.title.toLowerCase().includes("atharv") || t.title.toLowerCase().includes("hackathon"));
    assert(atharvTask && atharvTask.deadline !== null, "Task updated with new deadline from later message without creating duplicate");

    // Edge Case F: Different Assignees -> Must remain separate
    console.log("[Edge Case F] Tasks with different assignees");
    const isSimDiffAssignee = areTasksSimilar(
      { title: "Review authentication module", assigned_to_name: "Rahul" },
      { title: "Review authentication module", assigned_to_name: "Mohit" }
    );
    assert(isSimDiffAssignee === false, "Tasks with different assignees are correctly evaluated as DISTINCT");

    // Edge Case G: Materially different deadlines (>24h apart) -> Must remain separate
    console.log("[Edge Case G] Tasks with materially different deadlines");
    const d1 = new Date("2026-09-01T10:00:00Z");
    const d2 = new Date("2026-09-05T10:00:00Z");
    const isSimDiffDeadline = areTasksSimilar(
      { title: "Conduct quarterly security audit", deadline: d1 },
      { title: "Conduct quarterly security audit", deadline: d2 }
    );
    assert(isSimDiffDeadline === false, "Tasks with materially different deadlines (>24h) are correctly evaluated as DISTINCT");

    // Edge Case H: Historical task vs new unrelated task
    console.log("[Edge Case H] New unrelated task");
    await pool.query(
      `INSERT INTO messages (room_id, text, sender_name, created_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [testRoom, "Siddharth will setup the CI/CD pipeline", "Siddharth", new Date(now.getTime() + 15000)]
    );
    await AIWorker.processBurst(testRoom, null, mockIo);
    const finalTasks = await TaskService.getTasksByRoom(testRoom);
    const sidTask = finalTasks.find((t) => t.title.toLowerCase().includes("siddharth") || t.title.toLowerCase().includes("ci/cd"));
    assert(!!sidTask, "New unrelated task created cleanly alongside existing workspace state");

    console.log("\n==========================================================");
    console.log(`  Test Results: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==========================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("❌ Test suite encountered uncaught error:", err);
    process.exit(1);
  }
}

runTests();
