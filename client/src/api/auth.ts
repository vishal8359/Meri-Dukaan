import { apiRequest } from "./client";

export interface BackendUser {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  profile_image?: string | null;
  location?: string | null;
  created_at?: string;
}

export interface SendOtpResponse {
  message: string;
  otp?: string;
}

export interface VerifyOtpResponse {
  isNewUser?: boolean;
  user?: BackendUser;
  token?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: string;
  location?: string;
}

export function sendPhoneOtp(phone: string) {
  return apiRequest<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    body: { phone },
  });
}

export function verifyPhoneOtp(phone: string, otp: string) {
  return apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: { phone, otp },
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<{ message: string; token: string; user: BackendUser }>(
    "/auth/register",
    {
      method: "POST",
      body: payload,
    },
  );
}

export function login(email: string, password: string) {
  return apiRequest<{ message: string; token: string; user: BackendUser }>(
    "/auth/login",
    {
      method: "POST",
      body: { email, password },
    },
  );
}

export function getMe(token: string) {
  return apiRequest<{ user: BackendUser }>("/auth/me", { token });
}

export function updateProfile(
  token: string,
  body: {
    name?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    location?: string;
  },
) {
  return apiRequest<{ user: BackendUser }>("/auth/profile", {
    method: "PUT",
    token,
    body,
  });
}
