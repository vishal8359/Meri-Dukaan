import { Router } from "express";
import { protect, optionalAuth } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./store.schema.js";
import * as ctrl from "./store.controller.js";

// Nested sub-resources
import productRoutes from "../product/product.routes.js";
import serviceRoutes from "../service/service.routes.js";
import inventoryRoutes from "../inventory/inventory.routes.js";
import reelRoutes from "../reel/reel.routes.js";

const router = Router();

// Public
router.get("/", optionalAuth, ctrl.getStores);
router.get("/:id", optionalAuth, ctrl.getStoreById);

// Protected
router.post("/", protect, validate(schema.createStoreSchema), ctrl.createStore);
router.put("/:id", protect, validate(schema.updateStoreSchema), ctrl.updateStore);

// Store images
router.post("/:id/images", protect, validate(schema.addStoreImageSchema), ctrl.addStoreImage);
router.delete("/:id/images/:imageId", protect, ctrl.removeStoreImage);

// Nested module routes: /api/stores/:id/products, /services, /inventory, /reels
router.use("/:id/products", productRoutes);
router.use("/:id/services", serviceRoutes);
router.use("/:id/inventory", inventoryRoutes);
router.use("/:id/reels", reelRoutes);

export default router;
