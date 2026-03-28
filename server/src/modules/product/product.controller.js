import asyncHandler from "../../lib/asyncHandler.js";
import * as productService from "./product.service.js";
import * as storeService from "../store/store.service.js";

export const getStoreProducts = asyncHandler(async (req, res) => {
  const products = await productService.listByStore(req.params.id);
  res.json({ products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.findById(req.params.productId);
  res.json({ product });
});

export const addProduct = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const product = await productService.create(req.params.id, req.body);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const product = await productService.update(req.params.productId, req.params.id, req.body);
  res.json({ product });
});

export const removeProduct = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  await productService.remove(req.params.productId, req.params.id);
  res.json({ message: "Product hidden" });
});

export const addProductImage = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const image = await productService.addImage(req.params.productId, req.body.imageUrl);
  res.status(201).json({ image });
});

export const removeProductImage = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  await productService.removeImage(req.params.imageId);
  res.json({ message: "Image removed" });
});
