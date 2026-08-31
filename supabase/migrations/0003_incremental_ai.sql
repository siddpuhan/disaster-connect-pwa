-- ============================================================================
-- ThinkRoom AI — Migration 0003: Incremental Processing & Idempotency
-- ============================================================================

-- 1. Table for room AI watermark cursors
CREATE TABLE IF NOT EXISTS public.room_ai_cursors (
  room_id                  TEXT PRIMARY KEY,
  last_analyzed_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  last_analyzed_created_at TIMESTAMPTZ,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table for multi-message provenance tracking
CREATE TABLE IF NOT EXISTS public.workspace_item_sources (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_item_id UUID NOT NULL,
  item_type         TEXT NOT NULL CHECK (item_type IN ('task', 'note', 'document')),
  message_id        UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_item_id, message_id)
);

-- 3. Add source_message_id column to notes and documents for single primary message linkage back-compat
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS source_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS source_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- 4. Functional Unique Indexes for Idempotency Protection
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_room_source_title
  ON public.tasks (room_id, COALESCE(source_message_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(trim(title)))
  WHERE (is_deleted = false);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_room_source_content
  ON public.notes (room_id, COALESCE(source_message_id, '00000000-0000-0000-0000-000000000000'::uuid), type, lower(trim(content)))
  WHERE (deleted_at IS NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_room_category_title
  ON public.documents (room_id, category, lower(trim(title)))
  WHERE (deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_workspace_item_sources_item ON public.workspace_item_sources (workspace_item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_workspace_item_sources_msg ON public.workspace_item_sources (message_id);
