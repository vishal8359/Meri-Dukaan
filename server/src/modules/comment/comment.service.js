import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

// ── Comments ────────────────────────────────────────────────

async function listByReel(reelId) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, user:users(id, name, profile_image), replies(*, user:users(id, name, profile_image))")
    .eq("reel_id", reelId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addComment(reelId, userId, commentText) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      reel_id: reelId,
      user_id: userId,
      comment_text: commentText,
      likes: 0,
    })
    .select("*, user:users(id, name, profile_image)")
    .single();

  if (error) throw error;
  return data;
}

async function removeComment(commentId, userId) {
  // Only the author can delete their comment
  const { data: comment } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .single();

  if (!comment) throw AppError.notFound("Comment not found");
  if (comment.user_id !== userId) throw AppError.forbidden("Not authorized");

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}

async function likeComment(commentId) {
  const { data: comment } = await supabase
    .from("comments")
    .select("likes")
    .eq("id", commentId)
    .single();

  if (!comment) throw AppError.notFound("Comment not found");

  const { data, error } = await supabase
    .from("comments")
    .update({ likes: comment.likes + 1 })
    .eq("id", commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Replies ─────────────────────────────────────────────────

async function addReply(commentId, userId, replyText) {
  // Verify comment exists
  const { data: comment } = await supabase
    .from("comments")
    .select("id")
    .eq("id", commentId)
    .single();

  if (!comment) throw AppError.notFound("Comment not found");

  const { data, error } = await supabase
    .from("replies")
    .insert({
      comment_id: commentId,
      user_id: userId,
      reply_text: replyText,
      likes: 0,
    })
    .select("*, user:users(id, name, profile_image)")
    .single();

  if (error) throw error;
  return data;
}

async function removeReply(replyId, userId) {
  const { data: reply } = await supabase
    .from("replies")
    .select("id, user_id")
    .eq("id", replyId)
    .single();

  if (!reply) throw AppError.notFound("Reply not found");
  if (reply.user_id !== userId) throw AppError.forbidden("Not authorized");

  const { error } = await supabase.from("replies").delete().eq("id", replyId);
  if (error) throw error;
}

async function likeReply(replyId) {
  const { data: reply } = await supabase
    .from("replies")
    .select("likes")
    .eq("id", replyId)
    .single();

  if (!reply) throw AppError.notFound("Reply not found");

  const { data, error } = await supabase
    .from("replies")
    .update({ likes: reply.likes + 1 })
    .eq("id", replyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export { listByReel, addComment, removeComment, likeComment, addReply, removeReply, likeReply };
