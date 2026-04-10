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
  const aadhaarFile = {
    uri: aadhaarUri,
    type: "image/jpeg",
    name: "aadhaar.jpg",
  } as any;
  formData.append("aadhaar", aadhaarFile);

  // Append selfie image
  const selfieFile = {
    uri: selfieUri,
    type: "image/jpeg",
    name: "selfie.jpg",
  } as any;
  formData.append("selfie", selfieFile);

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
