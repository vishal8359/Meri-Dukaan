import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./wishlist.schema.js";
import * as ctrl from "./wishlist.controller.js";

const router = Router();

router.use(protect);

router.get("/", ctrl.getWishlist);
router.post("/", validate(schema.addWishlistItemSchema), ctrl.addToWishlist);
router.delete("/:itemId", ctrl.removeFromWishlist);
router.delete("/", ctrl.clearWishlist);

export default router;
