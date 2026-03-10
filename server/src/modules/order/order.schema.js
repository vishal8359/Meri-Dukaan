import Joi from "joi";

const orderItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const placeOrderSchema = Joi.object({
  storeId: Joi.string().uuid().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("processing", "confirmed", "in-transit", "delivered", "cancelled")
    .required(),
});
