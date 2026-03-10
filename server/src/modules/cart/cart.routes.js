import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./cart.schema.js";
import * as ctrl from "./cart.controller.js";

const router = Router();

router.use(protect);

router.get("/", ctrl.getCart);
router.post("/", validate(schema.addCartItemSchema), ctrl.addToCart);
router.put("/:itemId", validate(schema.updateCartItemSchema), ctrl.updateCartItem);
router.delete("/:itemId", ctrl.removeCartItem);
router.delete("/", ctrl.clearCart);

export default router;
