import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./comment.schema.js";
import * as ctrl from "./comment.controller.js";

const router = Router({ mergeParams: true });

// GET    /api/stores/:id/reels/:reelId/comments
router.get("/", ctrl.getComments);

// POST   /api/stores/:id/reels/:reelId/comments
router.post("/", protect, validate(schema.addCommentSchema), ctrl.addComment);

// DELETE /api/stores/:id/reels/:reelId/comments/:commentId
router.delete("/:commentId", protect, ctrl.removeComment);

// POST   /api/stores/:id/reels/:reelId/comments/:commentId/like
router.post("/:commentId/like", protect, ctrl.likeComment);

// POST   /api/stores/:id/reels/:reelId/comments/:commentId/replies
router.post("/:commentId/replies", protect, validate(schema.addReplySchema), ctrl.addReply);

// DELETE /api/stores/:id/reels/:reelId/comments/:commentId/replies/:replyId
router.delete("/:commentId/replies/:replyId", protect, ctrl.removeReply);

// POST   /api/stores/:id/reels/:reelId/comments/:commentId/replies/:replyId/like
router.post("/:commentId/replies/:replyId/like", protect, ctrl.likeReply);

export default router;
