import asyncHandler from "../../lib/asyncHandler.js";
import * as serviceService from "./service.service.js";
import * as storeService from "../store/store.service.js";
import * as authService from "../auth/auth.service.js";

export const getStoreServices = asyncHandler(async (req, res) => {
  const services = await serviceService.listByStore(req.params.id);
  res.json({ services });
});

export const getService = asyncHandler(async (req, res) => {
  const service = await serviceService.findById(req.params.serviceId);
  res.json({ service });
});

export const addService = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const service = await serviceService.create(req.params.id, req.body);
  res.status(201).json({ service });
});

export const updateService = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  const service = await serviceService.update(req.params.serviceId, req.params.id, req.body);
  res.json({ service });
});

export const removeService = asyncHandler(async (req, res) => {
  await storeService.verifyOwnership(req.params.id, req.user.id);
  await authService.verifyPinFromHeaders(req.user.id, req.headers);
  await serviceService.remove(req.params.serviceId, req.params.id);
  res.json({ message: "Service hidden" });
});
