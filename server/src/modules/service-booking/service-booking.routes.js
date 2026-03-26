import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import * as schema from "./service-booking.schema.js";
import * as ctrl from "./service-booking.controller.js";

const router = Router();

router.get("/locked-slots", validate(schema.lockedSlotsQuerySchema, "query"), ctrl.getLockedServiceSlots);
router.use(protect);
router.post("/", validate(schema.createServiceBookingSchema), ctrl.createServiceBooking);
router.get("/me", ctrl.getMyServiceBookings);
router.put("/:id/cancel", validate(schema.cancelServiceBookingSchema, "params"), ctrl.cancelServiceBooking);

export default router;
