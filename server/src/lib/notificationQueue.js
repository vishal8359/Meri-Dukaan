import { Queue } from "bullmq";
import env from "../config/env.js";

export const NOTIFICATION_QUEUE = "notifications";

function parseRedisConnection() {
  const url = env.redis.url;
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port) || 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      maxRetriesPerRequest: null, // required by BullMQ
      retryStrategy(times) {
        if (times > 5) return null; // stop retrying after 5 attempts
        return Math.min(times * 1000, 5000);
      },
    };
  } catch {
    return null;
  }
}

const redisConnection = parseRedisConnection();

let queue = null;

if (redisConnection) {
  try {
    queue = new Queue(NOTIFICATION_QUEUE, { connection: redisConnection });
    queue.on("error", () => {}); // suppress unhandled ioredis errors
    if (env.isDev) console.info("[queue] Notification queue created");
  } catch (err) {
    console.warn("[queue] Could not create notification queue:", err.message);
  }
} else if (env.isDev) {
  console.info("[queue] No REDIS_URL — notifications process synchronously");
}

export function getQueue() {
  return queue;
}

export function getRedisConnection() {
  return redisConnection;
}
