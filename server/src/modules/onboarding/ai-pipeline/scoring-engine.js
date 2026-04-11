/**
 * Scoring Engine
 *
 * Computes weighted overall score from individual component scores.
 * Makes the final AUTO VERIFY / AUTO REJECT decision.
 *
 * Weights:
 *  - Aadhaar authenticity → 30%
 *  - Face match           → 25%
 *  - Age eligibility      → 10%
 *  - UPI validity         → 10%
 *  - Data consistency     → 15%
 *  - Image clarity        → 10%
 *
 * Decision: Score ≥ 90 → VERIFIED, else → REJECTED
 */

const DEFAULT_WEIGHTS = {
  aadhaarAuthenticity: 0.30,
  faceMatch:          0.25,
  ageEligibility:     0.10,
  upiValidity:        0.10,
  dataConsistency:    0.15,
  imageClarity:       0.10,
};

const VERIFY_THRESHOLD = 85;

/**
 * Calculate final score and make decision.
 *
 * @param {Object} scores - Individual component scores (0–100 each)
 * @param {number} scores.aadhaarAuthenticity
 * @param {number} scores.faceMatch
 * @param {number} scores.ageEligibility
 * @param {number} scores.upiValidity
 * @param {number} scores.panAuthenticity (Optional)
 * @param {number} scores.licenseAuthenticity (Optional)
 * @param {number} scores.dataConsistency
 * @param {number} scores.imageClarity
 * @returns {Object} Final scoring result with decision
 */
export function calculateScore(scores) {
  // Clamp each score to 0–100
  const clamped = {};
  for (const [key, val] of Object.entries(scores)) {
    if (val !== undefined && val !== null) {
      clamped[key] = Math.max(0, Math.min(100, Number(val) || 0));
    }
  }

  // Adjust weights if optional documents are present
  let activeWeights = { ...DEFAULT_WEIGHTS };
  
  const hasPan = clamped.panAuthenticity !== undefined;
  const hasLicense = clamped.licenseAuthenticity !== undefined;

  if (hasPan || hasLicense) {
    // Redistribute weights
    activeWeights = {
      aadhaarAuthenticity: 0.20,
      faceMatch: 0.20,
      ageEligibility: 0.10,
      upiValidity: 0.10,
      dataConsistency: 0.15,
      imageClarity: 0.05,
    };
    if (hasPan && hasLicense) {
      activeWeights.panAuthenticity = 0.10;
      activeWeights.licenseAuthenticity = 0.10;
    } else if (hasPan) {
      activeWeights.panAuthenticity = 0.20;
    } else if (hasLicense) {
      activeWeights.licenseAuthenticity = 0.20;
    }
  }

  // Weighted sum
  let overallScore = 0;
  for (const [key, weight] of Object.entries(activeWeights)) {
    overallScore += (clamped[key] || 0) * weight;
  }
  overallScore = Math.round(overallScore);

  // Decision
  const decision = overallScore >= VERIFY_THRESHOLD ? "verified" : "rejected";

  // Generate rejection reasons if rejected
  const rejectionReasons = [];
  if (decision === "rejected") {
    if (clamped.aadhaarAuthenticity < 70) {
      rejectionReasons.push({
        code: "AADHAAR_LOW_CONFIDENCE",
        message: "Aadhaar card could not be verified — unclear or potentially invalid document",
        suggestion: "Please upload a clear, high-resolution photo of your original Aadhaar card",
        weight: activeWeights.aadhaarAuthenticity,
        score: clamped.aadhaarAuthenticity,
      });
    }

    if (clamped.faceMatch < 70) {
      rejectionReasons.push({
        code: "FACE_MISMATCH",
        message: "Selfie does not match the photo on your Aadhaar card",
        suggestion: "Take a clear, well-lit selfie in a neutral background. Ensure your face is clearly visible",
        weight: activeWeights.faceMatch,
        score: clamped.faceMatch,
      });
    }

    if (clamped.ageEligibility < 100) {
      rejectionReasons.push({
        code: "AGE_INELIGIBLE",
        message: "Applicant must be at least 18 years old",
        suggestion: "You must be 18 years or older to become a delivery partner",
        weight: activeWeights.ageEligibility,
        score: clamped.ageEligibility,
      });
    }

    if (clamped.upiValidity < 70) {
      rejectionReasons.push({
        code: "UPI_INVALID",
        message: "UPI ID format is invalid or not recognized",
        suggestion: "Enter a valid UPI ID (e.g., yourname@paytm, yourname@ybl)",
        weight: activeWeights.upiValidity,
        score: clamped.upiValidity,
      });
    }

    if (clamped.dataConsistency < 60) {
      rejectionReasons.push({
        code: "DATA_INCONSISTENT",
        message: "Data inconsistencies detected across your documents",
        suggestion: "Ensure the name on your Aadhaar matches your bank account details",
        weight: activeWeights.dataConsistency,
        score: clamped.dataConsistency,
      });
    }

    if (clamped.imageClarity < 50) {
      rejectionReasons.push({
        code: "IMAGE_UNCLEAR",
        message: "Uploaded images are blurry or too dark",
        suggestion: "Upload clear, well-lit photos. Avoid glare and ensure all text is readable",
        weight: activeWeights.imageClarity,
        score: clamped.imageClarity,
      });
    }

    if (hasPan && clamped.panAuthenticity < 70) {
      rejectionReasons.push({
        code: "PAN_INVALID",
        message: "PAN Card could not be verified — unclear or potentially invalid",
        suggestion: "Please upload a clear, high-resolution photo of your original PAN Card",
        weight: activeWeights.panAuthenticity,
        score: clamped.panAuthenticity,
      });
    }

    if (hasLicense && clamped.licenseAuthenticity < 70) {
      rejectionReasons.push({
        code: "LICENSE_INVALID",
        message: "Driving License could not be verified — unclear or potentially invalid",
        suggestion: "Please upload a clear, high-resolution photo of your original Driving License",
        weight: activeWeights.licenseAuthenticity,
        score: clamped.licenseAuthenticity,
      });
    }

    // If no specific reason identified but score is still < 90
    if (rejectionReasons.length === 0) {
      rejectionReasons.push({
        code: "OVERALL_SCORE_LOW",
        message: "Overall verification score did not meet the minimum threshold",
        suggestion: "Please re-upload clearer documents and try again",
        weight: 1.0,
        score: overallScore,
      });
    }
  }

  return {
    scores: clamped,
    weights: activeWeights,
    overallScore,
    threshold: VERIFY_THRESHOLD,
    decision,
    rejectionReasons,
  };
}
