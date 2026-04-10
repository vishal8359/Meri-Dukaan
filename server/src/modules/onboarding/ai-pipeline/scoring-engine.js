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

const WEIGHTS = {
  aadhaarAuthenticity: 0.30,
  faceMatch:          0.25,
  ageEligibility:     0.10,
  upiValidity:        0.10,
  dataConsistency:    0.15,
  imageClarity:       0.10,
};

const VERIFY_THRESHOLD = 90;

/**
 * Calculate final score and make decision.
 *
 * @param {Object} scores - Individual component scores (0–100 each)
 * @param {number} scores.aadhaarAuthenticity
 * @param {number} scores.faceMatch
 * @param {number} scores.ageEligibility
 * @param {number} scores.upiValidity
 * @param {number} scores.dataConsistency
 * @param {number} scores.imageClarity
 * @returns {Object} Final scoring result with decision
 */
export function calculateScore(scores) {
  // Clamp each score to 0–100
  const clamped = {};
  for (const [key, val] of Object.entries(scores)) {
    clamped[key] = Math.max(0, Math.min(100, Number(val) || 0));
  }

  // Weighted sum
  const overallScore = Math.round(
    (clamped.aadhaarAuthenticity || 0) * WEIGHTS.aadhaarAuthenticity +
    (clamped.faceMatch || 0)           * WEIGHTS.faceMatch +
    (clamped.ageEligibility || 0)      * WEIGHTS.ageEligibility +
    (clamped.upiValidity || 0)         * WEIGHTS.upiValidity +
    (clamped.dataConsistency || 0)     * WEIGHTS.dataConsistency +
    (clamped.imageClarity || 0)        * WEIGHTS.imageClarity
  );

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
        weight: WEIGHTS.aadhaarAuthenticity,
        score: clamped.aadhaarAuthenticity,
      });
    }

    if (clamped.faceMatch < 70) {
      rejectionReasons.push({
        code: "FACE_MISMATCH",
        message: "Selfie does not match the photo on your Aadhaar card",
        suggestion: "Take a clear, well-lit selfie in a neutral background. Ensure your face is clearly visible",
        weight: WEIGHTS.faceMatch,
        score: clamped.faceMatch,
      });
    }

    if (clamped.ageEligibility < 100) {
      rejectionReasons.push({
        code: "AGE_INELIGIBLE",
        message: "Applicant must be at least 18 years old",
        suggestion: "You must be 18 years or older to become a delivery partner",
        weight: WEIGHTS.ageEligibility,
        score: clamped.ageEligibility,
      });
    }

    if (clamped.upiValidity < 70) {
      rejectionReasons.push({
        code: "UPI_INVALID",
        message: "UPI ID format is invalid or not recognized",
        suggestion: "Enter a valid UPI ID (e.g., yourname@paytm, yourname@ybl)",
        weight: WEIGHTS.upiValidity,
        score: clamped.upiValidity,
      });
    }

    if (clamped.dataConsistency < 60) {
      rejectionReasons.push({
        code: "DATA_INCONSISTENT",
        message: "Data inconsistencies detected across your documents",
        suggestion: "Ensure the name on your Aadhaar matches your bank account details",
        weight: WEIGHTS.dataConsistency,
        score: clamped.dataConsistency,
      });
    }

    if (clamped.imageClarity < 50) {
      rejectionReasons.push({
        code: "IMAGE_UNCLEAR",
        message: "Uploaded images are blurry or too dark",
        suggestion: "Upload clear, well-lit photos. Avoid glare and ensure all text is readable",
        weight: WEIGHTS.imageClarity,
        score: clamped.imageClarity,
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
    weights: WEIGHTS,
    overallScore,
    threshold: VERIFY_THRESHOLD,
    decision,
    rejectionReasons,
  };
}
