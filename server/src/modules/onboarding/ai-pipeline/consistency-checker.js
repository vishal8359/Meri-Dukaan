/**
 * Data Consistency Checker
 *
 * Cross-validates extracted data across multiple sources
 * to detect inconsistencies and potential fraud.
 */

/**
 * Check data consistency across extracted and user-provided data.
 * @param {Object} ocrData - Data extracted from Aadhaar via OCR
 * @param {Object} userProvided - Data provided by user (bank details, etc.)
 * @param {Object} faceResult - Face matching results
 * @returns {Object} Consistency score and details
 */
export function checkConsistency(ocrData, userProvided, faceResult) {
  const checks = [];
  let totalScore = 0;
  let checkCount = 0;

  // ── 1. Name consistency (OCR name vs bank account holder) ──
  if (ocrData.fullName && userProvided.bankAccountHolder) {
    const nameMatch = fuzzyNameMatch(
      ocrData.fullName,
      userProvided.bankAccountHolder
    );
    checks.push({
      field: "name_match",
      description: "Name on Aadhaar vs Bank Account Holder",
      score: nameMatch.score,
      match: nameMatch.isMatch,
      detail: nameMatch.detail,
    });
    totalScore += nameMatch.score;
    checkCount++;
  }

  // ── 2. Gender consistency with face analysis ──
  if (ocrData.gender && faceResult?.analysis?.genderConsistent !== undefined) {
    const genderScore = faceResult.analysis.genderConsistent ? 100 : 30;
    checks.push({
      field: "gender_consistency",
      description: "Gender on Aadhaar vs Face Analysis",
      score: genderScore,
      match: faceResult.analysis.genderConsistent,
    });
    totalScore += genderScore;
    checkCount++;
  }

  // ── 3. Age consistency (OCR age vs face analysis) ──
  if (faceResult?.analysis?.approximateAgeConsistent !== undefined) {
    const ageScore = faceResult.analysis.approximateAgeConsistent ? 100 : 40;
    checks.push({
      field: "age_consistency",
      description: "Age from Aadhaar vs Face Appearance",
      score: ageScore,
      match: faceResult.analysis.approximateAgeConsistent,
    });
    totalScore += ageScore;
    checkCount++;
  }

  // ── 4. Document authenticity markers ──
  if (ocrData.authenticityMarkers) {
    const markers = ocrData.authenticityMarkers;
    let markerScore = 0;
    let markerChecks = 0;

    if (markers.hasGovernmentLogo) { markerScore += 25; }
    markerChecks++;
    if (markers.hasQrCode) { markerScore += 25; }
    markerChecks++;
    if (markers.hasUidaiBranding) { markerScore += 25; }
    markerChecks++;
    if (!markers.suspectedTampering) { markerScore += 25; }
    markerChecks++;

    checks.push({
      field: "document_authenticity",
      description: "Aadhaar card visual authenticity",
      score: markerScore,
      match: markerScore >= 75,
      detail: {
        logo: markers.hasGovernmentLogo,
        qr: markers.hasQrCode,
        uidai: markers.hasUidaiBranding,
        noTampering: !markers.suspectedTampering,
      },
    });
    totalScore += markerScore;
    checkCount++;
  }

  // ── 5. OCR confidence check ──
  if (ocrData.confidence) {
    const avgConfidence = Math.round(ocrData.confidence.overall * 100);
    checks.push({
      field: "ocr_confidence",
      description: "OCR data extraction confidence",
      score: avgConfidence,
      match: avgConfidence >= 70,
    });
    totalScore += avgConfidence;
    checkCount++;
  }

  // ── 6. Address completeness ──
  if (ocrData.address) {
    const addrScore = assessAddressCompleteness(ocrData.address);
    checks.push({
      field: "address_completeness",
      description: "Extracted address quality",
      score: addrScore,
      match: addrScore >= 60,
    });
    totalScore += addrScore;
    checkCount++;
  }

  const overallScore = checkCount > 0 ? Math.round(totalScore / checkCount) : 0;

  return {
    overallScore,
    checks,
    checkCount,
    passedChecks: checks.filter((c) => c.match).length,
    failedChecks: checks.filter((c) => !c.match).length,
  };
}

/**
 * Fuzzy name matching — handles common variations in Indian names.
 */
function fuzzyNameMatch(name1, name2) {
  const normalize = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // Exact match
  if (n1 === n2) {
    return { isMatch: true, score: 100, detail: "Exact match" };
  }

  // Token-based comparison (handles reordered names)
  const tokens1 = new Set(n1.split(" "));
  const tokens2 = new Set(n2.split(" "));

  const intersection = [...tokens1].filter((t) => tokens2.has(t));
  const union = new Set([...tokens1, ...tokens2]);

  const jaccardSimilarity = intersection.length / union.size;
  const score = Math.round(jaccardSimilarity * 100);

  // Check if all tokens of one name appear in the other
  const allTokensMatch =
    [...tokens1].every((t) => tokens2.has(t)) ||
    [...tokens2].every((t) => tokens1.has(t));

  return {
    isMatch: score >= 60 || allTokensMatch,
    score: allTokensMatch ? Math.max(score, 85) : score,
    detail:
      score >= 80
        ? "Strong match"
        : score >= 60
          ? "Partial match"
          : "Names differ significantly",
  };
}

/**
 * Assess address completeness — checks for standard components.
 */
function assessAddressCompleteness(address) {
  if (!address) return 0;

  let score = 0;
  const lower = address.toLowerCase();

  // Has PIN code
  if (/\b\d{6}\b/.test(address)) score += 25;

  // Has state/city-like content (more than 3 words)
  if (address.split(/[\s,]+/).length >= 3) score += 25;

  // Has comma-separated parts (structured address)
  if (address.includes(",")) score += 15;

  // Minimum length (at least 20 chars for a decent address)
  if (address.length >= 20) score += 15;

  // Has house/building number pattern
  if (/\d+[\/\-]?\d*/i.test(address)) score += 10;

  // Has district/city keyword
  if (/dist|city|town|village|block|ward|nagar/i.test(lower)) score += 10;

  return Math.min(score, 100);
}
