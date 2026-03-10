import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./service.schema.js";
import * as ctrl from "./service.controller.js";

const router = Router({ mergeParams: true });

router.get("/", ctrl.getStoreServices);
router.get("/:serviceId", ctrl.getService);
router.post("/", protect, validate(schema.addServiceSchema), ctrl.addService);
router.put("/:serviceId", protect, validate(schema.updateServiceSchema), ctrl.updateService);
router.delete("/:serviceId", protect, ctrl.removeService);

export default router;
