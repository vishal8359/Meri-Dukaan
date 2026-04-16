/**
 * Onboarding API Client
 *
 * API functions for delivery partner onboarding flow.
 */
import { apiRequest, API_BASE_URL, getGlobalAuthToken } from "./client";
import axios from "axios";

/**
 * Upload Aadhaar + Selfie + UPI to start onboarding pipeline.
 * Uses FormData for multipart upload.
 */
export async function uploadOnboardingDocuments(
  aadhaarUri: string,
  selfieUri: string,
  panCardUri: string,
  drivingLicenseUri: string | null,
  upiId: string,
  bankDetails?: {
    bankAccountHolder?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    bankName?: string;
    vehicleType?: string;
  }
): Promise<{
  partnerId: string;
  status: string;
  message: string;
  queued: boolean;
}> {
  const token = getGlobalAuthToken();
  const formData = new FormData();

  // Append Aadhaar image
  if (aadhaarUri.startsWith("http")) {
    formData.append("aadhaarUrl", aadhaarUri);
  } else {
    formData.append("aadhaar", {
      uri: aadhaarUri,
      type: "image/jpeg",
      name: "aadhaar.jpg",
    } as any);
  }

  // Append selfie image
  if (selfieUri.startsWith("http")) {
    formData.append("selfieUrl", selfieUri);
  } else {
    formData.append("selfie", {
      uri: selfieUri,
      type: "image/jpeg",
      name: "selfie.jpg",
    } as any);
  }

  // Append PAN image
  if (panCardUri) {
    if (panCardUri.startsWith("http")) {
      formData.append("panCardUrl", panCardUri);
    } else {
      formData.append("panCard", {
        uri: panCardUri,
        type: "image/jpeg",
        name: "pancard.jpg",
      } as any);
    }
  }

  // Append License image
  if (drivingLicenseUri) {
    if (drivingLicenseUri.startsWith("http")) {
      formData.append("drivingLicenseUrl", drivingLicenseUri);
    } else {
      formData.append("drivingLicense", {
        uri: drivingLicenseUri,
        type: "image/jpeg",
        name: "license.jpg",
      } as any);
    }
  }

  // Append text fields
  formData.append("upiId", upiId);
  if (bankDetails?.bankAccountHolder)
    formData.append("bankAccountHolder", bankDetails.bankAccountHolder);
  if (bankDetails?.bankAccountNumber)
    formData.append("bankAccountNumber", bankDetails.bankAccountNumber);
  if (bankDetails?.bankIfsc)
    formData.append("bankIfsc", bankDetails.bankIfsc);
  if (bankDetails?.bankName)
    formData.append("bankName", bankDetails.bankName);
  if (bankDetails?.vehicleType)
    formData.append("vehicleType", bankDetails.vehicleType);

  const response = await axios.post(
    `${API_BASE_URL}/onboarding/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 60000,
    }
  );

  return response.data;
}

/**
 * Get real-time onboarding processing status.
 */
export interface OnboardingStep {
  name: string;
  label: string;
  order: number;
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface OnboardingStatus {
  hasApplication: boolean;
  partnerId?: string;
  status?: "pending" | "processing" | "verified" | "rejected";
  overallScore?: number;
  progress?: number;
  steps?: OnboardingStep[];
  decisionMadeAt?: string;
  createdAt?: string;
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiRequest<OnboardingStatus>("/onboarding/status");
}

/**
 * Submit reviewed/edited data with terms acceptance.
 */
export async function submitOnboardingReview(data: {
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  upiId?: string;
  vehicleType?: string;
  termsAccepted: boolean;
}): Promise<any> {
  return apiRequest("/onboarding/review", {
    method: "PUT",
    body: data,
  });
}

/**
 * Get final onboarding result with scores and rejection reasons.
 */
export interface RejectionReason {
  code: string;
  message: string;
  suggestion: string;
  weight?: number;
  score?: number;
}

export interface OnboardingResult {
  partnerId: string;
  status: "verified" | "rejected" | "processing" | "pending";
  profile: {
    fullName: string | null;
    dateOfBirth: string | null;
    age: number | null;
    gender: string | null;
    address: string | null;
    aadhaarMasked: string | null;
    upiId: string | null;
    bankAccountHolder: string | null;
    bankName: string | null;
    vehicleType: string | null;
    aadhaarImageUrl: string | null;
    selfieImageUrl: string | null;
    panCardImageUrl: string | null;
    drivingLicenseImageUrl: string | null;
  };
  scores: {
    overall: number;
    aadhaarAuthenticity: number;
    faceMatch: number;
    ageEligibility: number;
    upiValidity: number;
    dataConsistency: number;
    imageClarity: number;
  };
  rejectionReasons: RejectionReason[];
  termsAccepted: boolean;
  decisionMadeAt: string | null;
  createdAt: string;
}

export async function getOnboardingResult(): Promise<OnboardingResult> {
  return apiRequest<OnboardingResult>("/onboarding/result");
}

export async function cancelOnboarding(): Promise<{ message: string; status: string }> {
  return apiRequest("/onboarding/cancel", {
    method: "POST",
  });
}

/**
 * Update a specific detail of an existing application.
 */
export async function updateOnboardingDetail(
  field: string,
  value?: string,
  fileUri?: string | null
): Promise<{
  success: boolean;
  message: string;
  decision: string;
  overallScore: number;
}> {
  const token = getGlobalAuthToken();
  const formData = new FormData();

  formData.append("field", field);
  
  if (value) {
    formData.append("value", value);
  }

  if (fileUri) {
    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: `${field}.jpg`,
    } as any);
  }

  const response = await axios.patch(
    `${API_BASE_URL}/onboarding/update-detail`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 60000,
    }
  );

  return response.data;
}

