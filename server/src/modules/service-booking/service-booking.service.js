import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";
import eventBus from "../../lib/eventBus.js";
import env from "../../config/env.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const SERVICE_LOCK_DURATION_MS = 3 * 60 * 1000;

function getRazorpayClient() {
  const keyId = env.razorpay.keyId;
  const keySecret = env.razorpay.keySecret;

  if (!keyId || !keySecret) {
    throw AppError.serviceUnavailable(
      "Online payment is unavailable. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function markExpiredBookingsAsCompleted() {
  // Fire-and-forget housekeeping.  Both queries use partial indexes
  // (idx_service_bookings_pending_lock, idx_service_bookings_booked_end)
  // so they touch only the relevant rows, not the whole table.
  const nowIso = new Date().toISOString();

  const [{ error: pendingError }, { error: bookedError }] = await Promise.all([
    supabase
      .from("service_bookings")
      .update({ status: "cancelled", cancelled_at: nowIso })
      .eq("status", "pending")
      .lte("lock_expires_at", nowIso),
    supabase
      .from("service_bookings")
      .update({ status: "completed", completed_at: nowIso })
      .eq("status", "booked")
      .lte("slot_end_at", nowIso),
  ]);

  if (pendingError) throw pendingError;
  if (bookedError) throw bookedError;
}

function normalizeIso(value) {
  return new Date(value).toISOString();
}

function normalizeBookingDate(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw AppError.badRequest("Invalid booking date");
  }

  return parsed.toISOString().slice(0, 10);
}

function assertValidSlotWindow(slotStartAt, slotEndAt) {
  const start = new Date(slotStartAt);
  const end = new Date(slotEndAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw AppError.badRequest("Invalid slot date-time");
  }

  if (end <= start) {
    throw AppError.badRequest("Slot end must be after slot start");
  }

  if (start <= new Date()) {
    throw AppError.badRequest("Slot start must be in the future");
  }
}

async function assertServiceBookable(serviceId) {
  const { data: service, error } = await supabase
    .from("services")
    .select("id, store_id, name, price, shown, availability")
    .eq("id", serviceId)
    .single();

  if (error || !service || !service.shown || !service.availability) {
    throw AppError.badRequest("Service is not available for booking");
  }

  return service;
}

async function createLock(
  userId,
  { serviceId, bookingDate, slotStartAt, slotEndAt, slotLabel },
) {
  await markExpiredBookingsAsCompleted();
  assertValidSlotWindow(slotStartAt, slotEndAt);
  const bookingDateValue = normalizeBookingDate(bookingDate);

  const service = await assertServiceBookable(serviceId);
  const amountPaise = Math.round(Number(service.price || 0) * 100);

  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    throw AppError.badRequest("Service price must be greater than zero");
  }

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `svc_${Date.now()}`,
    notes: {
      serviceId: String(service.id),
      userId: String(userId),
      bookingDate: bookingDateValue,
      slotLabel: String(slotLabel || ""),
    },
  });

  const lockExpiresAt = new Date(Date.now() + SERVICE_LOCK_DURATION_MS).toISOString();

  const payload = {
    user_id: userId,
    store_id: service.store_id,
    service_id: service.id,
    booking_date: bookingDateValue,
    slot_start_at: normalizeIso(slotStartAt),
    slot_end_at: normalizeIso(slotEndAt),
    slot_label: slotLabel,
    status: "pending",
    lock_expires_at: lockExpiresAt,
    payment_method: "online",
    payment_status: "pending",
    razorpay_order_id: razorpayOrder.id,
  };

  const { data, error } = await supabase
    .from("service_bookings")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw AppError.conflict("This time slot is already locked or booked");
    }
    throw error;
  }

  return {
    localBookingId: data.id,
    lockExpiresAt,
    checkout: {
      keyId: env.razorpay.keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Sangam App",
      description: `${service.name} booking`,
    },
  };
}

async function verifyLockedPayment(
  userId,
  { localBookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature },
) {
  await markExpiredBookingsAsCompleted();

  const keySecret = env.razorpay.keySecret;
  if (!keySecret) {
    throw AppError.serviceUnavailable(
      "Online payment verification is unavailable.",
    );
  }

  const { data: booking, error } = await supabase
    .from("service_bookings")
    .select("*")
    .eq("id", localBookingId)
    .eq("user_id", userId)
    .single();

  if (error || !booking) throw AppError.notFound("Booking lock not found");
  if (booking.razorpay_order_id !== razorpayOrderId) {
    throw AppError.badRequest("Razorpay order id mismatch");
  }
  if (booking.status !== "pending") {
    throw AppError.badRequest("Booking is no longer awaiting payment");
  }

  const nowMs = Date.now();
  if (
    booking.lock_expires_at &&
    Number.isFinite(new Date(booking.lock_expires_at).getTime()) &&
    new Date(booking.lock_expires_at).getTime() <= nowMs
  ) {
    await supabase
      .from("service_bookings")
      .update({
        status: "cancelled",
        payment_status: "failed",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", localBookingId)
      .eq("user_id", userId)
      .eq("status", "pending");

    throw AppError.conflict("Slot lock expired. Please book again.");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    await supabase
      .from("service_bookings")
      .update({
        payment_status: "failed",
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", localBookingId)
      .eq("user_id", userId)
      .eq("status", "pending");
    throw AppError.badRequest("Invalid Razorpay payment signature");
  }

  const { data: updated, error: updateErr } = await supabase
    .from("service_bookings")
    .update({
      status: "booked",
      payment_status: "paid",
      payment_method: "online",
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      lock_expires_at: null,
    })
    .eq("id", localBookingId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select("*, service:services(id, name), store:stores(id, store_name)")
    .single();

  if (updateErr || !updated) {
    throw updateErr || AppError.badRequest("Payment verification failed");
  }

  eventBus.emit("booking.payment_verified", { userId, booking: updated });

  return updated;
}

async function createBooking(
  userId,
  { serviceId, bookingDate, slotStartAt, slotEndAt, slotLabel },
) {
  await markExpiredBookingsAsCompleted();
  assertValidSlotWindow(slotStartAt, slotEndAt);
  const bookingDateValue = normalizeBookingDate(bookingDate);

  const service = await assertServiceBookable(serviceId);

  const payload = {
    user_id: userId,
    store_id: service.store_id,
    service_id: service.id,
    booking_date: bookingDateValue,
    slot_start_at: normalizeIso(slotStartAt),
    slot_end_at: normalizeIso(slotEndAt),
    slot_label: slotLabel,
    status: "booked",
  };

  const { data, error } = await supabase
    .from("service_bookings")
    .insert(payload)
    .select("*, service:services(id, name), store:stores(id, store_name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw AppError.conflict("This time slot is already booked");
    }
    throw error;
  }

  eventBus.emit("booking.created", { userId, booking: data });

  return data;
}

async function listMyBookings(userId) {
  await markExpiredBookingsAsCompleted();

  const { data, error } = await supabase
    .from("service_bookings")
    .select("*, service:services(id, name), store:stores(id, store_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function listBookingsByStore(storeId, ownerId) {
  await markExpiredBookingsAsCompleted();

  // Verify the caller owns this store
  const { data: store, error: storeErr } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_id", ownerId)
    .single();

  if (storeErr || !store) {
    throw AppError.forbidden("You do not own this store");
  }

  const { data, error } = await supabase
    .from("service_bookings")
    .select("*, service:services(id, name, price), store:stores(id, store_name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function cancelBooking(userId, bookingId) {
  await markExpiredBookingsAsCompleted();

  const { data, error } = await supabase
    .from("service_bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", userId)
    .in("status", ["booked", "pending"])
    .select("*, service:services(id, name), store:stores(id, store_name)")
    .single();

  if (error || !data) {
    throw AppError.notFound("Active booking not found or already closed");
  }

  eventBus.emit("booking.cancelled", { userId, booking: data });

  return data;
}

async function getLockedSlots({ serviceId, bookingDate }) {
  await markExpiredBookingsAsCompleted();
  const bookingDateValue = normalizeBookingDate(bookingDate);
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("service_bookings")
    .select("id, slot_start_at, slot_end_at, slot_label")
    .eq("service_id", serviceId)
    .eq("booking_date", bookingDateValue)
    .or(`status.eq.booked,and(status.eq.pending,lock_expires_at.gt.${nowIso})`)
    .order("slot_start_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export {
  createBooking,
  createLock,
  verifyLockedPayment,
  listMyBookings,
  listBookingsByStore,
  cancelBooking,
  getLockedSlots,
};
