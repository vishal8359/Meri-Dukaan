import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./product.schema.js";
import * as ctrl from "./product.controller.js";

const router = Router({ mergeParams: true });

// GET  /api/stores/:id/products
router.get("/", ctrl.getStoreProducts);

// GET  /api/stores/:id/products/:productId
router.get("/:productId", ctrl.getProduct);

// POST /api/stores/:id/products
router.post("/", protect, validate(schema.addProductSchema), ctrl.addProduct);

// PUT  /api/stores/:id/products/:productId
router.put("/:productId", protect, validate(schema.updateProductSchema), ctrl.updateProduct);

// DELETE /api/stores/:id/products/:productId
router.delete("/:productId", protect, ctrl.removeProduct);

// POST   /api/stores/:id/products/:productId/images
router.post("/:productId/images", protect, validate(schema.addProductImageSchema), ctrl.addProductImage);

// DELETE /api/stores/:id/products/:productId/images/:imageId
router.delete("/:productId/images/:imageId", protect, ctrl.removeProductImage);

export default router;
