import { createClient } from "redis";
import env from "../config/env.js";

const memoryStore = new Map();
let redisClient = null;
let redisReady = false;

if (env.redis.url) {
  redisClient = createClient({ url: env.redis.url });

  redisClient.on("error", (error) => {
    redisReady = false;
    if (env.isDev) {
      console.warn("[cache] Redis unavailable, using in-memory fallback:", error.message);
    }
  });

  redisClient
    .connect()
    .then(() => {
      redisReady = true;
      if (env.isDev) {
        console.info("[cache] Redis connected");
      }
    })
    .catch(() => {
      redisReady = false;
      if (env.isDev) {
        console.warn("[cache] Failed to connect Redis, using in-memory fallback");
      }
    });
}

function getTtlSeconds(ttlSeconds) {
  if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
    return Math.floor(ttlSeconds);
  }

  if (Number.isFinite(env.redis.ttlSeconds) && env.redis.ttlSeconds > 0) {
    return Math.floor(env.redis.ttlSeconds);
  }

  return 120;
}

export async function getCachedJson(key) {
  if (redisClient && redisReady) {
    const payload = await redisClient.get(key);
    return payload ? JSON.parse(payload) : null;
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return entry.value;
}

export async function setCachedJson(key, value, ttlSeconds) {
  const effectiveTtl = getTtlSeconds(ttlSeconds);

  if (redisClient && redisReady) {
    await redisClient.set(key, JSON.stringify(value), {
      EX: effectiveTtl,
    });
    return;
  }

  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + effectiveTtl * 1000,
  });
}

export async function deleteCachedKeys(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return;

  if (redisClient && redisReady) {
    await redisClient.del(keys);
    return;
  }

  keys.forEach((key) => memoryStore.delete(key));
}
