import asyncHandler from "../../lib/asyncHandler.js";
import * as reelService from "./reel.service.js";
import * as storeService from "../store/store.service.js";

export const getStoreReels = asyncHandler(async (req, res) => {
  const reels = await reelService.listByStore(req.params.id);
  res.json({ reels });
});

export const getFeed = asyncHandler(async (req, res) => {
  const result = await reelService.feed(req.query);
  res.json(result);
});

export const getReel = asyncHandler(async (req, res) => {
  const reel = await reelService.findById(req.params.reelId);
  res.json({ reel });
});

export const createReel = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const reel = await reelService.create(req.params.id, req.body);
  res.status(201).json({ reel });
});

export const updateReel = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const reel = await reelService.update(req.params.reelId, req.params.id, req.body);
  res.json({ reel });
});

export const removeReel = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  await reelService.remove(req.params.reelId, req.params.id);
  res.json({ message: "Reel removed" });
});

export const engageReel = asyncHandler(async (req, res) => {
  const engagement = await reelService.incrementEngagement(req.params.reelId, req.params.action);
  res.json({ engagement });
});

export const addWatchTime = asyncHandler(async (req, res) => {
  const engagement = await reelService.addWatchTime(req.params.reelId, req.body.seconds);
  res.json({ engagement });
});
