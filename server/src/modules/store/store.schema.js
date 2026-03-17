import Joi from "joi";

export const createStoreSchema = Joi.object({
  storeName: Joi.string().min(2).max(150).required(),
  category: Joi.string().max(100).required(),
  location: Joi.string().max(500).required(),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
});

export const updateStoreSchema = Joi.object({
  storeName: Joi.string().min(2).max(150).optional(),
  category: Joi.string().max(100).optional(),
  location: Joi.string().max(500).optional(),
});

export const updateStoreHoursSchema = Joi.object({
  schedule: Joi.array()
    .items(
      Joi.object({
        dayOfWeek: Joi.string()
          .valid(
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          )
          .required(),
        openingTime: Joi.string()
          .pattern(/^\d{2}:\d{2}$/)
          .optional(),
        closingTime: Joi.string()
          .pattern(/^\d{2}:\d{2}$/)
          .optional(),
        isClosed: Joi.boolean().optional(),
      }),
    )
    .required(),
});

export const addStoreImageSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
});
