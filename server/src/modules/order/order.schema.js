import Joi from "joi";

const orderItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const placeOrderSchema = Joi.object({
  storeId: Joi.string().uuid().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  paymentMethod: Joi.string().valid("cod").default("cod"),
  deliveryFee: Joi.number().min(0).default(0),
  deliveryAddress: Joi.string().min(5).required(),
  deliveryPhone: Joi.string().min(7).max(20).required(),
});

export const createOnlineOrderSchema = Joi.object({
  storeId: Joi.string().uuid().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  deliveryFee: Joi.number().min(0).default(0),
  deliveryAddress: Joi.string().min(5).required(),
  deliveryPhone: Joi.string().min(7).max(20).required(),
});

export const verifyOnlinePaymentSchema = Joi.object({
  localOrderId: Joi.string().uuid().required(),
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("processing", "in-transit", "delivered", "cancelled")
    .required(),
});
