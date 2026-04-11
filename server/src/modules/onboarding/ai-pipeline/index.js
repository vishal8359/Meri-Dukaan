/**
 * AI Pipeline Orchestrator
 *
 * Coordinates the entire onboarding verification pipeline with
 * parallel execution where possible and real-time step tracking.
 *
 * Pipeline flow:
 *  Phase 1 (parallel): OCR + Image Quality + Selfie Face Detection
 *  Phase 2 (parallel): Data Validation + Face extraction
 *  Phase 3 (sequential): Face Matching (Aadhaar vs Selfie)
 *  Phase 4 (sequential): Consistency Check
 *  Phase 5 (sequential): Scoring → Decision
 */
import { extractAadhaarData, extractPanData, extractLicenseData } from "./ocr-extractor.js";
import { detectFace, matchFaces } from "./face-detector.js";
import { analyzeImageQuality } from "./image-analyzer.js";
import { runAllValidations } from "./validator.js";
import { checkConsistency } from "./consistency-checker.js";
import { calculateScore } from "./scoring-engine.js";
import { encryptAadhaar } from "./encryption.js";
import supabase from "../../../config/supabase.js";

// Pipeline step definitions (for tracking)
export const PIPELINE_STEPS = [
  { name: "uploading",        order: 1, label: "Uploading Documents" },
  { name: "extracting_data",  order: 2, label: "Extracting Data (AI/OCR)" },
  { name: "face_verification", order: 3, label: "Face Verification" },
  { name: "validation",       order: 4, label: "Validating Information" },
  { name: "ai_scoring",       order: 5, label: "AI Scoring" },
  { name: "final_decision",   order: 6, label: "Final Decision" },
];

/**
 * Run the full AI processing pipeline.
 *
 * @param {Object} params
 * @param {string} params.partnerId - delivery_partners.id
 * @param {string} params.aadhaarImagePath - Local path to Aadhaar image
 * @param {string} params.selfieImagePath - Local path to selfie image
 * @param {string} params.upiId - User-provided UPI ID
 * @param {Object} params.bankDetails - Optional bank details
 * @returns {Promise<Object>} Final result with decision
 */
export async function runPipeline({
  partnerId,
  aadhaarImagePath,
  selfieImagePath,
  panCardImagePath,
  drivingLicenseImagePath,
  upiId,
  bankDetails = {},
}) {
  const results = {};
  const stepErrors = [];

  try {
    // ── Step 1: Mark upload complete ───────────────────────────
    await updateStep(partnerId, "uploading", "completed", {
      aadhaarImage: true,
      selfieImage: true,
    });

    // ── Step 2: Phase 1 — Parallel (OCR + Image Quality + Selfie Face) ──
    await updateStep(partnerId, "extracting_data", "processing");

    const [ocrResult, selfieQuality, aadhaarQuality, selfieFaceResult, panResult, licenseResult] =
      await Promise.all([
        extractAadhaarData(aadhaarImagePath).catch((err) => {
          stepErrors.push(`OCR failed: ${err.message}`);
          return null;
        }),
        analyzeImageQuality(selfieImagePath).catch((err) => {
          stepErrors.push(`Selfie quality check failed: ${err.message}`);
          return null;
        }),
        analyzeImageQuality(aadhaarImagePath).catch((err) => {
          stepErrors.push(`Aadhaar quality check failed: ${err.message}`);
          return null;
        }),
        detectFace(selfieImagePath).catch((err) => {
          stepErrors.push(`Selfie face detection failed: ${err.message}`);
          return null;
        }),
        panCardImagePath
          ? extractPanData(panCardImagePath).catch((err) => {
              stepErrors.push(`PAN OCR failed: ${err.message}`);
              return null;
            })
          : Promise.resolve(null),
        drivingLicenseImagePath
          ? extractLicenseData(drivingLicenseImagePath).catch((err) => {
              stepErrors.push(`License OCR failed: ${err.message}`);
              return null;
            })
          : Promise.resolve(null),
      ]);

    results.ocr = ocrResult;
    results.panOcr = panResult;
    results.licenseOcr = licenseResult;
    results.selfieQuality = selfieQuality;
    results.aadhaarQuality = aadhaarQuality;
    results.selfieFace = selfieFaceResult;

    if (!ocrResult || ocrResult.error) {
      await updateStep(partnerId, "extracting_data", "failed", null, "OCR extraction failed");
      throw new Error("OCR extraction failed — could not read Aadhaar card");
    }

    await updateStep(partnerId, "extracting_data", "completed", {
      name: ocrResult.fullName,
      dob: ocrResult.dateOfBirth,
      confidence: ocrResult.confidence?.overall,
    });

    // ── Step 3: Face Verification ────────────────────────────
    await updateStep(partnerId, "face_verification", "processing");

    // Check if selfie has a valid face
    if (!selfieFaceResult?.faceDetected) {
      await updateStep(partnerId, "face_verification", "failed", null, "No face detected in selfie");
      // Don't throw — continue with 0 face match score
      results.faceMatch = {
        facesMatch: false,
        similarityScore: 0,
        confidence: 0,
        notes: "No face detected in selfie image",
      };
    } else {
      // Match faces
      const faceMatchResult = await matchFaces(
        aadhaarImagePath,
        selfieImagePath
      ).catch((err) => {
        stepErrors.push(`Face matching failed: ${err.message}`);
        return {
          facesMatch: false,
          similarityScore: 0,
          confidence: 0,
          notes: "Face matching service unavailable",
        };
      });

      results.faceMatch = faceMatchResult;
    }

    await updateStep(partnerId, "face_verification", "completed", {
      similarityScore: results.faceMatch.similarityScore,
      facesMatch: results.faceMatch.facesMatch,
    });

    // ── Step 4: Validation ───────────────────────────────────
    await updateStep(partnerId, "validation", "processing");

    const validationResult = runAllValidations(
      ocrResult,
      upiId,
      panResult?.panNumber,
      licenseResult?.licenseNumber
    );
    results.validation = validationResult;

    // Encrypt Aadhaar number
    let encryptedAadhaar = null;
    let aadhaarLastFour = null;

    if (ocrResult.aadhaarNumber) {
      try {
        const encrypted = encryptAadhaar(ocrResult.aadhaarNumber);
        encryptedAadhaar = encrypted.encrypted;
        aadhaarLastFour = encrypted.lastFour;
      } catch (err) {
        stepErrors.push(`Aadhaar encryption failed: ${err.message}`);
      }
    }

    // Consistency check
    const consistencyResult = checkConsistency(
      ocrResult,
      bankDetails,
      results.faceMatch,
      panResult,
      licenseResult
    );
    results.consistency = consistencyResult;

    await updateStep(partnerId, "validation", "completed", {
      aadhaarValid: validationResult.aadhaar.isValid,
      ageEligible: validationResult.age.isEligible,
      upiValid: validationResult.upi.valid,
      consistencyScore: consistencyResult.overallScore,
    });

    // ── Step 5: Scoring ──────────────────────────────────────
    await updateStep(partnerId, "ai_scoring", "processing");

    // Calculate component scores
    const componentScores = {
      aadhaarAuthenticity: calculateAadhaarAuthenticityScore(ocrResult),
      faceMatch: results.faceMatch.similarityScore || 0,
      ageEligibility: validationResult.age.score,
      upiValidity: validationResult.upi.score,
      dataConsistency: consistencyResult.overallScore,
      imageClarity: calculateClarityScore(selfieQuality, aadhaarQuality),
    };
    
    if (panResult) {
      componentScores.panAuthenticity = Math.max(
        0, 
        panResult.confidence * 40 + 
        (panResult.authenticityMarkers?.has_photo ? 20 : 0) + 
        (panResult.authenticityMarkers?.has_hologram ? 20 : 0) + 
        (panResult.authenticityMarkers?.has_income_tax_logo ? 20 : 0)
      );
    }
    
    if (licenseResult) {
      componentScores.licenseAuthenticity = Math.max(
        0,
        licenseResult.confidence * 40 +
        (licenseResult.authenticityMarkers?.has_photo ? 20 : 0) +
        (licenseResult.authenticityMarkers?.has_transport_authority_name ? 20 : 0) +
        (licenseResult.authenticityMarkers?.has_chip_or_smartcard_features ? 20 : 0)
      );
    }

    const scoringResult = calculateScore(componentScores);
    results.scoring = scoringResult;

    await updateStep(partnerId, "ai_scoring", "completed", {
      scores: componentScores,
      overallScore: scoringResult.overallScore,
    });

    // ── Step 6: Final Decision ───────────────────────────────
    await updateStep(partnerId, "final_decision", "processing");

    // Calculate age from DOB
    const age = validationResult.age.age;
    const dobParsed = validationResult.age.dob;

    // Update the delivery_partners record with all results
    const updateData = {
      status: scoringResult.decision,
      full_name: ocrResult.fullName,
      date_of_birth: dobParsed
        ? dobParsed.toISOString().split("T")[0]
        : null,
      age,
      gender: ocrResult.gender,
      address_extracted: ocrResult.address,
      aadhaar_number_encrypted: encryptedAadhaar,
      aadhaar_last_four: aadhaarLastFour,
      overall_score: scoringResult.overallScore,
      aadhaar_authenticity_score: componentScores.aadhaarAuthenticity,
      pan_authenticity_score: componentScores.panAuthenticity || 0,
      license_authenticity_score: componentScores.licenseAuthenticity || 0,
      face_match_score: componentScores.faceMatch,
      age_eligibility_score: componentScores.ageEligibility,
      upi_validity_score: componentScores.upiValidity,
      data_consistency_score: componentScores.dataConsistency,
      image_clarity_score: componentScores.imageClarity,
      rejection_reasons: scoringResult.rejectionReasons,
      decision_made_at: new Date().toISOString(),
    };

    await supabase
      .from("delivery_partners")
      .update(updateData)
      .eq("id", partnerId);

    await updateStep(partnerId, "final_decision", "completed", {
      decision: scoringResult.decision,
      overallScore: scoringResult.overallScore,
    });

    return {
      success: true,
      decision: scoringResult.decision,
      overallScore: scoringResult.overallScore,
      scores: componentScores,
      rejectionReasons: scoringResult.rejectionReasons,
      extractedData: {
        fullName: ocrResult.fullName,
        dateOfBirth: ocrResult.dateOfBirth,
        gender: ocrResult.gender,
        address: ocrResult.address,
        aadhaarMasked: aadhaarLastFour
          ? `XXXX-XXXX-${aadhaarLastFour}`
          : null,
      },
      errors: stepErrors.length > 0 ? stepErrors : undefined,
    };
  } catch (error) {
    // Mark current step as failed
    await updateStep(
      partnerId,
      "final_decision",
      "failed",
      null,
      error.message
    );

    // Update partner status to rejected on pipeline failure
    await supabase
      .from("delivery_partners")
      .update({
        status: "rejected",
        rejection_reasons: [
          {
            code: "PIPELINE_ERROR",
            message: `Processing failed: ${error.message}`,
            suggestion: "Please try again with clearer documents",
          },
        ],
        decision_made_at: new Date().toISOString(),
      })
      .eq("id", partnerId);

    return {
      success: false,
      decision: "rejected",
      overallScore: 0,
      error: error.message,
      errors: stepErrors,
    };
  }
}

// ── Helper: Update pipeline step status in DB ────────────────
async function updateStep(partnerId, stepName, status, result = null, errorMessage = null) {
  // Check if pipeline was cancelled manually
  const { data: partner } = await supabase
    .from("delivery_partners")
    .select("status, rejection_reasons")
    .eq("id", partnerId)
    .single();

  // If status is rejected and it was cancelled by user, throw a special error
  if (
    partner &&
    partner.status === "rejected" &&
    partner.rejection_reasons?.some((r) => r.code === "CANCELLED_BY_USER")
  ) {
    throw new Error("PIPELINE_CANCELLED_BY_USER");
  }

  const updateData = { status };

  if (status === "processing") {
    updateData.started_at = new Date().toISOString();
  }
  if (status === "completed" || status === "failed") {
    updateData.completed_at = new Date().toISOString();
  }
  if (result) {
    updateData.result = result;
  }
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase
    .from("onboarding_steps")
    .update(updateData)
    .eq("partner_id", partnerId)
    .eq("step_name", stepName);
}

// ── Helper: Calculate Aadhaar authenticity score ─────────────
function calculateAadhaarAuthenticityScore(ocrResult) {
  if (!ocrResult) return 0;

  let score = 0;

  // OCR confidence (40% of this component)
  score += (ocrResult.confidence?.overall || 0) * 40;

  // Authenticity markers (60% of this component)
  const markers = ocrResult.authenticityMarkers || {};
  if (markers.hasGovernmentLogo) score += 15;
  if (markers.hasQrCode) score += 15;
  if (markers.hasUidaiBranding) score += 15;
  if (!markers.suspectedTampering) score += 15;

  // Penalty for low text quality
  if (markers.textQuality === "low") score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Helper: Calculate combined image clarity score ───────────
function calculateClarityScore(selfieQuality, aadhaarQuality) {
  const selfieScore = selfieQuality?.scores?.overall || 0;
  const aadhaarScore = aadhaarQuality?.scores?.overall || 0;

  // Weight selfie quality slightly higher (60/40)
  return Math.round(selfieScore * 0.6 + aadhaarScore * 0.4);
}
