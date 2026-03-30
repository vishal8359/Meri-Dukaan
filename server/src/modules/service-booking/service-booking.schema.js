import Joi from "joi";

export const createServiceBookingSchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  bookingDate: Joi.date().iso().raw().required(),
  slotStartAt: Joi.date().iso().required(),
  slotEndAt: Joi.date().iso().required(),
  slotLabel: Joi.string().max(80).required(),
});

export const lockServiceBookingSchema = createServiceBookingSchema;

export const verifyServiceBookingPaymentSchema = Joi.object({
  localBookingId: Joi.string().uuid().required(),
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

export const cancelServiceBookingSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const lockedSlotsQuerySchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  bookingDate: Joi.date().iso().raw().required(),
});
