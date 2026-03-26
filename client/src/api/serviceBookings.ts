import { apiRequest } from "./client";

type LockedSlot = {
  id: string;
  slot_start_at: string;
  slot_end_at: string;
  slot_label: string;
};

type BookingPayload = {
  serviceId: string;
  bookingDate: string;
  slotStartAt: string;
  slotEndAt: string;
  slotLabel: string;
};

export function getLockedSlots(serviceId: string, bookingDate: string) {
  const query = `serviceId=${encodeURIComponent(serviceId)}&bookingDate=${encodeURIComponent(bookingDate)}`;
  return apiRequest<{ slots: LockedSlot[] }>(`/service-bookings/locked-slots?${query}`);
}

export function createServiceBooking(token: string, body: BookingPayload) {
  return apiRequest<{ booking: any }>("/service-bookings", {
    method: "POST",
    token,
    body,
  });
}

export function getMyServiceBookings(token: string) {
  return apiRequest<{ bookings: any[] }>("/service-bookings/me", { token });
}

export function cancelServiceBooking(token: string, id: string) {
  return apiRequest<{ booking: any }>(`/service-bookings/${id}/cancel`, {
    method: "PUT",
    token,
  });
}
