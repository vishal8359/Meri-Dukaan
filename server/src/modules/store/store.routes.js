import { Router } from "express";
import { optionalAuth, protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as ctrl from "./store.controller.js";
import * as schema from "./store.schema.js";

// Nested sub-resources
import inventoryRoutes from "../inventory/inventory.routes.js";
import productRoutes from "../product/product.routes.js";
import reelRoutes from "../reel/reel.routes.js";
import serviceRoutes from "../service/service.routes.js";

const router = Router();

// Public
router.get("/", optionalAuth, ctrl.getStores);
router.get("/catalog", optionalAuth, ctrl.getCatalog);
router.get("/:id", optionalAuth, ctrl.getStoreById);

// Protected
router.get("/me/store", protect, ctrl.getMyStore);
router.post("/", protect, validate(schema.createStoreSchema), ctrl.createStore);
router.put(
  "/:id",
  protect,
  validate(schema.updateStoreSchema),
  ctrl.updateStore,
);
router.delete("/:id", protect, ctrl.removeStore);

// Store hours
router.get("/:id/hours", ctrl.getStoreHours);
router.put(
  "/:id/hours",
  protect,
  validate(schema.updateStoreHoursSchema),
  ctrl.updateStoreHours,
);

// Store images
router.post(
  "/:id/images",
  protect,
  validate(schema.addStoreImageSchema),
  ctrl.addStoreImage,
);
router.delete("/:id/images/:imageId", protect, ctrl.removeStoreImage);

// Nested module routes: /api/stores/:id/products, /services, /inventory, /reels
router.use("/:id/products", productRoutes);
router.use("/:id/services", serviceRoutes);
router.use("/:id/inventory", inventoryRoutes);
router.use("/:id/reels", reelRoutes);

export default router;
