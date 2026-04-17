import { randomUUID } from "crypto";
import supabase from "../../../config/supabase.js";
import { getCachedJson, setCachedJson, deleteCachedKeys } from "../../../lib/cache.js";

const SESSION_CACHE_TTL = 3600; // 1 hour
const MAX_HISTORY_MESSAGES = 20; // Keep last 20 messages in context window

// In-memory fallback for when DB tables don't exist
const memoryStore = {
  sessions: new Map(),
  messages: new Map(), // sessionId -> []
};

let tablesExist = null; // null = not checked; true/false = checked

async function checkTablesExist() {
  if (tablesExist !== null) return tablesExist;
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .select("id")
      .limit(1);
    tablesExist = !error;
    if (!tablesExist) {
      console.warn("[chatbot] chat_sessions table not found. Using in-memory storage. Run chatbot_migration.sql for persistence.");
    }
  } catch {
    tablesExist = false;
  }
  return tablesExist;
}

// ── Session CRUD ────────────────────────────────────────────

/**
 * Gets an existing session or creates a new one.
 */
export async function getOrCreate(userId, sessionId) {
  const dbOk = await checkTablesExist();

  if (dbOk) {
    if (sessionId) {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id, user_id, title, context")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (session) return session;
    }

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, title: "New Chat" })
      .select("id, user_id, title, context")
      .single();

    if (!error && session) return session;
    console.warn("[chatbot] DB session create failed, using memory:", error?.message);
  }

  // In-memory fallback
  if (sessionId && memoryStore.sessions.has(sessionId)) {
    return memoryStore.sessions.get(sessionId);
  }

  const newSession = {
    id: randomUUID(),
    user_id: userId,
    title: "New Chat",
    context: {},
  };
  memoryStore.sessions.set(newSession.id, newSession);
  memoryStore.messages.set(newSession.id, []);
  return newSession;
}

/**
 * Lists user's chat sessions (most recent first).
 */
export async function listSessions(userId, limit = 20) {
  const dbOk = await checkTablesExist();

  if (dbOk) {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id, title, context, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (!error) return data || [];
  }

  // Memory fallback
  return [...memoryStore.sessions.values()]
    .filter((s) => s.user_id === userId)
    .slice(0, limit);
}

/**
 * Deletes a chat session and its messages.
 */
export async function deleteSession(userId, sessionId) {
  const dbOk = await checkTablesExist();

  if (dbOk) {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  memoryStore.sessions.delete(sessionId);
  memoryStore.messages.delete(sessionId);
  await deleteCachedKeys([`chat:history:${sessionId}`]);
}

// ── Message History ─────────────────────────────────────────

/**
 * Retrieves recent messages for OpenAI context window.
 */
export async function getHistory(sessionId) {
  const cacheKey = `chat:history:${sessionId}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached;

  const dbOk = await checkTablesExist();

  if (dbOk) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content, tool_calls, tool_call_id")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(MAX_HISTORY_MESSAGES * 2);

    if (!error && data) {
      const messages = data.map((row) => {
        const msg = { role: row.role, content: row.content || "" };
        if (row.tool_calls) msg.tool_calls = row.tool_calls;
        if (row.tool_call_id) msg.tool_call_id = row.tool_call_id;
        return msg;
      });
      const trimmed = messages.slice(-MAX_HISTORY_MESSAGES);
      await setCachedJson(cacheKey, trimmed, SESSION_CACHE_TTL);
      return trimmed;
    }
  }

  // Memory fallback
  const memMsgs = memoryStore.messages.get(sessionId) || [];
  return memMsgs
    .filter((m) => m.role !== "tool")
    .map((m) => ({ role: m.role, content: m.content || "" }))
    .slice(-MAX_HISTORY_MESSAGES);
}

/**
 * Saves multiple messages at once (for tool call chains).
 */
export async function saveMessages(sessionId, messages) {
  // Always save to memory
  const memArr = memoryStore.messages.get(sessionId) || [];
  memArr.push(...messages);
  memoryStore.messages.set(sessionId, memArr);

  const dbOk = await checkTablesExist();

  if (dbOk) {
    const rows = messages.map((msg) => ({
      session_id: sessionId,
      role: msg.role,
      content: msg.content || "",
      tool_calls: msg.tool_calls || null,
      tool_call_id: msg.tool_call_id || null,
      cards: msg.cards || null,
    }));

    const { error } = await supabase.from("chat_messages").insert(rows);
    if (error) {
      console.warn("[chatbot] saveMessages DB error:", error.message);
    }
  }

  await deleteCachedKeys([`chat:history:${sessionId}`]);
}

/**
 * Get full paginated history for the frontend.
 */
export async function getFullHistory(sessionId, page = 1, limit = 50) {
  const dbOk = await checkTablesExist();

  if (dbOk) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, cards, created_at", { count: "exact" })
      .eq("session_id", sessionId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error) {
      return {
        messages: (data || []).reverse(),
        total: count || 0,
        page,
        limit,
      };
    }
  }

  // Memory fallback
  const memMsgs = (memoryStore.messages.get(sessionId) || [])
    .filter((m) => m.role === "user" || m.role === "assistant");

  return {
    messages: memMsgs,
    total: memMsgs.length,
    page: 1,
    limit,
  };
}

/**
 * Updates session context and title.
 */
export async function updateSession(sessionId, updates) {
  // Update memory
  const memSession = memoryStore.sessions.get(sessionId);
  if (memSession) {
    if (updates.title) memSession.title = updates.title;
    if (updates.context) memSession.context = updates.context;
  }

  const dbOk = await checkTablesExist();
  if (!dbOk) return;

  const payload = { updated_at: new Date().toISOString() };
  if (updates.title) payload.title = updates.title;
  if (updates.context) payload.context = updates.context;

  const { error } = await supabase
    .from("chat_sessions")
    .update(payload)
    .eq("id", sessionId);

  if (error) {
    console.warn("[chatbot] updateSession DB error:", error.message);
  }
}
