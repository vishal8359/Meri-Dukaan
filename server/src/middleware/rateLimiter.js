import rateLimit from "express-rate-limit";

/**
 * Creates a rate-limiter with sensible defaults.
 */
export const createLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message } = {}) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message || "Too many requests, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });
