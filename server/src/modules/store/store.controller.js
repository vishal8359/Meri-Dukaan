import asyncHandler from "../../lib/asyncHandler.js";
import * as storeService from "./store.service.js";

export const getStores = asyncHandler(async (req, res) => {
  const result = await storeService.list(req.query);
  res.json(result);
});

export const getStoreById = asyncHandler(async (req, res) => {
  const store = await storeService.findById(req.params.id);
  res.json({ store });
});

export const getMyStore = asyncHandler(async (req, res) => {
  const store = await storeService.findByOwner(req.user.id);
  res.json({ store });
});

export const createStore = asyncHandler(async (req, res) => {
  const store = await storeService.create(req.user.id, req.body);
  res.status(201).json({ store });
});

export const updateStore = asyncHandler(async (req, res) => {
  const store = await storeService.update(req.params.id, req.user.id, req.body);
  res.json({ store });
});

export const addStoreImage = asyncHandler(async (req, res) => {
  const image = await storeService.addImage(req.params.id, req.user.id, req.body.imageUrl);
  res.status(201).json({ image });
});

export const removeStoreImage = asyncHandler(async (req, res) => {
  await storeService.removeImage(req.params.imageId, req.user.id);
  res.json({ message: "Image removed" });
});
