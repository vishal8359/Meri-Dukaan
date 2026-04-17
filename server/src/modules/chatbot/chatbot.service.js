import OpenAI from "openai";
import env from "../../config/env.js";
import AppError from "../../lib/AppError.js";
import * as sessionManager from "./context/session-manager.js";
import * as roleResolver from "./context/role-resolver.js";
import { getToolDefinitions, executeTool } from "./tools/index.js";
import { buildSystemPrompt } from "./prompts/system-prompt.js";

// ── OpenAI Client ────────────────────────────────────────────

let openai;
function getClient() {
  if (!openai) {
    if (!env.openai.apiKey) {
      throw AppError.serviceUnavailable(
        "Chatbot is unavailable. Configure OPENAI_API_KEY environment variable."
      );
    }
    openai = new OpenAI({ apiKey: env.openai.apiKey });
  }
  return openai;
}

const MAX_TOOL_ITERATIONS = 6;

// ── Core Message Processing ──────────────────────────────────

/**
 * Processes a user message through the AI chatbot pipeline.
 *
 * Flow:
 *  1. Resolve user role (customer / shop_owner / delivery_partner)
 *  2. Load or create session
 *  3. Build message context (system prompt + history + new message)
 *  4. Call OpenAI with function tools
 *  5. If tool_calls → execute → feed results back → loop
 *  6. Save all messages to DB
 *  7. Return response with optional rich cards
 */
export async function processMessage(userId, sessionId, message) {
  const client = getClient();

  // 1. Resolve role and context
  const role = await roleResolver.resolve(userId);
  const userContext = await roleResolver.getUserContext(userId, role);

  // 2. Get or create session
  const session = await sessionManager.getOrCreate(userId, sessionId);

  // 3. Build messages array
  const systemPrompt = buildSystemPrompt(role, userContext);
  const history = await sessionManager.getHistory(session.id);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  // 4. Get tool definitions for this role
  const tools = getToolDefinitions(role);

  // 5. AI call loop (handles multi-step tool calling)
  const allCards = [];
  const messagesToSave = [{ role: "user", content: message }];
  let finalContent = "";
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const completionParams = {
      model: env.openai.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    if (tools.length > 0) {
      completionParams.tools = tools;
      completionParams.tool_choice = "auto";
    }

    const completion = await client.chat.completions.create(completionParams);
    const choice = completion.choices[0];
    const assistantMsg = choice.message;

    // Add to messages array for potential next iteration
    messages.push(assistantMsg);

    // No tool calls → final response
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      finalContent = assistantMsg.content || "";

      // Save assistant message
      messagesToSave.push({
        role: "assistant",
        content: finalContent,
        cards: allCards.length > 0 ? allCards : null,
      });
      break;
    }

    // Save the assistant message with tool_calls
    messagesToSave.push({
      role: "assistant",
      content: assistantMsg.content || "",
      tool_calls: assistantMsg.tool_calls,
    });

    // Execute each tool call
    for (const toolCall of assistantMsg.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        args = {};
      }

      const result = await executeTool(
        toolCall.function.name,
        args,
        userId,
        userContext
      );

      // Collect cards from tool results
      if (result.cards && result.cards.length > 0) {
        allCards.push(...result.cards);
      }

      // Feed tool result back to OpenAI
      const toolMessage = {
        role: "tool",
        tool_call_id: toolCall.id,
        content: result.text || JSON.stringify(result),
      };

      messages.push(toolMessage);
      messagesToSave.push({
        role: "tool",
        content: toolMessage.content,
        tool_call_id: toolCall.id,
      });
    }
  }

  // 6. Save all messages to database
  await sessionManager.saveMessages(session.id, messagesToSave);

  // 7. Update session title on first message
  if (!sessionId) {
    const title = message.length > 40
      ? message.substring(0, 40) + "..."
      : message;
    await sessionManager.updateSession(session.id, { title });
  }

  // 8. Generate quick reply suggestions
  const quickReplies = generateQuickReplies(role, finalContent, allCards);

  return {
    sessionId: session.id,
    message: finalContent,
    cards: allCards,
    quickReplies,
    role,
  };
}

/**
 * Get chat history for a session.
 */
export async function getHistory(userId, sessionId, page, limit) {
  // Verify session belongs to user
  const session = await sessionManager.getOrCreate(userId, sessionId);
  if (!session) throw AppError.notFound("Session not found");

  return sessionManager.getFullHistory(session.id, page, limit);
}

/**
 * List user's chat sessions.
 */
export async function listSessions(userId) {
  return sessionManager.listSessions(userId);
}

/**
 * Delete a chat session.
 */
export async function deleteSession(userId, sessionId) {
  return sessionManager.deleteSession(userId, sessionId);
}

// ── Quick Reply Generation ───────────────────────────────────

function generateQuickReplies(role, content, cards) {
  const replies = [];
  const lower = (content || "").toLowerCase();

  // Context-aware suggestions
  if (cards.some((c) => c.type === "product")) {
    replies.push("Add to cart");
    replies.push("Show more products");
  }
  if (cards.some((c) => c.type === "store")) {
    replies.push("Show products");
    replies.push("Show more stores");
  }
  if (cards.some((c) => c.type === "cart")) {
    replies.push("Place order");
    replies.push("Continue shopping");
  }
  if (cards.some((c) => c.type === "order")) {
    replies.push("Track order");
  }

  // Role-based defaults if no context
  if (replies.length === 0) {
    if (role === "customer") {
      replies.push("Search products", "View cart", "Track order");
    } else if (role === "shop_owner") {
      replies.push("View orders", "Store analytics", "Add product");
    } else if (role === "delivery_partner") {
      replies.push("Pending deliveries", "Search products");
    }
  }

  return replies.slice(0, 4);
}
