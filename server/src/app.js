import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// ── Module routes ───────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes.js";
import storeRoutes from "./modules/store/store.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import * as reelService from "./modules/reel/reel.service.js";
import asyncHandler from "./lib/asyncHandler.js";

// ── Express app ─────────────────────────────────────────────
const app = express();

// Core middleware
app.use(helmet());
app.use(cors());
app.use(morgan(env.isDev ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Top-level API routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);   // nests: products, services, inventory, reels → comments
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// A convenience reel-feed endpoint (not store-scoped)
app.get("/api/reels/feed", asyncHandler(async (req, res) => {
  const result = await reelService.feed(req.query);
  res.json(result);
}));

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
