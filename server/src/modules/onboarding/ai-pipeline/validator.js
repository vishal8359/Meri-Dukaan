/**
 * Validation Layer
 *
 * Business rule validation for onboarding data:
 *  - Age ≥ 18
 *  - Aadhaar number format (12-digit with Verhoeff checksum)
 *  - UPI ID format
 *  - Indian resident check
 */

// ── Verhoeff Checksum Tables ────────────────────────────────
const VERHOEFF_D = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];

const VERHOEFF_P = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
];

const VERHOEFF_INV = [0,4,3,2,1,5,6,7,8,9];

/**
 * Validate Aadhaar number using Verhoeff checksum algorithm.
 * @param {string} aadhaarNumber - 12-digit string
 * @returns {boolean}
 */
export function validateAadhaarChecksum(aadhaarNumber) {
  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) return false;

  // Aadhaar should not start with 0 or 1
  if (aadhaarNumber[0] === "0" || aadhaarNumber[0] === "1") return false;

  let c = 0;
  const digits = aadhaarNumber.split("").reverse().map(Number);

  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }

  return c === 0;
}

/**
 * Validate UPI ID format.
 * Valid formats: name@provider (e.g., user@paytm, user@ybl, 9876543210@upi)
 * @param {string} upiId
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateUpiId(upiId) {
  if (!upiId || typeof upiId !== "string") {
    return { valid: false, reason: "UPI ID is required" };
  }

  const trimmed = upiId.trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return { valid: false, reason: "UPI ID must contain @" };
  }

  // Standard UPI format: alphanumeric.alphanumeric@provider
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z][a-zA-Z0-9]*$/;
  if (!upiRegex.test(trimmed)) {
    return { valid: false, reason: "Invalid UPI ID format" };
  }

  // Known UPI providers
  const knownProviders = [
    "upi", "ybl", "paytm", "oksbi", "okicici", "okaxis",
    "okhdfcbank", "axl", "ibl", "sbi", "apl", "barodampay",
    "unionbankofindia", "cboi", "csbpay", "dbs", "federal",
    "freecharge", "icici", "idfcfirst", "indus", "jio",
    "kotak", "mahb", "postbank", "rbl", "slice", "tap",
    "waheed", "idbi",
  ];

  const provider = trimmed.split("@")[1];
  const isKnownProvider = knownProviders.includes(provider);

  return {
    valid: true,
    isKnownProvider,
    provider,
  };
}

/**
 * Calculate age from date of birth string.
 * @param {string} dobString - Date in DD/MM/YYYY format
 * @returns {{ age: number, isEligible: boolean, dob: Date|null }}
 */
export function validateAge(dobString) {
  if (!dobString) {
    return { age: null, isEligible: false, dob: null };
  }

  let dob;

  // Handle DD/MM/YYYY
  const ddmmyyyy = dobString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    dob = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    // Try YYYY-MM-DD
    dob = new Date(dobString);
  }

  if (isNaN(dob.getTime())) {
    return { age: null, isEligible: false, dob: null };
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return {
    age,
    isEligible: age >= 18,
    dob,
  };
}

/**
 * Check if address appears to be from India.
 * @param {string} address
 * @returns {{ isIndian: boolean, state?: string }}
 */
export function validateIndianResident(address) {
  if (!address) return { isIndian: false };

  const indianStates = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar",
    "chhattisgarh", "goa", "gujarat", "haryana", "himachal pradesh",
    "jharkhand", "karnataka", "kerala", "madhya pradesh", "maharashtra",
    "manipur", "meghalaya", "mizoram", "nagaland", "odisha",
    "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana",
    "tripura", "uttar pradesh", "uttarakhand", "west bengal",
    // Union territories
    "delhi", "chandigarh", "puducherry", "lakshadweep",
    "andaman and nicobar", "dadra and nagar haveli", "daman and diu",
    "jammu and kashmir", "ladakh",
  ];

  const lower = address.toLowerCase();

  // Check for Indian PIN code pattern (6 digits)
  const hasPinCode = /\b\d{6}\b/.test(address);

  // Check for state name
  const matchedState = indianStates.find((state) => lower.includes(state));

  // Check for India keyword
  const hasIndia = lower.includes("india");

  const isIndian = Boolean(matchedState || hasPinCode || hasIndia);

  return {
    isIndian,
    state: matchedState || null,
    hasPinCode,
  };
}

/**
 * Run all validations and return categorized results.
 * @param {Object} data - Extracted data from OCR
 * @param {string} upiId - User-provided UPI ID
 * @returns {Object} Validation results
 */
export function runAllValidations(data, upiId) {
  const aadhaarValid = validateAadhaarChecksum(data.aadhaarNumber);
  const ageResult = validateAge(data.dateOfBirth);
  const upiResult = validateUpiId(upiId);
  const residencyResult = validateIndianResident(data.address);

  return {
    aadhaar: {
      isValid: aadhaarValid,
      score: aadhaarValid ? 100 : 0,
    },
    age: {
      ...ageResult,
      score: ageResult.isEligible ? 100 : 0,
    },
    upi: {
      ...upiResult,
      score: upiResult.valid ? (upiResult.isKnownProvider ? 100 : 80) : 0,
    },
    residency: {
      ...residencyResult,
      score: residencyResult.isIndian ? 100 : 0,
    },
  };
}
