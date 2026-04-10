/**
 * Onboarding Queue Setup
 *
 * BullMQ queue for processing onboarding pipeline jobs asynchronously.
 * Falls back to synchronous processing if Redis is not available.
 */
import { Queue } from "bullmq";
import env from "../../config/env.js";
import { getRedisConnection } from "../../lib/notificationQueue.js";

export const ONBOARDING_QUEUE = "onboarding-pipeline";

let queue = null;

const redisConnection = getRedisConnection();

if (redisConnection) {
  try {
    queue = new Queue(ONBOARDING_QUEUE, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 100,
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    });
    queue.on("error", () => {}); // suppress unhandled ioredis errors
    if (env.isDev) console.info("[queue] Onboarding pipeline queue created");
  } catch (err) {
    console.warn("[queue] Could not create onboarding queue:", err.message);
  }
} else if (env.isDev) {
  console.info("[queue] No Redis — onboarding pipeline will process synchronously");
}

/**
 * Add an onboarding job to the queue.
 * @param {Object} jobData
 * @returns {Promise<Object|null>} Job info or null if queued synchronously
 */
export async function enqueueOnboardingJob(jobData) {
  if (!queue) return null; // will be processed synchronously

  const job = await queue.add("process-onboarding", jobData, {
    priority: 1, // high priority
  });

  return { jobId: job.id, queued: true };
}

export function getOnboardingQueue() {
  return queue;
}
