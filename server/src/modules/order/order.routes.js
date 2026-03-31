import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./order.schema.js";
import * as ctrl from "./order.controller.js";

const router = Router();

router.use(protect);

router.post("/", validate(schema.placeOrderSchema), ctrl.placeOrder);
router.post(
	"/online/create",
	validate(schema.createOnlineOrderSchema),
	ctrl.createOnlineOrder,
);
router.post(
	"/online/verify",
	validate(schema.verifyOnlinePaymentSchema),
	ctrl.verifyOnlinePayment,
);
router.get("/", ctrl.getOrders);
router.get("/store/:storeId", ctrl.getStoreOrders);
router.get("/:id", ctrl.getOrderById);
router.put("/:id/status", validate(schema.updateOrderStatusSchema), ctrl.updateOrderStatus);

export default router;
