/**
 * Face Detector & Matcher
 *
 * Uses sharp for image processing and Claude Vision for face analysis.
 * Performs:
 *  - Face detection in selfie
 *  - Face extraction from Aadhaar
 *  - Face comparison / similarity scoring
 *
 * Note: We use Google Gemini Vision for face comparison since @vladmandic/face-api
 * requires large model downloads. Gemini provides accurate face comparison
 * through its multimodal capabilities.
 */
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import env from "../../../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.gemini.apiKey });

/**
 * Detect if a face is present in the image and assess quality.
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} Face detection result
 */
export async function detectFace(imagePath) {
  const imageBuffer = await sharp(imagePath)
    .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const base64Image = imageBuffer.toString("base64");
  const mediaType = "image/jpeg";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this image for face detection. Return STRICT JSON only:

{
  "face_detected": true/false,
  "face_count": number,
  "face_quality": {
    "is_clear": true/false,
    "is_well_lit": true/false,
    "is_frontal": true/false,
    "eyes_visible": true/false,
    "face_size_adequate": true/false,
    "quality_score": 0-100
  },
  "is_live_photo": true/false,
  "appears_to_be_screen_capture": true/false
}`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mediaType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text || "{}";
  try {
    const parsed = JSON.parse(rawText);
    return {
      faceDetected: parsed.face_detected ?? false,
      faceCount: parsed.face_count ?? 0,
      faceQuality: {
        isClear: parsed.face_quality?.is_clear ?? false,
        isWellLit: parsed.face_quality?.is_well_lit ?? false,
        isFrontal: parsed.face_quality?.is_frontal ?? false,
        eyesVisible: parsed.face_quality?.eyes_visible ?? false,
        faceSizeAdequate: parsed.face_quality?.face_size_adequate ?? false,
        qualityScore: parsed.face_quality?.quality_score ?? 0,
      },
      isLivePhoto: parsed.is_live_photo ?? false,
      appearsToBeScreenCapture: parsed.appears_to_be_screen_capture ?? true,
    };
  } catch {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim());
      return {
        faceDetected: parsed.face_detected ?? false,
        faceCount: parsed.face_count ?? 0,
        faceQuality: {
          isClear: parsed.face_quality?.is_clear ?? false,
          isWellLit: parsed.face_quality?.is_well_lit ?? false,
          isFrontal: parsed.face_quality?.is_frontal ?? false,
          eyesVisible: parsed.face_quality?.eyes_visible ?? false,
          faceSizeAdequate: parsed.face_quality?.face_size_adequate ?? false,
          qualityScore: parsed.face_quality?.quality_score ?? 0,
        },
        isLivePhoto: parsed.is_live_photo ?? false,
        appearsToBeScreenCapture: parsed.appears_to_be_screen_capture ?? true,
      };
    }
    return {
      faceDetected: false,
      faceCount: 0,
      faceQuality: {
        isClear: false, isWellLit: false, isFrontal: false,
        eyesVisible: false, faceSizeAdequate: false, qualityScore: 0,
      },
      isLivePhoto: false,
      appearsToBeScreenCapture: true,
    };
  }
}

/**
 * Compare two face images and return a similarity score.
 * @param {string} aadhaarImagePath - Path to Aadhaar card image
 * @param {string} selfiePath - Path to selfie image
 * @returns {Promise<Object>} Match result with similarity score
 */
export async function matchFaces(aadhaarImagePath, selfiePath) {
  const aadhaarBuffer = await sharp(aadhaarImagePath)
    .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const selfieBuffer = await sharp(selfiePath)
    .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const aadhaarBase64 = aadhaarBuffer.toString("base64");
  const selfieBase64 = selfieBuffer.toString("base64");
  const mediaType = "image/jpeg";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Compare the face on the Aadhaar card (Image 1) with the selfie (Image 2).
Return STRICT JSON only:

{
  "faces_match": true/false,
  "similarity_score": 0-100,
  "confidence": 0.0-1.0,
  "analysis": {
    "facial_structure_match": true/false,
    "approximate_age_consistent": true/false,
    "gender_consistent": true/false
  },
  "notes": "Brief explanation"
}

Be strict — if there's any doubt, lower the score. A score of 90+ means very high confidence of same person.`,
          },
          {
            inlineData: {
              data: aadhaarBase64,
              mimeType: mediaType,
            },
          },
          {
            inlineData: {
              data: selfieBase64,
              mimeType: mediaType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text || "{}";
  try {
    const parsed = JSON.parse(rawText);
    return normalizeFaceMatch(parsed);
  } catch {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return normalizeFaceMatch(JSON.parse(jsonMatch[1].trim()));
    }
    return {
      facesMatch: false,
      similarityScore: 0,
      confidence: 0,
      analysis: {
        facialStructureMatch: false,
        approximateAgeConsistent: false,
        genderConsistent: false,
      },
      notes: "Could not perform face comparison",
    };
  }
}

function normalizeFaceMatch(data) {
  return {
    facesMatch: data.faces_match ?? false,
    similarityScore: data.similarity_score ?? 0,
    confidence: data.confidence ?? 0,
    analysis: {
      facialStructureMatch: data.analysis?.facial_structure_match ?? false,
      approximateAgeConsistent: data.analysis?.approximate_age_consistent ?? false,
      genderConsistent: data.analysis?.gender_consistent ?? false,
    },
    notes: data.notes || "",
  };
}

/**
 * Resize/optimize an image for processing.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} maxWidth
 */
export async function optimizeImage(inputPath, outputPath, maxWidth = 1200) {
  await sharp(inputPath)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}
