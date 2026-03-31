import asyncHandler from "../../lib/asyncHandler.js";
import * as orderService from "./order.service.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.place(req.user.id, req.body);
  res.status(201).json({ order });
});

export const createOnlineOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOnline(req.user.id, req.body);
  res.status(201).json(result);
});

export const verifyOnlinePayment = asyncHandler(async (req, res) => {
  const order = await orderService.verifyOnlinePayment(req.user.id, req.body);
  res.json({ order, message: "Payment verified successfully" });
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listByUser(req.user.id);
  res.json({ orders });
});

export const getStoreOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listByStore(req.params.storeId, req.user.id);
  res.json({ orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.findById(req.params.id, req.user.id);
  res.json({ order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(
    req.params.id,
    req.user.id,
    req.body.status,
  );
  res.json({ order });
});
