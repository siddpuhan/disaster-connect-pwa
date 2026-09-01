import { logger } from "../../utils/logger.js";

export interface ExtractedTask {
  title: string;
  assigned_to: string | null;
  priority: string;
  deadline: string | null;
  confidence: number;
  source_message_id?: string;
  is_update?: boolean;
  update_type?: 'reassignment' | 'deadline_change' | 'confirmation' | 'general' | null;
}

export interface ExtractedNote {
  type: string;
  content: string;
  confidence: number;
  source_message_id?: string;
}

export interface ExtractedDocument {
  type: string;
  title: string;
  content: string;
  confidence: number;
  source_message_id?: string;
}

export interface GroqPayload {
  tasks: ExtractedTask[];
  notes: ExtractedNote[];
  documents: ExtractedDocument[];
  summary: string;
  confidence: number;
}

export class GroqJsonParser {
  /**
   * Cleans up markdown codeblock wrapper syntax and parses response string into JSON.
   */
  static parse(rawResponse: string): GroqPayload {
    let cleaned = rawResponse.trim();

    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.replace(/\n?```$/i, "");
    }

    cleaned = cleaned.trim();

    try {
      const parsed = JSON.parse(cleaned);

      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map((t: any) => ({
          title: typeof t.title === 'string' ? t.title.trim() : '',
          assigned_to: typeof t.assigned_to === 'string' ? t.assigned_to.trim() : null,
          priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium',
          deadline: typeof t.deadline === 'string' ? t.deadline : null,
          confidence: typeof t.confidence === 'number' ? t.confidence : 0.8,
          source_message_id: typeof t.source_message_id === 'string' ? t.source_message_id.trim() : undefined,
          is_update: typeof t.is_update === 'boolean' ? t.is_update : false,
          update_type: typeof t.update_type === 'string' ? t.update_type.trim() : null
        })) : [],
        
        notes: Array.isArray(parsed.notes) ? parsed.notes.map((n: any) => ({
          type: typeof n.type === 'string' ? n.type.trim() : 'Observation',
          content: typeof n.content === 'string' ? n.content.trim() : '',
          confidence: typeof n.confidence === 'number' ? n.confidence : 0.8,
          source_message_id: typeof n.source_message_id === 'string' ? n.source_message_id.trim() : undefined
        })) : [],

        documents: Array.isArray(parsed.documents) ? parsed.documents.map((d: any) => ({
          type: typeof d.type === 'string' ? d.type.trim() : 'Decision',
          title: typeof d.title === 'string' ? d.title.trim() : '',
          content: typeof d.content === 'string' ? d.content.trim() : '',
          confidence: typeof d.confidence === 'number' ? d.confidence : 0.8,
          source_message_id: typeof d.source_message_id === 'string' ? d.source_message_id.trim() : undefined
        })) : [],

        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      };
    } catch (err: any) {
      logger.error("GROQ-PARSER", `JSON parsing failed: ${err.message}`);
      throw new Error(`Failed to parse Groq response: ${err.message}`);
    }
  }
}
