import Joi from "joi";

export const addProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  type: Joi.string().max(100).required(),
  realPrice: Joi.number().positive().required(),
  offerPrice: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().max(1000).optional(),
  available: Joi.boolean().default(true),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  type: Joi.string().max(100).optional(),
  realPrice: Joi.number().positive().optional(),
  offerPrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(1000).optional(),
  available: Joi.boolean().optional(),
});

export const addProductImageSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
});
