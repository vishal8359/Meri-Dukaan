/**
 * Onboarding Schema — Joi validation
 */
import Joi from "joi";

export const uploadSchema = Joi.object({
  upiId: Joi.string().required().messages({
    "any.required": "UPI ID is required",
  }),
  bankAccountHolder: Joi.string().allow("", null),
  bankAccountNumber: Joi.string().allow("", null),
  bankIfsc: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/i)
    .allow("", null)
    .messages({
      "string.pattern.base": "Invalid IFSC code format",
    }),
  bankName: Joi.string().allow("", null),
  vehicleType: Joi.string()
    .valid("Bicycle", "Bike", "Auto", "Mini Truck")
    .allow("", null),
});

export const reviewSchema = Joi.object({
  fullName: Joi.string().allow("", null),
  dateOfBirth: Joi.string().allow("", null),
  address: Joi.string().allow("", null),
  upiId: Joi.string().allow("", null),
  vehicleType: Joi.string()
    .valid("Bicycle", "Bike", "Auto", "Mini Truck")
    .allow("", null),
  termsAccepted: Joi.boolean().required().valid(true).messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms acceptance is required",
  }),
});
