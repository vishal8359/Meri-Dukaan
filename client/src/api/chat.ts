import { apiRequest } from "./client";

// ── Types ────────────────────────────────────────────────────

export interface ChatCard {
  type: "product" | "store" | "service" | "cart" | "order" | "delivery";
  data: Record<string, any>;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  cards?: ChatCard[] | null;
  created_at?: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    sessionId: string;
    message: string;
    cards: ChatCard[];
    quickReplies: string[];
    role: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    total: number;
    page: number;
    limit: number;
  };
}

// ── API Functions ────────────────────────────────────────────

export function sendChatMessage(
  token: string,
  message: string,
  sessionId?: string | null
) {
  return apiRequest<ChatResponse>("/chat/message", {
    method: "POST",
    token,
    body: { message, sessionId },
  });
}

export function getChatHistory(token: string, sessionId: string, page = 1) {
  return apiRequest<ChatHistoryResponse>(
    `/chat/history/${sessionId}?page=${page}&limit=50`,
    { token }
  );
}

export function getChatSessions(token: string) {
  return apiRequest<{ success: boolean; data: ChatSession[] }>(
    "/chat/sessions",
    { token }
  );
}

export function deleteChatSession(token: string, sessionId: string) {
  return apiRequest<{ success: boolean }>(`/chat/session/${sessionId}`, {
    method: "DELETE",
    token,
  });
}
