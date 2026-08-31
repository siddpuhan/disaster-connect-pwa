export class GroqPromptManager {
  /**
   * Generates the system prompt for the single, unified Groq extraction call.
   */
  static getSystemPrompt(rollingSummary: string, roomMembers: string[] = []): string {
    const todayStr = new Date().toISOString().split("T")[0];

    return `You are a staff-level technical coordinator, project manager, and workspace note-taker AI engine.
Your goal is to analyze the NEW UNPROCESSED MESSAGES in a chat room and extract any new tasks, durable notes, documentation candidates, and update the rolling summary.

TODAY'S DATE: ${todayStr}
KNOWN ROOM MEMBERS: ${JSON.stringify(roomMembers)}
PREVIOUS ROLLING SUMMARY: "${rollingSummary || "No previous summary exists."}"

CRITICAL EXTRACTION BOUNDARY INSTRUCTION:
- You will be provided two distinct sections: "HISTORICAL CONTEXT" and "NEW UNPROCESSED MESSAGES".
- "HISTORICAL CONTEXT" is strictly for background understanding so you understand references, ongoing context, or pronouns.
- You MUST NOT extract Tasks, Notes, or Documents from "HISTORICAL CONTEXT".
- You MUST ONLY extract Tasks, Notes, and Documents originating from the "NEW UNPROCESSED MESSAGES" section.

OUTPUT FORMAT:
Return STRICT, valid JSON only. Do not wrap in markdown \`\`\`json blocks. Do not write explanation text before or after.
Your response must be parseable by JSON.parse().

JSON SCHEMA:
{
  "tasks": [
    {
      "title": "Clear action-oriented task title",
      "assigned_to": "Name of room member assigned or null",
      "priority": "low" | "medium" | "high" | "urgent",
      "deadline": "ISO8601 date string or null",
      "confidence": 0.95,
      "source_message_id": "UUID of the new unprocessed message this task originated from"
    }
  ],
  "notes": [
    {
      "type": "Observation" | "Insight" | "Reminder" | "Resource" | "Architecture" | "Decision" | "Conclusion" | "Risk" | "Idea",
      "content": "Detailed note content",
      "confidence": 0.92,
      "source_message_id": "UUID of the new unprocessed message"
    }
  ],
  "documents": [
    {
      "type": "Decision" | "Architecture" | "Requirements" | "Meeting Summary" | "Technical Specification" | "Project Summary",
      "title": "Document Title",
      "content": "Fully detailed markdown formatted content of the document",
      "confidence": 0.85,
      "source_message_id": "UUID of the new unprocessed message"
    }
  ],
  "summary": "Updated rolling summary incorporating new context (2-3 sentences)",
  "confidence": 0.93
}

EXTRACTION RULES:
1. Tasks: Detect conversational action items, commitments, promises, and requests from NEW UNPROCESSED MESSAGES only. Include source_message_id. Use confidence >= 0.6.
2. Notes: Extract observations, reminders, resources, conclusions, risks, ideas, or architectural points from NEW UNPROCESSED MESSAGES only. Include source_message_id. Use confidence >= 0.6.
3. Documents: Generate candidate documents ONLY when meaningful discussion occurs in NEW UNPROCESSED MESSAGES. Use confidence >= 0.65.
4. Rolling Summary: Generate a concise, updated rolling summary of the entire room conversation, blending the previous summary with the new context.`;
  }

  /**
   * Formats the user message with explicit separation between historical context and new unprocessed messages.
   */
  static formatUserPrompt(
    historicalMessages: Array<{ id: string; sender_name: string; text: string }>,
    newMessages: Array<{ id: string; sender_name: string; text: string }>
  ): string {
    const formattedHistory = historicalMessages.length > 0
      ? historicalMessages.map((msg) => `[ID: ${msg.id}] ${msg.sender_name || "Unknown"}: "${msg.text || ""}"`).join("\n")
      : "None (This is the start of the conversation history)";

    const formattedNew = newMessages
      .map((msg) => `[ID: ${msg.id}] ${msg.sender_name || "Unknown"}: "${msg.text || ""}"`)
      .join("\n");

    return `Analyze the following NEW UNPROCESSED MESSAGES for any tasks, notes, documents, and update the summary.

HISTORICAL CONTEXT (For understanding background context only — DO NOT extract items from here):
${formattedHistory}

NEW UNPROCESSED MESSAGES (ONLY extract Tasks, Notes, Documents from these messages):
${formattedNew}`;
  }
}
