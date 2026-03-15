import axios, { AxiosError, type Method } from "axios";
import Constants from "expo-constants";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured && configured.trim()) {
    return configured.replace(/\/$/, "");
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri && typeof hostUri === "string") {
    const host = hostUri.split(":")[0];
    return `http://${host}:5001/api`;
  }

  return "http://localhost:5001/api";
}

export const API_BASE_URL = resolveApiBaseUrl();

let globalAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  globalAuthToken = token;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token, headers = {} }: RequestOptions = {},
): Promise<T> {
  try {
    const response = await http.request<T>({
      url: path,
      method: method as Method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...(token || globalAuthToken
          ? { Authorization: `Bearer ${token ?? globalAuthToken}` }
          : {}),
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    const axiosErr = error as AxiosError;
    const status = axiosErr.response?.status ?? 500;
    const payload = axiosErr.response?.data;

    const message =
      (typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: unknown }).error)
        : axiosErr.message) || `Request failed (${status})`;

    throw new ApiError(message, status, payload);
  }
}
