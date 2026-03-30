import asyncHandler from "../../lib/asyncHandler.js";
import * as serviceBookingService from "./service-booking.service.js";

export const createServiceBooking = asyncHandler(async (req, res) => {
  const booking = await serviceBookingService.createBooking(req.user.id, req.body);
  res.status(201).json({ booking });
});

export const lockServiceBooking = asyncHandler(async (req, res) => {
  const lock = await serviceBookingService.createLock(req.user.id, req.body);
  res.status(201).json(lock);
});

export const verifyServiceBookingPayment = asyncHandler(async (req, res) => {
  const booking = await serviceBookingService.verifyLockedPayment(
    req.user.id,
    req.body,
  );
  res.json({ booking, message: "Payment verified successfully" });
});

export const getMyServiceBookings = asyncHandler(async (req, res) => {
  const bookings = await serviceBookingService.listMyBookings(req.user.id);
  res.json({ bookings });
});

export const cancelServiceBooking = asyncHandler(async (req, res) => {
  const booking = await serviceBookingService.cancelBooking(
    req.user.id,
    req.params.id,
  );
  res.json({ booking });
});

export const getLockedServiceSlots = asyncHandler(async (req, res) => {
  const slots = await serviceBookingService.getLockedSlots(req.query);
  res.json({ slots });
});
