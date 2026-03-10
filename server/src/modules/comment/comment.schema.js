import Joi from "joi";

export const addCommentSchema = Joi.object({
  commentText: Joi.string().min(1).max(2000).required(),
});

export const addReplySchema = Joi.object({
  replyText: Joi.string().min(1).max(2000).required(),
});
