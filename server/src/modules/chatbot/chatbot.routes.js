import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import asyncHandler from "../../lib/asyncHandler.js";
import { sendMessageSchema } from "./chatbot.schema.js";
import * as controller from "./chatbot.controller.js";

const router = Router();

// All chatbot routes require authentication
router.use(protect);

// Send a message to the chatbot
router.post(
  "/message",
  validate(sendMessageSchema),
  asyncHandler(controller.sendMessage)
);

// Get chat sessions list
router.get(
  "/sessions",
  asyncHandler(controller.listSessions)
);

// Get message history for a session
router.get(
  "/history/:sessionId",
  asyncHandler(controller.getHistory)
);

// Delete a chat session
router.delete(
  "/session/:sessionId",
  asyncHandler(controller.deleteSession)
);

export default router;
