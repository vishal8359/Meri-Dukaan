import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as ctrl from "./notification.controller.js";
import { registerDeviceSchema } from "./notification.schema.js";

const router = Router();

router.use(protect);

// Literal paths first (before parameterised routes)
router.get("/", ctrl.getNotifications);
router.patch("/read-all", ctrl.markAllRead);
router.post("/device", validate(registerDeviceSchema), ctrl.registerDevice);
router.delete("/device", ctrl.unregisterDevice);
router.delete("/all", ctrl.clearAll);

// Parameterised paths
router.patch("/:id/read", ctrl.markRead);
router.delete("/:id", ctrl.deleteNotification);

export default router;
