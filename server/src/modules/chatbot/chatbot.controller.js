import * as chatbotService from "./chatbot.service.js";

/**
 * POST /api/chat/message
 * Send a message and get AI response.
 */
export const sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;
  const userId = req.user.id;

  const result = await chatbotService.processMessage(userId, sessionId, message);

  res.json({
    success: true,
    data: result,
  });
};

/**
 * GET /api/chat/history/:sessionId
 * Get message history for a session.
 */
export const getHistory = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;

  const result = await chatbotService.getHistory(userId, sessionId, page, limit);

  res.json({
    success: true,
    data: result,
  });
};

/**
 * GET /api/chat/sessions
 * List user's chat sessions.
 */
export const listSessions = async (req, res) => {
  const userId = req.user.id;
  const sessions = await chatbotService.listSessions(userId);

  res.json({
    success: true,
    data: sessions,
  });
};

/**
 * DELETE /api/chat/session/:sessionId
 * Delete a chat session.
 */
export const deleteSession = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  await chatbotService.deleteSession(userId, sessionId);

  res.json({
    success: true,
    message: "Session deleted",
  });
};
