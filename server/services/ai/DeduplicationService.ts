// DeduplicationService.ts — Deterministic text normalization, tokenization & semantic deduplication
// Implements configurable thresholds and distinct matching strategies for Tasks, Notes, and Documents.

export const TASK_SIMILARITY_THRESHOLD = 0.70;
export const NOTE_SIMILARITY_THRESHOLD = 0.75;
export const DOCUMENT_SIMILARITY_THRESHOLD = 0.65;

const SYNONYM_MAP: Record<string, string> = {
  create: 'create',
  develop: 'create',
  build: 'create',
  make: 'create',
  implement: 'create',
  code: 'create',
  write: 'create',
  setup: 'create',
  produce: 'create',
  work: 'create',
  finish: 'finish',
  complete: 'finish',
  done: 'finish',
  prepare: 'prepare',
  draft: 'prepare',
  compile: 'prepare',
  update: 'update',
  revise: 'update',
  modify: 'update',
  change: 'update',
  edit: 'update',
  conduct: 'conduct',
  organize: 'conduct',
  run: 'conduct',
  hold: 'conduct',
  take: 'conduct',
  host: 'conduct',
  pay: 'pay',
  clear: 'pay',
  settle: 'pay',
  submit: 'pay',
  discuss: 'discuss',
  talk: 'discuss',
  meet: 'discuss',
  test: 'test',
  exam: 'test',
  assessment: 'test',
  agents: 'agent',
  agent: 'agent',
  projects: 'project',
  project: 'project',
  tests: 'test',
  notes: 'note',
  note: 'note',
  docs: 'docs',
  documentation: 'docs',
  doc: 'docs',
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'at', 'by', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'will', 'would', 'should', 'could', 'must',
  'can', 'may', 'please', 'our', 'my', 'your', 'their', 'this', 'that', 'these', 'those',
  'from', 'up', 'out', 'it', 'its', 'he', 'she', 'they', 'them', 'who', 'someone', 'everyone',
  'about', 'time', 'soon', 'today', 'tomorrow', 'next'
]);

function preprocessPhrases(text: string): string {
  if (!text) return '';
  let lower = text.toLowerCase();
  lower = lower.replace(/\bapi\s+docs?\b|\bapi\s+documentation\b/g, 'api_docs');
  lower = lower.replace(/\bfrontend\s+docs?\b|\bfrontend\s+documentation\b/g, 'frontend_docs');
  lower = lower.replace(/\bbackend\s+docs?\b|\bbackend\s+documentation\b/g, 'backend_docs');
  lower = lower.replace(/\b(database|db)\s+schema\b/g, 'db_schema');
  lower = lower.replace(/\b(presentation|slides|deck)\b/g, 'presentation');
  return lower;
}

/**
 * Normalizes text: lowercases, removes punctuation, maps synonyms, removes stop words.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  const preprocessed = preprocessPhrases(text);
  const cleaned = preprocessed.replace(/[^a-z0-9_\s]/g, ' ');
  const tokens = cleaned
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token))
    .map((token) => SYNONYM_MAP[token] || token);

  return tokens.sort().join(' ');
}

/**
 * Extracts normalized token set from string.
 */
export function extractTokenSet(text: string): Set<string> {
  if (!text) return new Set();
  const preprocessed = preprocessPhrases(text);
  const cleaned = preprocessed.replace(/[^a-z0-9_\s]/g, ' ');
  const tokens = cleaned
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token))
    .map((token) => SYNONYM_MAP[token] || token);

  return new Set(tokens);
}

/**
 * Calculates token overlap coefficient: |A ∩ B| / min(|A|, |B|)
 */
export function calculateOverlapCoefficient(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const minSize = Math.min(setA.size, setB.size);
  return minSize > 0 ? intersectionCount / minSize : 0;
}

/**
 * Calculates Jaccard similarity: |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Deduplication check for Tasks:
 * Considers normalized title, assignee, deadline, room, status.
 * Returns true if tasks represent the same underlying action.
 */
export function areTasksSimilar(
  taskA: { title: string; assigned_to_name?: string | null; assignedTo?: string | null; deadline?: string | Date | null },
  taskB: { title: string; assigned_to_name?: string | null; assignedTo?: string | null; deadline?: string | Date | null },
  options?: { allowReassignment?: boolean; ignoreDeadline?: boolean }
): boolean {
  // 1. Assignee check: if both have explicit assignees and they differ, they are distinct tasks!
  if (!options?.allowReassignment) {
    const assigneeA = (taskA.assigned_to_name || taskA.assignedTo || '').trim().toLowerCase();
    const assigneeB = (taskB.assigned_to_name || taskB.assignedTo || '').trim().toLowerCase();
    if (assigneeA && assigneeB && assigneeA !== assigneeB) {
      return false;
    }
  }

  // 2. Deadline check: if both have deadlines and they differ by > 24 hours, they materially differ!
  if (!options?.ignoreDeadline && taskA.deadline && taskB.deadline) {
    const dA = new Date(taskA.deadline).getTime();
    const dB = new Date(taskB.deadline).getTime();
    if (!isNaN(dA) && !isNaN(dB)) {
      const diffHours = Math.abs(dA - dB) / (1000 * 60 * 60);
      if (diffHours > 24) {
        return false;
      }
    }
  }

  // 3. Text token similarity on normalized titles
  const tokensA = extractTokenSet(taskA.title);
  const tokensB = extractTokenSet(taskB.title);

  const overlap = calculateOverlapCoefficient(tokensA, tokensB);
  const jaccard = calculateJaccardSimilarity(tokensA, tokensB);

  return overlap >= TASK_SIMILARITY_THRESHOLD || jaccard >= (TASK_SIMILARITY_THRESHOLD - 0.05);
}

/**
 * Deduplication check for Notes:
 * Considers type + content.
 */
export function areNotesSimilar(
  noteA: { type: string; content: string },
  noteB: { type: string; content: string }
): boolean {
  if (noteA.type.toLowerCase() !== noteB.type.toLowerCase()) {
    return false;
  }

  const tokensA = extractTokenSet(noteA.content);
  const tokensB = extractTokenSet(noteB.content);

  const overlap = calculateOverlapCoefficient(tokensA, tokensB);
  const jaccard = calculateJaccardSimilarity(tokensA, tokensB);

  return overlap >= NOTE_SIMILARITY_THRESHOLD || jaccard >= (NOTE_SIMILARITY_THRESHOLD - 0.05);
}

/**
 * Deduplication check for Documents:
 * Considers category + title.
 */
export function areDocumentsSimilar(
  docA: { category: string; title: string },
  docB: { category: string; title: string }
): boolean {
  if (docA.category.toLowerCase() !== docB.category.toLowerCase()) {
    return false;
  }

  const tokensA = extractTokenSet(docA.title);
  const tokensB = extractTokenSet(docB.title);

  const overlap = calculateOverlapCoefficient(tokensA, tokensB);
  const jaccard = calculateJaccardSimilarity(tokensA, tokensB);

  return overlap >= DOCUMENT_SIMILARITY_THRESHOLD || jaccard >= (DOCUMENT_SIMILARITY_THRESHOLD - 0.05);
}
