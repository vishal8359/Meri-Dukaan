-- ============================================================
-- MyBusz Chatbot — Database Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Chat Sessions ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user
  ON chat_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated
  ON chat_sessions(updated_at DESC);

-- ── Chat Messages ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT DEFAULT '',
  tool_calls JSONB,
  tool_call_id TEXT,
  cards JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON chat_messages(session_id, created_at);

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Service role key bypasses RLS, so these policies are for
-- any anon/public access (shouldn't happen, but defense-in-depth)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'chat_sessions_user_select'
  ) THEN
    CREATE POLICY chat_sessions_user_select ON chat_sessions
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'chat_messages_user_select'
  ) THEN
    CREATE POLICY chat_messages_user_select ON chat_messages
      FOR SELECT USING (
        session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- ── pgvector Extension (for semantic search / RAG) ───────────
-- This may already exist or require Supabase dashboard to enable

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available. Semantic search will be disabled.';
END $$;

-- ── Marketplace Embeddings (optional — requires pgvector) ────

CREATE TABLE IF NOT EXISTS marketplace_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,          -- 'product', 'store', 'service'
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,              -- The text that was embedded
  embedding vector(1536),             -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_entity
  ON marketplace_embeddings(entity_type, entity_id);

-- Unique constraint to allow upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_embeddings_entity_unique
  ON marketplace_embeddings(entity_type, entity_id);

-- Vector similarity index (IVFFlat) — needs data to build, so
-- create only if there are rows. Otherwise, plain bruteforce works.
-- Uncomment when you have >100 embeddings:
-- CREATE INDEX IF NOT EXISTS idx_embeddings_vector
--   ON marketplace_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE marketplace_embeddings ENABLE ROW LEVEL SECURITY;

-- ── Similarity Search Function ───────────────────────────────

CREATE OR REPLACE FUNCTION match_marketplace_embeddings(
  query_embedding vector(1536),
  match_entity_type TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.id,
    me.entity_type,
    me.entity_id,
    me.content,
    me.metadata,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM marketplace_embeddings me
  WHERE
    (match_entity_type IS NULL OR me.entity_type = match_entity_type)
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── Done ─────────────────────────────────────────────────────
-- Run this migration once in your Supabase SQL editor.
