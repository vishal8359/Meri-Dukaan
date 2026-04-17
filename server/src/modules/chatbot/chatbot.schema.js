import Joi from "joi";

export const sendMessageSchema = Joi.object({
  sessionId: Joi.string().uuid().optional().allow(null),
  message: Joi.string().min(1).max(2000).required(),
});

export const getHistorySchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});
