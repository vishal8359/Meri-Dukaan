/**
 * OCR Extractor — Aadhaar Data Extraction via Gemini Vision API
 *
 * Uses Google Gemini with vision capabilities to extract
 * structured data from Aadhaar card images with high accuracy.
 */
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import env from "../../../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.gemini.apiKey });

/**
 * Extract structured data from an Aadhaar card image.
 * @param {string} imagePath - Absolute path to the Aadhaar image file
 * @returns {Promise<Object>} Extracted data with confidence scores
 */
export async function extractAadhaarData(imagePath) {
  // Compress image to avoid Google GenAI Payload Too Large (503) errors
  const imageBuffer = await sharp(imagePath)
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
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
            text: `Analyze this Indian Aadhaar card image and extract the following information.

Return a STRICT JSON object with no markdown around it with these exact fields:

{
  "full_name": "Name as printed on card",
  "date_of_birth": "DD/MM/YYYY format",
  "gender": "Male/Female/Other",
  "aadhaar_number": "12-digit number (spaces removed)",
  "address": "Full address as printed",
  "is_valid_aadhaar": true/false,
  "confidence": {
    "name": 0.0-1.0,
    "dob": 0.0-1.0,
    "gender": 0.0-1.0,
    "aadhaar_number": 0.0-1.0,
    "address": 0.0-1.0,
    "overall": 0.0-1.0
  },
  "authenticity_markers": {
    "has_government_logo": true/false,
    "has_qr_code": true/false,
    "has_photo": true/false,
    "has_uidai_branding": true/false,
    "text_quality": "high/medium/low",
    "suspected_tampering": true/false
  }
}

Rules:
- If any field is unreadable, set its value to null and confidence to 0
- Remove spaces/dashes from aadhaar_number
- Validate aadhaar_number is exactly 12 digits
- Check for visual authenticity markers (government logos, QR code, UIDAI branding)
- Flag suspected_tampering if document looks altered`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mediaType,
            },
          },
        ],
      },
    ]
  });

  const rawText = response.text || "{}";

  try {
    // Try to parse JSON directly
    const parsed = JSON.parse(rawText);
    return normalizeExtractionResult(parsed);
  } catch (error) {
    console.error("Gemini OCR Parsing Error:", error);
    // Attempt to extract JSON from markdown code block if direct parse failed
    if (rawText) {
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return normalizeExtractionResult(JSON.parse(jsonMatch[1].trim()));
        } catch (e) {
          console.error("Could not parse json Match", e);
        }
      }
    }
    // Last resort — return failure
    return getFailedResult(`Could not parse OCR response: ${error.message}`);
  }
}

function normalizeExtractionResult(data) {
  return {
    fullName: data.full_name || null,
    dateOfBirth: data.date_of_birth || null,
    gender: data.gender || null,
    aadhaarNumber: data.aadhaar_number
      ? data.aadhaar_number.replace(/\s+/g, "").replace(/-/g, "")
      : null,
    address: data.address || null,
    isValidAadhaar: data.is_valid_aadhaar ?? false,
    confidence: {
      name: data.confidence?.name ?? 0,
      dob: data.confidence?.dob ?? 0,
      gender: data.confidence?.gender ?? 0,
      aadhaarNumber: data.confidence?.aadhaar_number ?? 0,
      address: data.confidence?.address ?? 0,
      overall: data.confidence?.overall ?? 0,
    },
    authenticityMarkers: {
      hasGovernmentLogo: data.authenticity_markers?.has_government_logo ?? false,
      hasQrCode: data.authenticity_markers?.has_qr_code ?? false,
      hasPhoto: data.authenticity_markers?.has_photo ?? false,
      hasUidaiBranding: data.authenticity_markers?.has_uidai_branding ?? false,
      textQuality: data.authenticity_markers?.text_quality ?? "low",
      suspectedTampering:
        data.authenticity_markers?.suspected_tampering ?? true,
    },
  };
}

function getFailedResult(reason) {
  return {
    fullName: null,
    dateOfBirth: null,
    gender: null,
    aadhaarNumber: null,
    address: null,
    isValidAadhaar: false,
    confidence: {
      name: 0, dob: 0, gender: 0, aadhaarNumber: 0, address: 0, overall: 0,
    },
    authenticityMarkers: {
      hasGovernmentLogo: false,
      hasQrCode: false,
      hasPhoto: false,
      hasUidaiBranding: false,
      textQuality: "low",
      suspectedTampering: true,
    },
    error: reason,
  };
}
