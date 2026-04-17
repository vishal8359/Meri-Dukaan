import supabase from "../../../config/supabase.js";
import { getCachedJson, setCachedJson, deleteCachedKeys } from "../../../lib/cache.js";

const SESSION_CACHE_TTL = 3600; // 1 hour
const MAX_HISTORY_MESSAGES = 20; // Keep last 20 messages in context window

// ── Session CRUD ────────────────────────────────────────────

/**
 * Gets an existing session or creates a new one.
 */
export async function getOrCreate(userId, sessionId) {
  if (sessionId) {
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id, user_id, title, context")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (session) return session;
  }

  // Create new session
  const { data: session, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, title: "New Chat" })
    .select("id, user_id, title, context")
    .single();

  if (error) throw error;
  return session;
}

/**
 * Lists user's chat sessions (most recent first).
 */
export async function listSessions(userId, limit = 20) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, context, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Deletes a chat session and its messages.
 */
export async function deleteSession(userId, sessionId) {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw error;
  await deleteCachedKeys([`chat:history:${sessionId}`]);
}

// ── Message History ─────────────────────────────────────────

/**
 * Retrieves recent messages for OpenAI context window.
 * Returns messages in chronological order, limited to MAX_HISTORY_MESSAGES.
 */
export async function getHistory(sessionId) {
  const cacheKey = `chat:history:${sessionId}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, tool_calls, tool_call_id")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_MESSAGES * 2); // Fetch extra to cover tool messages

  if (error) {
    // Table might not exist yet
    if (error.code === "PGRST205") return [];
    throw error;
  }

  // Convert DB rows to OpenAI message format
  const messages = (data || []).map((row) => {
    const msg = { role: row.role, content: row.content || "" };
    if (row.tool_calls) msg.tool_calls = row.tool_calls;
    if (row.tool_call_id) msg.tool_call_id = row.tool_call_id;
    return msg;
  });

  // Keep only the latest messages within context limit
  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES);
  await setCachedJson(cacheKey, trimmed, SESSION_CACHE_TTL);
  return trimmed;
}

/**
 * Saves a message to the database.
 */
export async function saveMessage(sessionId, role, content, extras = {}) {
  const row = {
    session_id: sessionId,
    role,
    content: content || "",
  };

  if (extras.tool_calls) row.tool_calls = extras.tool_calls;
  if (extras.tool_call_id) row.tool_call_id = extras.tool_call_id;
  if (extras.cards) row.cards = extras.cards;

  const { error } = await supabase.from("chat_messages").insert(row);

  if (error) {
    // Graceful: if table doesn't exist yet, log and continue
    if (error.code === "PGRST205") {
      console.warn("[session-manager] chat_messages table not found. Run chatbot_migration.sql.");
      return;
    }
    throw error;
  }

  // Invalidate history cache
  await deleteCachedKeys([`chat:history:${sessionId}`]);
}

/**
 * Saves multiple messages at once (for tool call chains).
 */
export async function saveMessages(sessionId, messages) {
  const rows = messages.map((msg) => ({
    session_id: sessionId,
    role: msg.role,
    content: msg.content || "",
    tool_calls: msg.tool_calls || null,
    tool_call_id: msg.tool_call_id || null,
    cards: msg.cards || null,
  }));

  const { error } = await supabase.from("chat_messages").insert(rows);
  if (error && error.code !== "PGRST205") throw error;

  await deleteCachedKeys([`chat:history:${sessionId}`]);
}

/**
 * Get full paginated history for the frontend.
 */
export async function getFullHistory(sessionId, page = 1, limit = 50) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, cards, created_at", { count: "exact" })
    .eq("session_id", sessionId)
    .in("role", ["user", "assistant"]) // Only show user-facing messages
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.code === "PGRST205") return { messages: [], total: 0 };
    throw error;
  }

  return {
    messages: (data || []).reverse(), // Return in chronological order
    total: count || 0,
    page,
    limit,
  };
}

/**
 * Updates session context and title.
 */
export async function updateSession(sessionId, updates) {
  const payload = { updated_at: new Date().toISOString() };
  if (updates.title) payload.title = updates.title;
  if (updates.context) payload.context = updates.context;

  const { error } = await supabase
    .from("chat_sessions")
    .update(payload)
    .eq("id", sessionId);

  if (error && error.code !== "PGRST205") throw error;
}
