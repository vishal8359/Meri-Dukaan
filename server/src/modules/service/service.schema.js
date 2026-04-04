import Joi from "joi";

export const addServiceSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  price: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().max(2000)).max(5).optional(),
  type: Joi.string().max(100).required(),
  availability: Joi.boolean().default(true),
  timings: Joi.string().max(200).allow("").optional(),
  description: Joi.string().max(1000).optional(),
  service_pattern: Joi.string().max(50).optional(),
  pattern_config: Joi.string().max(5000).optional(),
  pricing_model: Joi.string().max(50).optional(),
  booking_type: Joi.string().max(50).optional(),
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  price: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string().max(2000)).max(5).optional(),
  type: Joi.string().max(100).optional(),
  availability: Joi.boolean().optional(),
  timings: Joi.string().max(200).allow("").optional(),
  description: Joi.string().max(1000).optional(),
  service_pattern: Joi.string().max(50).optional(),
  pattern_config: Joi.string().max(5000).optional(),
  pricing_model: Joi.string().max(50).optional(),
  booking_type: Joi.string().max(50).optional(),
});
