import { apiRequest } from "./client";

// ── Types ──────────────────────────────────────────

export interface RawNotification {
  id: string;
  user_id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  read: boolean;
  route: string | null;
  meta: Record<string, string> | null;
  created_at: string;
}

interface NotificationsResponse {
  notifications: RawNotification[];
  unreadCount: number;
}

// ── API calls ──────────────────────────────────────

export function getNotifications(token: string, limit = 50, offset = 0) {
  return apiRequest<NotificationsResponse>(
    `/notifications?limit=${limit}&offset=${offset}`,
    { token },
  );
}

export function markRead(token: string, id: string) {
  return apiRequest<{ notification: RawNotification }>(
    `/notifications/${id}/read`,
    { method: "PATCH", token },
  );
}

export function markAllRead(token: string) {
  return apiRequest<{ message: string }>("/notifications/read-all", {
    method: "PATCH",
    token,
  });
}

export function deleteNotification(token: string, id: string) {
  return apiRequest<void>(`/notifications/${id}`, {
    method: "DELETE",
    token,
  });
}

export function clearAll(token: string) {
  return apiRequest<void>("/notifications/all", {
    method: "DELETE",
    token,
  });
}

export function registerDevice(
  token: string,
  deviceToken: string,
  platform: "android" | "ios" | "web" = "android",
) {
  return apiRequest<{ message: string }>("/notifications/device", {
    method: "POST",
    token,
    body: { token: deviceToken, platform },
  });
}

export function unregisterDevice(token: string, deviceToken: string) {
  return apiRequest<void>("/notifications/device", {
    method: "DELETE",
    token,
    body: { token: deviceToken },
  });
}
