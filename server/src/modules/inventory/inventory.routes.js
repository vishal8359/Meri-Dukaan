import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import * as ctrl from "./inventory.controller.js";

const router = Router({ mergeParams: true });

// GET /api/stores/:id/inventory
router.get("/", protect, ctrl.getInventory);

export default router;
