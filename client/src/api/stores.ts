import { apiRequest } from "./client";

export function getStores(query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<{ stores: unknown[]; total: number; page: number; limit: number }>(
    `/stores${suffix}`,
  );
}

export function getStoreById(storeId: string) {
  return apiRequest<{ store: unknown }>(`/stores/${storeId}`);
}

export function createStore(token: string, body: unknown) {
  return apiRequest<{ store: unknown }>("/stores", {
    method: "POST",
    token,
    body,
  });
}
