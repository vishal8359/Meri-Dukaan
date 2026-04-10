/**
 * Aadhaar Encryption Module
 * Uses AES-256 encryption for storing Aadhaar numbers at rest.
 * The encryption key is derived from env.AADHAAR_ENCRYPTION_KEY.
 *
 * Security guarantees:
 *  - Aadhaar numbers are NEVER stored in plaintext
 *  - Only the last 4 digits are stored separately for masked display
 *  - Decryption requires the server-side secret key
 */
import CryptoJS from "crypto-js";
import env from "../../../config/env.js";

const ENCRYPTION_KEY = env.aadhaarEncryptionKey;

if (!ENCRYPTION_KEY) {
  console.warn(
    "[encryption] AADHAAR_ENCRYPTION_KEY not set — using fallback (NOT SAFE FOR PRODUCTION)."
  );
}

const getKey = () => ENCRYPTION_KEY || "dev_fallback_key_change_in_prod_32ch";

/**
 * Encrypt an Aadhaar number (12-digit string).
 * @param {string} aadhaarNumber - Plain 12-digit Aadhaar
 * @returns {{ encrypted: string, lastFour: string }}
 */
export function encryptAadhaar(aadhaarNumber) {
  const cleaned = aadhaarNumber.replace(/\s+/g, "").replace(/-/g, "");

  if (!/^\d{12}$/.test(cleaned)) {
    throw new Error("Invalid Aadhaar number format — must be 12 digits");
  }

  const encrypted = CryptoJS.AES.encrypt(cleaned, getKey()).toString();
  const lastFour = cleaned.slice(-4);

  return { encrypted, lastFour };
}

/**
 * Decrypt an Aadhaar number back to plain 12 digits.
 * Use sparingly — only when absolutely necessary (e.g., official verification).
 * @param {string} encryptedAadhaar
 * @returns {string} Plain 12-digit Aadhaar
 */
export function decryptAadhaar(encryptedAadhaar) {
  const bytes = CryptoJS.AES.decrypt(encryptedAadhaar, getKey());
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Generate masked display string: XXXX-XXXX-1234
 * @param {string} lastFour
 * @returns {string}
 */
export function maskAadhaar(lastFour) {
  return `XXXX-XXXX-${lastFour}`;
}
