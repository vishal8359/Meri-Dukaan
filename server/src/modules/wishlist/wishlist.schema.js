import Joi from "joi";

export const addWishlistItemSchema = Joi.object({
  itemId: Joi.string().uuid().required(),
  name: Joi.string().max(200).required(),
  price: Joi.number().min(0).required(),
  type: Joi.string().valid("product", "service", "store").required(),
  description: Joi.string().allow("", null).optional(),
  image: Joi.string().uri().allow("", null).optional(),
  rating: Joi.number().min(0).max(5).allow(null).optional(),
  storeName: Joi.string().max(200).allow("", null).optional(),
  storeId: Joi.string().uuid().allow(null).optional(),
  category: Joi.string().max(100).allow("", null).optional(),
});
