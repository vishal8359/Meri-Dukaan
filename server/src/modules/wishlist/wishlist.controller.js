import asyncHandler from "../../lib/asyncHandler.js";
import * as wishlistService from "./wishlist.service.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.list(req.user.id);
  res.json({ items });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const item = await wishlistService.add(req.user.id, req.body);
  res.status(201).json({ item });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  await wishlistService.remove(req.user.id, req.params.itemId);
  res.json({ message: "Item removed from wishlist" });
});

export const clearWishlist = asyncHandler(async (req, res) => {
  await wishlistService.clear(req.user.id);
  res.json({ message: "Wishlist cleared" });
});
