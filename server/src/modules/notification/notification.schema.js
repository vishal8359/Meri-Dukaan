import Joi from "joi";

export const registerDeviceSchema = Joi.object({
  token: Joi.string().min(10).max(500).required(),
  platform: Joi.string().valid("android", "ios", "web").default("android"),
});
