/**
 * Onboarding Worker
 *
 * BullMQ worker that processes onboarding pipeline jobs.
 * If Redis is not available, provides a synchronous fallback.
 */
import { Worker } from "bullmq";
import env from "../../config/env.js";
import { getRedisConnection } from "../../lib/notificationQueue.js";
import { ONBOARDING_QUEUE } from "./onboarding.queue.js";
import { runPipeline } from "./ai-pipeline/index.js";
import eventBus from "../../lib/eventBus.js";

let worker = null;

/**
 * Start the onboarding worker (if Redis is available).
 */
export function startOnboardingWorker() {
  const redisConnection = getRedisConnection();
  if (!redisConnection) {
    if (env.isDev) {
      console.info("[worker] No Redis — onboarding processing will be synchronous");
    }
    return;
  }

  worker = new Worker(
    ONBOARDING_QUEUE,
    async (job) => {
      const {
        partnerId,
        aadhaarImagePath,
        selfieImagePath,
        panCardImagePath,
        drivingLicenseImagePath,
        upiId,
        bankDetails,
        userId,
      } = job.data;

      console.info(`[onboarding-worker] Processing job ${job.id} for partner ${partnerId}`);

      const result = await runPipeline({
        partnerId,
        aadhaarImagePath,
        selfieImagePath,
        panCardImagePath,
        drivingLicenseImagePath,
        upiId,
        bankDetails,
      });

      // Emit notification event
      if (result.decision === "verified") {
        eventBus.emit("onboarding:verified", {
          userId,
          partnerId,
          score: result.overallScore,
        });
      } else {
        eventBus.emit("onboarding:rejected", {
          userId,
          partnerId,
          reasons: result.rejectionReasons,
          score: result.overallScore,
        });
      }

      console.info(
        `[onboarding-worker] Job ${job.id} completed: ${result.decision} (score: ${result.overallScore})`
      );

      return result;
    },
    {
      connection: redisConnection,
      concurrency: 2, // process 2 jobs at once max
      limiter: {
        max: 5,
        duration: 60_000, // max 5 jobs per minute (rate limit API calls)
      },
    }
  );

  worker.on("completed", (job) => {
    if (env.isDev) {
      console.info(`[onboarding-worker] Job ${job.id} finished successfully`);
    }
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[onboarding-worker] Job ${job?.id} failed:`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("[onboarding-worker] Worker error:", err.message);
  });

  if (env.isDev) {
    console.info("[worker] Onboarding pipeline worker started");
  }
}

/**
 * Process an onboarding job synchronously (fallback when no Redis).
 */
export async function processOnboardingSync(jobData) {
  const { partnerId, aadhaarImagePath, selfieImagePath, panCardImagePath, drivingLicenseImagePath, upiId, bankDetails, userId } =
    jobData;

  console.info(`[onboarding-sync] Processing for partner ${partnerId}`);

  const result = await runPipeline({
    partnerId,
    aadhaarImagePath,
    selfieImagePath,
    panCardImagePath,
    drivingLicenseImagePath,
    upiId,
    bankDetails,
  });

  // Emit notification event
  if (result.decision === "verified") {
    eventBus.emit("onboarding:verified", {
      userId,
      partnerId,
      score: result.overallScore,
    });
  } else {
    eventBus.emit("onboarding:rejected", {
      userId,
      partnerId,
      reasons: result.rejectionReasons,
      score: result.overallScore,
    });
  }

  return result;
}

export function getOnboardingWorker() {
  return worker;
}
