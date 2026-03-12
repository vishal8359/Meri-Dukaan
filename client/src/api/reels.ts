import { apiRequest } from "./client";

export function getReelFeed(query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<{ reels: unknown[]; total: number; page: number; limit: number }>(
    `/reels/feed${suffix}`,
  );
}
