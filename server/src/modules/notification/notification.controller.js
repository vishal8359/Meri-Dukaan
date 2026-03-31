import asyncHandler from "../../lib/asyncHandler.js";
import * as notificationService from "./notification.service.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const [notifications, unreadCount] = await Promise.all([
    notificationService.listByUser(req.user.id, { limit, offset }),
    notificationService.unreadCount(req.user.id),
  ]);

  res.json({ notifications, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(
    req.user.id,
    req.params.id,
  );
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.json({ message: "All notifications marked as read" });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.remove(req.user.id, req.params.id);
  res.status(204).end();
});

export const clearAll = asyncHandler(async (req, res) => {
  await notificationService.clearAll(req.user.id);
  res.status(204).end();
});

export const registerDevice = asyncHandler(async (req, res) => {
  const { token, platform } = req.body;
  await notificationService.registerDeviceToken(
    req.user.id,
    token,
    platform,
  );
  res.status(201).json({ message: "Device registered" });
});

export const unregisterDevice = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await notificationService.removeDeviceToken(req.user.id, token);
  res.status(204).end();
});
