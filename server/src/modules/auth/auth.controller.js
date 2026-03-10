import asyncHandler from "../../lib/asyncHandler.js";
import * as authService from "./auth.service.js";
import env from "../../config/env.js";

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ message: "Registration successful", token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body.email, req.body.password);
  res.json({ message: "Login successful", token, user });
});

export const sendOtp = asyncHandler(async (req, res) => {
  const { otp } = await authService.sendOtp(req.body.phone);
  const response = { message: "OTP sent successfully" };
  if (env.isDev) response.otp = otp;
  res.json(response);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body.phone, req.body.otp);
  res.json(result);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ user });
});
