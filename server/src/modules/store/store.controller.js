import asyncHandler from "../../lib/asyncHandler.js";
import * as storeService from "./store.service.js";
import * as authService from "../auth/auth.service.js";

export const getStores = asyncHandler(async (req, res) => {
  const result = await storeService.list(req.query);
  res.json(result);
});

export const getCatalog = asyncHandler(async (req, res) => {
  const result = await storeService.getCatalog(req.query);
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

export const removeStore = asyncHandler(async (req, res) => {
  await authService.verifyPinFromHeaders(req.user.id, req.headers);
  await storeService.remove(req.params.id, req.user.id);
  res.json({ message: "Store hidden" });
});

export const addStoreImage = asyncHandler(async (req, res) => {
  const image = await storeService.addImage(
    req.params.id,
    req.user.id,
    req.body.imageUrl,
  );
  res.status(201).json({ image });
});

export const removeStoreImage = asyncHandler(async (req, res) => {
  await storeService.removeImage(req.params.imageId, req.user.id);
  res.json({ message: "Image removed" });
});

export const getStoreHours = asyncHandler(async (req, res) => {
  const hours = await storeService.getStoreHours(req.params.id);
  res.json({ hours });
});

export const updateStoreHours = asyncHandler(async (req, res) => {
  const hours = await storeService.updateStoreHours(
    req.params.id,
    req.user.id,
    req.body.schedule,
  );
  res.json({ hours });
});

export const getFollowedStores = asyncHandler(async (req, res) => {
  const storeIds = await storeService.getFollowedStoreIds(req.user.id);
  res.json({ storeIds });
});

export const followStore = asyncHandler(async (req, res) => {
  await storeService.followStore(req.user.id, req.params.id);
  res.json({ message: "Store followed successfully" });
});

export const unfollowStore = asyncHandler(async (req, res) => {
  await storeService.unfollowStore(req.user.id, req.params.id);
  res.json({ message: "Store unfollowed successfully" });
});
