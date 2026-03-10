import asyncHandler from "../../lib/asyncHandler.js";
import * as cartService from "./cart.service.js";

export const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getItems(req.user.id);
  res.json(result);
});

export const addToCart = asyncHandler(async (req, res) => {
  const item = await cartService.addItem(req.user.id, req.body.productId, req.body.quantity);
  res.status(201).json({ item });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const item = await cartService.updateItem(req.params.itemId, req.user.id, req.body.quantity);
  res.json({ item });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  await cartService.removeItem(req.params.itemId, req.user.id);
  res.json({ message: "Item removed" });
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clear(req.user.id);
  res.json({ message: "Cart cleared" });
});
