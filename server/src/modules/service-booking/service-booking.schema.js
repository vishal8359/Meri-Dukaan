import Joi from "joi";

export const createServiceBookingSchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  bookingDate: Joi.date().iso().required(),
  slotStartAt: Joi.date().iso().required(),
  slotEndAt: Joi.date().iso().required(),
  slotLabel: Joi.string().max(80).required(),
});

export const cancelServiceBookingSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const lockedSlotsQuerySchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  bookingDate: Joi.date().iso().required(),
});
