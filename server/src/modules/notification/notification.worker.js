import { Worker } from "bullmq";
import { NOTIFICATION_QUEUE, getRedisConnection } from "../../lib/notificationQueue.js";
import * as notificationService from "./notification.service.js";
import { sendPushNotification, isFcmReady } from "../../lib/fcm.js";
import env from "../../config/env.js";

let worker = null;

export function startNotificationWorker() {
  const connection = getRedisConnection();
  if (!connection) {
    if (env.isDev) {
      console.info("[notification-worker] No Redis — worker skipped (sync fallback active)");
    }
    return null;
  }

  try {
    worker = new Worker(
      NOTIFICATION_QUEUE,
      async (job) => {
        const { userId, notification } = job.data;

        // 1. Persist notification to DB
        const saved = await notificationService.create(userId, notification);

        // 2. Send FCM push if configured
        if (isFcmReady()) {
          const tokens = await notificationService.getDeviceTokens(userId);
          for (const { token } of tokens) {
            try {
              await sendPushNotification(token, {
                title: notification.title,
                body: notification.body,
                data: {
                  notificationId: saved.id,
                  type: notification.type,
                  route: notification.route || "",
                },
              });
            } catch (err) {
              if (err.code === "TOKEN_INVALID") {
                await notificationService.removeDeviceToken(userId, token);
              }
            }
          }
        }

        return { id: saved.id };
      },
      { connection, concurrency: 5 },
    );

    worker.on("failed", (job, err) => {
      console.error(
        `[notification-worker] Job ${job?.id} failed:`,
        err.message,
      );
    });

    if (env.isDev) {
      worker.on("completed", (job) => {
        console.info(`[notification-worker] Job ${job.id} completed`);
      });
    }

    console.info("[notification-worker] Started");
  } catch (err) {
    console.warn("[notification-worker] Could not start:", err.message);
  }

  return worker;
}
