import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { createLimiter } from "../../middleware/rateLimiter.js";
import * as schema from "./auth.schema.js";
import * as ctrl from "./auth.controller.js";

const router = Router();

const otpLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests, try again later",
});

router.post("/register", validate(schema.registerSchema), ctrl.register);
router.post("/login", validate(schema.loginSchema), ctrl.login);
router.post("/send-otp", otpLimiter, validate(schema.sendOtpSchema), ctrl.sendOtp);
router.post("/verify-otp", validate(schema.verifyOtpSchema), ctrl.verifyOtp);
router.get("/me", protect, ctrl.getMe);
router.put("/profile", protect, validate(schema.updateProfileSchema), ctrl.updateProfile);

export default router;
