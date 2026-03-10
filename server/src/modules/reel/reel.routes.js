import { Router } from "express";
import { protect, optionalAuth } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./reel.schema.js";
import * as ctrl from "./reel.controller.js";

// Nested comment routes
import commentRoutes from "../comment/comment.routes.js";

const router = Router({ mergeParams: true });

// GET /api/stores/:id/reels
router.get("/", ctrl.getStoreReels);

// GET /api/stores/:id/reels/:reelId
router.get("/:reelId", ctrl.getReel);

// POST /api/stores/:id/reels
router.post("/", protect, validate(schema.createReelSchema), ctrl.createReel);

// PUT /api/stores/:id/reels/:reelId
router.put("/:reelId", protect, validate(schema.updateReelSchema), ctrl.updateReel);

// DELETE /api/stores/:id/reels/:reelId
router.delete("/:reelId", protect, ctrl.removeReel);

// POST /api/stores/:id/reels/:reelId/engage/:action  (likes, shares, saves, views)
router.post("/:reelId/engage/:action", protect, ctrl.engageReel);

// POST /api/stores/:id/reels/:reelId/watch-time
router.post("/:reelId/watch-time", protect, ctrl.addWatchTime);

// Nested: /api/stores/:id/reels/:reelId/comments
router.use("/:reelId/comments", commentRoutes);

export default router;
