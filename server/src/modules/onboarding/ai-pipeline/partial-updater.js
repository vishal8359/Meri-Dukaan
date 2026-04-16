import { runAllValidations } from "./validator.js";
import { calculateScore } from "./scoring-engine.js";
import { 
  extractAadhaarData, 
  extractPanData, 
  extractLicenseData 
} from "./ocr-extractor.js";
import { analyzeImageQuality } from "./image-analyzer.js";
import { detectFace, matchFaces } from "./face-detector.js";
import { encryptAadhaar } from "./encryption.js";
import { checkConsistency } from "./consistency-checker.js";

function calculateAadhaarAuthenticityScore(ocrResult) {
  if (!ocrResult) return 0;
  let score = (ocrResult.confidence?.overall || 0) * 40;
  const markers = ocrResult.authenticityMarkers || {};
  if (markers.hasGovernmentLogo) score += 15;
  if (markers.hasQrCode) score += 15;
  if (markers.hasUidaiBranding) score += 15;
  if (!markers.suspectedTampering) score += 15;
  if (markers.textQuality === "low") score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateClarityScore(selfieQuality, aadhaarQuality) {
  const selfieScore = selfieQuality?.scores?.overall || 0;
  const aadhaarScore = aadhaarQuality?.scores?.overall || 0;
  return Math.round(selfieScore * 0.6 + aadhaarScore * 0.4);
}

export async function processPartialUpdate({
  partner,
  field,
  value,
  imagePath,
  oldSelfiePath,
  oldAadhaarPath
}) {
  let updates = {};
  let errors = [];
  
  // Use existing scores if not modified
  let componentScores = {
    aadhaarAuthenticity: partner.aadhaar_authenticity_score,
    faceMatch: partner.face_match_score,
    ageEligibility: partner.age_eligibility_score,
    upiValidity: partner.upi_validity_score,
    dataConsistency: partner.data_consistency_score,
    imageClarity: partner.image_clarity_score,
    panAuthenticity: partner.pan_authenticity_score || 0,
    licenseAuthenticity: partner.license_authenticity_score || 0,
  };

  // Build dummy OCR to pass validation calls if we don't re-extract
  let ocrResult = {
    fullName: partner.full_name,
    dateOfBirth: partner.date_of_birth,
    gender: partner.gender,
    aadhaarNumber: "123412341234", 
    address: partner.address_extracted,
  };

  try {
    if (field === "upiId") {
      const vResult = runAllValidations(ocrResult, value, null, null);
      componentScores.upiValidity = vResult.upi.score;
      updates.upi_id = value;
    } 
    else if (field === "aadhaar") {
      const [ocrData, aadhaarQuality] = await Promise.all([
        extractAadhaarData(imagePath),
        analyzeImageQuality(imagePath)
      ]);
      
      if (!ocrData || ocrData.error) throw new Error("OCR extraction failed");

      ocrResult = ocrData;
      
      let faceMatchScore = 0;
      if (oldSelfiePath) {
        const faceMatch = await matchFaces(imagePath, oldSelfiePath);
        faceMatchScore = faceMatch.similarityScore || 0;
      }
      
      // We don't have new selfie quality, assume 100 for formula if we don't have it
      // but realistically we should just use imageClarity if selfie is same, or try to approximate
      // For simplicity, we just use the new aadhaar quality
      componentScores.aadhaarAuthenticity = calculateAadhaarAuthenticityScore(ocrData);
      componentScores.faceMatch = faceMatchScore;
      
      const vResult = runAllValidations(ocrResult, partner.upi_id, null, null);
      componentScores.ageEligibility = vResult.age.score;
      
      let encryptedAadhaar = null;
      let aadhaarLastFour = null;
      if (ocrData.aadhaarNumber) {
        const encrypted = encryptAadhaar(ocrData.aadhaarNumber);
        encryptedAadhaar = encrypted.encrypted;
        aadhaarLastFour = encrypted.lastFour;
      }

      updates.full_name = ocrData.fullName;
      updates.date_of_birth = vResult.age.dob ? vResult.age.dob.toISOString().split("T")[0] : null;
      updates.age = vResult.age.age;
      updates.gender = ocrData.gender;
      updates.address_extracted = ocrData.address;
      updates.aadhaar_number_encrypted = encryptedAadhaar;
      updates.aadhaar_last_four = aadhaarLastFour;
    }
    else if (field === "selfie") {
      const [selfieFace, selfieQuality] = await Promise.all([
        detectFace(imagePath),
        analyzeImageQuality(imagePath)
      ]);
      
      let faceMatchScore = 0;
      if (selfieFace?.faceDetected && oldAadhaarPath) {
        const faceMatch = await matchFaces(oldAadhaarPath, imagePath);
        faceMatchScore = faceMatch.similarityScore || 0;
      }
      
      componentScores.faceMatch = faceMatchScore;
      // Ideally recalculate imageClarity slightly, left as is if not full pipeline
    }
    else if (field === "panCard") {
      const panResult = await extractPanData(imagePath);
      let panScore = 0;
      if (panResult) {
        panScore = Math.max(0, panResult.confidence * 40 +
          (panResult.authenticityMarkers?.has_photo ? 20 : 0) +
          (panResult.authenticityMarkers?.has_hologram ? 20 : 0) +
          (panResult.authenticityMarkers?.has_income_tax_logo ? 20 : 0)
        );
      }
      componentScores.panAuthenticity = panScore;
    }
    else if (field === "drivingLicense") {
      const licenseResult = await extractLicenseData(imagePath);
      let licenseScore = 0;
      if (licenseResult) {
        licenseScore = Math.max(0, licenseResult.confidence * 40 +
          (licenseResult.authenticityMarkers?.has_photo ? 20 : 0) +
          (licenseResult.authenticityMarkers?.has_transport_authority_name ? 20 : 0) +
          (licenseResult.authenticityMarkers?.has_chip_or_smartcard_features ? 20 : 0)
        );
      }
      componentScores.licenseAuthenticity = licenseScore;
    }
  } catch (err) {
    errors.push(err.message);
  }

  const scoringResult = calculateScore(componentScores);

  updates.overall_score = scoringResult.overallScore;
  updates.status = scoringResult.decision;
  updates.rejection_reasons = scoringResult.rejectionReasons;
  // Update the detailed scores
  updates.aadhaar_authenticity_score = componentScores.aadhaarAuthenticity;
  updates.face_match_score = componentScores.faceMatch;
  updates.age_eligibility_score = componentScores.ageEligibility;
  updates.upi_validity_score = componentScores.upiValidity;
  updates.data_consistency_score = componentScores.dataConsistency;
  updates.image_clarity_score = componentScores.imageClarity;
  updates.pan_authenticity_score = componentScores.panAuthenticity;
  updates.license_authenticity_score = componentScores.licenseAuthenticity;

  return { updates, errors, decision: scoringResult.decision, overallScore: scoringResult.overallScore };
}
