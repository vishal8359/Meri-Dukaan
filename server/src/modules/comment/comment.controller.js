import asyncHandler from "../../lib/asyncHandler.js";
import * as commentService from "./comment.service.js";

export const getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.listByReel(req.params.reelId);
  res.json({ comments });
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.params.reelId, req.user.id, req.body.commentText);
  res.status(201).json({ comment });
});

export const removeComment = asyncHandler(async (req, res) => {
  await commentService.removeComment(req.params.commentId, req.user.id);
  res.json({ message: "Comment removed" });
});

export const likeComment = asyncHandler(async (req, res) => {
  const comment = await commentService.likeComment(req.params.commentId);
  res.json({ comment });
});

export const addReply = asyncHandler(async (req, res) => {
  const reply = await commentService.addReply(req.params.commentId, req.user.id, req.body.replyText);
  res.status(201).json({ reply });
});

export const removeReply = asyncHandler(async (req, res) => {
  await commentService.removeReply(req.params.replyId, req.user.id);
  res.json({ message: "Reply removed" });
});

export const likeReply = asyncHandler(async (req, res) => {
  const reply = await commentService.likeReply(req.params.replyId);
  res.json({ reply });
});
