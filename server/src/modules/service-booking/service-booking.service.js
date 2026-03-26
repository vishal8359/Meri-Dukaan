import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function markExpiredBookingsAsCompleted() {
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("service_bookings")
    .update({
      status: "completed",
      completed_at: nowIso,
    })
    .eq("status", "booked")
    .lte("slot_end_at", nowIso);

  if (error) throw error;
}

function normalizeIso(value) {
  return new Date(value).toISOString();
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
    .select("id, store_id, name, shown, availability")
    .eq("id", serviceId)
    .single();

  if (error || !service || !service.shown || !service.availability) {
    throw AppError.badRequest("Service is not available for booking");
  }

  return service;
}

async function createBooking(
  userId,
  { serviceId, bookingDate, slotStartAt, slotEndAt, slotLabel },
) {
  await markExpiredBookingsAsCompleted();
  assertValidSlotWindow(slotStartAt, slotEndAt);

  const service = await assertServiceBookable(serviceId);

  const payload = {
    user_id: userId,
    store_id: service.store_id,
    service_id: service.id,
    booking_date: bookingDate,
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
    .eq("status", "booked")
    .select("*, service:services(id, name), store:stores(id, store_name)")
    .single();

  if (error || !data) {
    throw AppError.notFound("Active booking not found or already closed");
  }

  return data;
}

async function getLockedSlots({ serviceId, bookingDate }) {
  await markExpiredBookingsAsCompleted();

  const { data, error } = await supabase
    .from("service_bookings")
    .select("id, slot_start_at, slot_end_at, slot_label")
    .eq("service_id", serviceId)
    .eq("booking_date", bookingDate)
    .eq("status", "booked")
    .order("slot_start_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export { createBooking, listMyBookings, cancelBooking, getLockedSlots };
