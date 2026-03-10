import Joi from "joi";

export const createReelSchema = Joi.object({
  videoUrl: Joi.string().uri().required(),
  description: Joi.string().max(2000).optional(),
});

export const updateReelSchema = Joi.object({
  description: Joi.string().max(2000).optional(),
});
