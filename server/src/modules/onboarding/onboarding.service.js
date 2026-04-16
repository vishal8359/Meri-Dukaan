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
import { processPartialUpdate } from "./ai-pipeline/partial-updater.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Temp upload directory
const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "uploads", "onboarding");

/**
 * Helper to download an existing Supabase URL to local temp directory.
 */
async function downloadTempUrl(url, prefix) {
  if (!url) return null;
  const fileName = `${prefix}_${Date.now()}.jpg`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (err) {
    console.error(`[storage] Failed to download existing image ${url}:`, err.message);
    throw AppError.internal("Failed to retrieve existing documents");
  }
}

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
    // Clean up steps, but DO NOT delete the primary row.
    if (existing.status === "rejected" || existing.status === "pending") {
      await supabase
        .from("onboarding_steps")
        .delete()
        .eq("partner_id", existing.id);
    }
  }

  // 1. Resolve Aadhaar
  let aadhaarUrl = body.aadhaarUrl || "";
  let aadhaarTempPath = null;
  if (files.aadhaar && files.aadhaar[0]) {
    aadhaarUrl = await uploadToStorage(files.aadhaar[0].path, "delivery-documents", `aadhaar_${userId}_${Date.now()}`);
    aadhaarTempPath = files.aadhaar[0].path;
  } else if (aadhaarUrl && existing) {
    // User is reusing the old url
    aadhaarTempPath = await downloadTempUrl(aadhaarUrl, "dl_aadhaar");
  }
  if (!aadhaarUrl) throw AppError.badRequest("Aadhaar card image is required");

  // 2. Resolve Selfie
  let selfieUrl = body.selfieUrl || "";
  let selfieTempPath = null;
  if (files.selfie && files.selfie[0]) {
    selfieUrl = await uploadToStorage(files.selfie[0].path, "delivery-selfies", `selfie_${userId}_${Date.now()}`);
    selfieTempPath = files.selfie[0].path;
  } else if (selfieUrl && existing) {
    selfieTempPath = await downloadTempUrl(selfieUrl, "dl_selfie");
  }
  if (!selfieUrl) throw AppError.badRequest("Selfie image is required");

  // 3. Resolve PAN Card
  let panCardUrl = body.panCardUrl || "";
  let panCardTempPath = null;
  if (files.panCard && files.panCard[0]) {
    panCardUrl = await uploadToStorage(files.panCard[0].path, "delivery-documents", `pan_${userId}_${Date.now()}`);
    panCardTempPath = files.panCard[0].path;
  } else if (panCardUrl && existing) {
    panCardTempPath = await downloadTempUrl(panCardUrl, "dl_pan");
  }
  if (!panCardUrl) throw AppError.badRequest("PAN Card image is required");

  // 4. Resolve Driving License
  const isMotorized = body.vehicleType && !["Walk", "Bicycle"].includes(body.vehicleType);
  let drivingLicenseUrl = body.drivingLicenseUrl || "";
  let drivingLicenseTempPath = null;
  if (files.drivingLicense && files.drivingLicense[0]) {
    drivingLicenseUrl = await uploadToStorage(files.drivingLicense[0].path, "delivery-documents", `license_${userId}_${Date.now()}`);
    drivingLicenseTempPath = files.drivingLicense[0].path;
  } else if (drivingLicenseUrl && existing) {
    drivingLicenseTempPath = await downloadTempUrl(drivingLicenseUrl, "dl_license");
  }
  if (isMotorized && !drivingLicenseUrl) {
    throw AppError.badRequest("Driving License is required for motorized vehicles");
  }

  // Delivery radius logic
  let maxDeliveryRadiusKm = null;
  if (body.vehicleType === "Walk") maxDeliveryRadiusKm = 1.3;
  else if (body.vehicleType === "Bicycle") maxDeliveryRadiusKm = 5.0;

  // Upsert delivery partner record
  const updatePayload = {
    user_id: userId,
    status: "processing",
    upi_id: body.upiId,
    bank_account_holder: body.bankAccountHolder || null,
    bank_account_number: body.bankAccountNumber || null,
    bank_ifsc: body.bankIfsc || null,
    bank_name: body.bankName || null,
    vehicle_type: body.vehicleType || "Walk",
    max_delivery_radius_km: maxDeliveryRadiusKm,
    aadhaar_image_url: aadhaarUrl,
    selfie_image_url: selfieUrl,
    pan_card_image_url: panCardUrl,
    driving_license_image_url: drivingLicenseUrl || null,
  };

  let partnerId;
  if (existing) {
    const { data, error } = await supabase.from("delivery_partners").update(updatePayload).eq("id", existing.id).select("id").single();
    if (error) throw error;
    partnerId = data.id;
  } else {
    const { data, error } = await supabase.from("delivery_partners").insert(updatePayload).select("id").single();
    if (error) throw error;
    partnerId = data.id;
  }

  // Create pipeline steps for tracking
  const stepInserts = PIPELINE_STEPS.map((step) => ({
    partner_id: partnerId,
    step_name: step.name,
    step_order: step.order,
    status: "pending",
  }));
  await supabase.from("onboarding_steps").insert(stepInserts);

  // Enqueue the AI pipeline job
  const jobData = {
    partnerId: partnerId,
    aadhaarImagePath: aadhaarTempPath,
    selfieImagePath: selfieTempPath,
    panCardImagePath: panCardTempPath,
    drivingLicenseImagePath: drivingLicenseTempPath,
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
    partnerId: partnerId,
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
      created_at,
      aadhaar_image_url, selfie_image_url, pan_card_image_url, driving_license_image_url
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
      aadhaarImageUrl: partner.aadhaar_image_url,
      selfieImageUrl: partner.selfie_image_url,
      panCardImageUrl: partner.pan_card_image_url,
      drivingLicenseImageUrl: partner.driving_license_image_url,
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

/**
 * Manually cancel an ongoing onboarding pipeline.
 */
async function cancelOnboarding(userId) {
  const { data: partner, error } = await supabase
    .from("delivery_partners")
    .select("id, status")
    .eq("user_id", userId)
    .single();

  if (error || !partner) {
    throw AppError.notFound("No onboarding application found to cancel");
  }

  if (partner.status === "verified" || partner.status === "rejected") {
    throw AppError.badRequest("Application is already finalized");
  }

  // Update status to rejected with cancelled reason so it can be safely retried
  const { data: updated, error: updateErr } = await supabase
    .from("delivery_partners")
    .update({
      status: "rejected",
      rejection_reasons: [
        {
          code: "CANCELLED_BY_USER",
          message: "Verification was cancelled by the user.",
          suggestion: "Click 'Try Again' to resume where you left off.",
        },
      ],
      decision_made_at: new Date().toISOString(),
    })
    .eq("id", partner.id)
    .select("id, status")
    .single();

  if (updateErr) throw updateErr;

  return { message: "Verification cancelled successfully", status: updated.status };
}

/**
 * Manually update a specific detail (used for partial resubmission / updates).
 */
async function updateSpecificDetail(userId, field, file, value, body) {
  const { data: partner, error } = await supabase
    .from("delivery_partners")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !partner) {
    throw AppError.notFound("No onboarding application found to update");
  }

  ensureUploadDir();

  let tempPath = null;
  let newUrl = null;

  // Resolve new image target
  if (file) {
    let bucket = "delivery-documents";
    if (field === "selfie") bucket = "delivery-selfies";
    newUrl = await uploadToStorage(file.path, bucket, `${field}_${userId}_update_${Date.now()}`);
    tempPath = file.path;
  }

  let oldSelfiePath = null;
  let oldAadhaarPath = null;

  // If we need cross-referencing for face match
  if (field === "aadhaar" && partner.selfie_image_url) {
    oldSelfiePath = await downloadTempUrl(partner.selfie_image_url, "dl_selfie");
  }
  if (field === "selfie" && partner.aadhaar_image_url) {
    oldAadhaarPath = await downloadTempUrl(partner.aadhaar_image_url, "dl_aadhaar");
  }

  // Call the isolated partial updater
  const partialResult = await processPartialUpdate({
    partner,
    field,
    value: value || body.value,
    imagePath: tempPath,
    oldSelfiePath,
    oldAadhaarPath,
  });

  if (partialResult.errors && partialResult.errors.length > 0) {
    throw AppError.badRequest("Verification failed: " + partialResult.errors[0]);
  }

  // Set the new URLs in the updates object if a file was provided
  const updates = partialResult.updates;
  if (newUrl) {
    if (field === "aadhaar") updates.aadhaar_image_url = newUrl;
    if (field === "selfie") updates.selfie_image_url = newUrl;
    if (field === "panCard") updates.pan_card_image_url = newUrl;
    if (field === "drivingLicense") updates.driving_license_image_url = newUrl;
  }

  updates.decision_made_at = new Date().toISOString();

  // Commit updates to DB
  const { error: updateErr } = await supabase
    .from("delivery_partners")
    .update(updates)
    .eq("id", partner.id);

  if (updateErr) throw updateErr;

  return {
    success: true,
    message: "Detail updated and verified",
    decision: updates.status,
    overallScore: updates.overall_score
  };
}

export {
  initiateOnboarding,
  getStatus,
  submitReview,
  getResult,
  cancelOnboarding,
  updateSpecificDetail,
};

