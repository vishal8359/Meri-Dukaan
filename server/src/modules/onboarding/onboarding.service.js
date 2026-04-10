/**
 * Onboarding Service
 *
 * Core business logic for delivery partner onboarding:
 *  - Initiate onboarding (upload docs, enqueue pipeline)
 *  - Get processing status (real-time step progress)
 *  - Submit review (user edits + terms acceptance)
 *  - Get final result
 *  - Retry rejected application
 */
import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";
import { PIPELINE_STEPS } from "./ai-pipeline/index.js";
import { enqueueOnboardingJob } from "./onboarding.queue.js";
import { processOnboardingSync } from "./onboarding.worker.js";
import { maskAadhaar } from "./ai-pipeline/encryption.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Temp upload directory
const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "uploads", "onboarding");

/**
 * Ensure upload directory exists.
 */
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Upload files to Supabase Storage and return public URLs.
 */
async function uploadToStorage(filePath, bucket, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const storagePath = `${fileName}${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType: `image/${ext.replace(".", "") || "jpeg"}`,
      upsert: true,
    });

  if (error) {
    console.warn(`[storage] Upload to ${bucket} failed:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  return urlData?.publicUrl || null;
}

/**
 * Initiate the onboarding process.
 */
async function initiateOnboarding(userId, files, body) {
  ensureUploadDir();

  // Check if user already has an application
  const { data: existing } = await supabase
    .from("delivery_partners")
    .select("id, status")
    .eq("user_id", userId)
    .single();

  if (existing) {
    if (existing.status === "verified") {
      throw AppError.conflict("You are already a verified delivery partner");
    }
    if (existing.status === "processing") {
      throw AppError.conflict("Your application is currently being processed");
    }
    // If pending or rejected, allow re-submission — delete old record
    if (existing.status === "rejected" || existing.status === "pending") {
      await supabase
        .from("onboarding_steps")
        .delete()
        .eq("partner_id", existing.id);
      await supabase
        .from("delivery_partners")
        .delete()
        .eq("id", existing.id);
    }
  }

  // Validate files
  if (!files.aadhaar || !files.aadhaar[0]) {
    throw AppError.badRequest("Aadhaar card image is required");
  }
  if (!files.selfie || !files.selfie[0]) {
    throw AppError.badRequest("Selfie image is required");
  }

  const aadhaarFile = files.aadhaar[0];
  const selfieFile = files.selfie[0];

  // Upload to Supabase Storage
  const timestamp = Date.now();
  const aadhaarUrl = await uploadToStorage(
    aadhaarFile.path,
    "delivery-documents",
    `aadhaar_${userId}_${timestamp}`
  );
  const selfieUrl = await uploadToStorage(
    selfieFile.path,
    "delivery-selfies",
    `selfie_${userId}_${timestamp}`
  );

  // Create delivery partner record
  const { data: partner, error: insertErr } = await supabase
    .from("delivery_partners")
    .insert({
      user_id: userId,
      status: "processing",
      upi_id: body.upiId,
      bank_account_holder: body.bankAccountHolder || null,
      bank_account_number: body.bankAccountNumber || null,
      bank_ifsc: body.bankIfsc || null,
      bank_name: body.bankName || null,
      vehicle_type: body.vehicleType || null,
      aadhaar_image_url: aadhaarUrl,
      selfie_image_url: selfieUrl,
    })
    .select("id")
    .single();

  if (insertErr) throw insertErr;

  // Create pipeline steps for tracking
  const stepInserts = PIPELINE_STEPS.map((step) => ({
    partner_id: partner.id,
    step_name: step.name,
    step_order: step.order,
    status: "pending",
  }));

  await supabase.from("onboarding_steps").insert(stepInserts);

  // Enqueue the AI pipeline job
  const jobData = {
    partnerId: partner.id,
    aadhaarImagePath: aadhaarFile.path,
    selfieImagePath: selfieFile.path,
    upiId: body.upiId,
    bankDetails: {
      bankAccountHolder: body.bankAccountHolder,
      bankAccountNumber: body.bankAccountNumber,
      bankIfsc: body.bankIfsc,
      bankName: body.bankName,
    },
    userId,
  };

  const queueResult = await enqueueOnboardingJob(jobData);

  if (!queueResult) {
    // No Redis — process synchronously (fire-and-forget with async)
    processOnboardingSync(jobData).catch((err) => {
      console.error("[onboarding] Sync processing failed:", err.message);
    });
  }

  return {
    partnerId: partner.id,
    status: "processing",
    message: "Onboarding process started — AI is verifying your documents",
    queued: !!queueResult,
  };
}

/**
 * Get current onboarding status with step-by-step progress.
 */
async function getStatus(userId) {
  const { data: partner, error } = await supabase
    .from("delivery_partners")
    .select("id, status, overall_score, decision_made_at, created_at")
    .eq("user_id", userId)
    .single();

  if (error || !partner) {
    return { hasApplication: false };
  }

  // Get steps
  const { data: steps } = await supabase
    .from("onboarding_steps")
    .select("step_name, step_order, status, result, error_message, started_at, completed_at")
    .eq("partner_id", partner.id)
    .order("step_order", { ascending: true });

  // Map steps to frontend-friendly format
  const mappedSteps = (steps || []).map((step) => {
    const def = PIPELINE_STEPS.find((s) => s.name === step.step_name);
    return {
      name: step.step_name,
      label: def?.label || step.step_name,
      order: step.step_order,
      status: step.status,
      result: step.result,
      error: step.error_message,
      startedAt: step.started_at,
      completedAt: step.completed_at,
    };
  });

  // Calculate progress percentage
  const completedCount = mappedSteps.filter(
    (s) => s.status === "completed" || s.status === "failed"
  ).length;
  const progress = Math.round((completedCount / PIPELINE_STEPS.length) * 100);

  return {
    hasApplication: true,
    partnerId: partner.id,
    status: partner.status,
    overallScore: partner.overall_score,
    progress,
    steps: mappedSteps,
    decisionMadeAt: partner.decision_made_at,
    createdAt: partner.created_at,
  };
}

/**
 * Submit review — user can edit extracted data and accept terms.
 */
async function submitReview(userId, body) {
  const { data: partner, error } = await supabase
    .from("delivery_partners")
    .select("id, status")
    .eq("user_id", userId)
    .single();

  if (error || !partner) {
    throw AppError.notFound("No onboarding application found");
  }

  const updates = {};
  if (body.fullName) updates.full_name = body.fullName;
  if (body.dateOfBirth) updates.date_of_birth = body.dateOfBirth;
  if (body.address) updates.address_extracted = body.address;
  if (body.upiId) updates.upi_id = body.upiId;
  if (body.vehicleType) updates.vehicle_type = body.vehicleType;

  if (body.termsAccepted) {
    updates.terms_accepted = true;
    updates.terms_accepted_at = new Date().toISOString();
  }

  const { data: updated, error: updateErr } = await supabase
    .from("delivery_partners")
    .update(updates)
    .eq("id", partner.id)
    .select("id, status, full_name, terms_accepted")
    .single();

  if (updateErr) throw updateErr;

  return updated;
}

/**
 * Get the final onboarding result with scores and detailed decision.
 */
async function getResult(userId) {
  const { data: partner, error } = await supabase
    .from("delivery_partners")
    .select(`
      id, status, full_name, date_of_birth, age, gender,
      address_extracted, aadhaar_last_four, upi_id,
      bank_account_holder, bank_name, vehicle_type,
      overall_score, aadhaar_authenticity_score, face_match_score,
      age_eligibility_score, upi_validity_score,
      data_consistency_score, image_clarity_score,
      rejection_reasons, decision_made_at, terms_accepted,
      created_at
    `)
    .eq("user_id", userId)
    .single();

  if (error || !partner) {
    throw AppError.notFound("No onboarding application found");
  }

  return {
    partnerId: partner.id,
    status: partner.status,
    profile: {
      fullName: partner.full_name,
      dateOfBirth: partner.date_of_birth,
      age: partner.age,
      gender: partner.gender,
      address: partner.address_extracted,
      aadhaarMasked: partner.aadhaar_last_four
        ? maskAadhaar(partner.aadhaar_last_four)
        : null,
      upiId: partner.upi_id,
      bankAccountHolder: partner.bank_account_holder,
      bankName: partner.bank_name,
      vehicleType: partner.vehicle_type,
    },
    scores: {
      overall: partner.overall_score,
      aadhaarAuthenticity: partner.aadhaar_authenticity_score,
      faceMatch: partner.face_match_score,
      ageEligibility: partner.age_eligibility_score,
      upiValidity: partner.upi_validity_score,
      dataConsistency: partner.data_consistency_score,
      imageClarity: partner.image_clarity_score,
    },
    rejectionReasons: partner.rejection_reasons || [],
    termsAccepted: partner.terms_accepted,
    decisionMadeAt: partner.decision_made_at,
    createdAt: partner.created_at,
  };
}

export {
  initiateOnboarding,
  getStatus,
  submitReview,
  getResult,
};
