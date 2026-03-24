import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().trim().max(255).allow("", null).optional(),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({ "string.pattern.base": "Phone must be a 10-digit number" }),
  password: Joi.string().min(6).max(128).required(),
  profileImage: Joi.string().uri().optional(),
  location: Joi.string().max(500).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const sendOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({ "string.pattern.base": "Phone must be a 10-digit number" }),
});

export const verifyOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),
  otp: Joi.string().length(6).required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\d{10}$/).optional(),
  profileImage: Joi.string().uri().optional(),
  location: Joi.string().max(500).optional(),
});

export const setPinSchema = Joi.object({
  pin: Joi.string().pattern(/^\d{4}$/).required(),
});

export const verifyPinSchema = Joi.object({
  pin: Joi.string().pattern(/^\d{4}$/).required(),
});
