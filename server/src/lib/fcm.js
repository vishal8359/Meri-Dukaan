import { readFileSync } from "fs";
import env from "../config/env.js";

let admin = null;
let fcmReady = false;

const saPath = env.firebase?.serviceAccountPath;

if (saPath) {
  try {
    const mod = await import("firebase-admin");
    admin = mod.default;
    const serviceAccount = JSON.parse(readFileSync(saPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    fcmReady = true;
    console.info("[fcm] Firebase Admin initialized");
  } catch (err) {
    console.warn("[fcm] Firebase Admin not initialized:", err.message);
  }
}

export function isFcmReady() {
  return fcmReady;
}

export async function sendPushNotification(token, { title, body, data = {} }) {
  if (!fcmReady || !admin) return null;

  try {
    const result = await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
      ),
      android: {
        priority: "high",
        notification: { channelId: "default", sound: "default" },
      },
    });
    return result;
  } catch (err) {
    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token"
    ) {
      const error = new Error("Invalid FCM token");
      error.code = "TOKEN_INVALID";
      throw error;
    }
    console.error("[fcm] Send error:", err.message);
    return null;
  }
}
