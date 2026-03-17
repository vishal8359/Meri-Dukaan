import { apiRequest } from "./client";

function buildQueryString(query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export interface CreateStorePayload {
  storeName: string;
  category: string;
  location: string;
  images?: string[];
}

export interface UpdateStorePayload {
  storeName?: string;
  category?: string;
  location?: string;
}

export interface AddStoreImagePayload {
  imageUrl: string;
}

export interface AddProductPayload {
  name: string;
  type: string;
  realPrice: number;
  offerPrice: number;
  stock: number;
  description?: string;
  available?: boolean;
  images?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  type?: string;
  realPrice?: number;
  offerPrice?: number;
  stock?: number;
  description?: string;
  available?: boolean;
}

export interface AddServicePayload {
  name: string;
  type: string;
  availability?: boolean;
  timings: string;
  description: string;
}

export interface UpdateServicePayload {
  name?: string;
  type?: string;
  availability?: boolean;
  timings?: string;
  description?: string;
}

export function getStores(query?: Record<string, string | number | undefined>) {
  const suffix = buildQueryString(query);
  return apiRequest<{
    stores: unknown[];
    total: number;
    page: number;
    limit: number;
  }>(`/stores${suffix}`);
}

export function getStoreById(storeId: string) {
  return apiRequest<{ store: unknown }>(`/stores/${storeId}`);
}

export function getMyStore(token: string) {
  return apiRequest<{ store: unknown }>("/stores/me/store", {
    token,
  });
}

export function createStore(token: string, body: CreateStorePayload) {
  return apiRequest<{ store: unknown }>("/stores", {
    method: "POST",
    token,
    body,
  });
}

export function updateStore(
  token: string,
  storeId: string,
  body: UpdateStorePayload,
) {
  return apiRequest<{ store: unknown }>(`/stores/${storeId}`, {
    method: "PUT",
    token,
    body,
  });
}

export function addStoreImage(
  token: string,
  storeId: string,
  body: AddStoreImagePayload,
) {
  return apiRequest<{ image: unknown }>(`/stores/${storeId}/images`, {
    method: "POST",
    token,
    body,
  });
}

export function removeStoreImage(
  token: string,
  storeId: string,
  imageId: string,
) {
  return apiRequest<{ message: string }>(
    `/stores/${storeId}/images/${imageId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

// Products under store
export function getStoreProducts(storeId: string) {
  return apiRequest<{ products: unknown[] }>(`/stores/${storeId}/products`);
}

export function getStoreProduct(storeId: string, productId: string) {
  return apiRequest<{ product: unknown }>(
    `/stores/${storeId}/products/${productId}`,
  );
}

export function addStoreProduct(
  token: string,
  storeId: string,
  body: AddProductPayload,
) {
  return apiRequest<{ product: unknown }>(`/stores/${storeId}/products`, {
    method: "POST",
    token,
    body,
  });
}

export function updateStoreProduct(
  token: string,
  storeId: string,
  productId: string,
  body: UpdateProductPayload,
) {
  return apiRequest<{ product: unknown }>(
    `/stores/${storeId}/products/${productId}`,
    {
      method: "PUT",
      token,
      body,
    },
  );
}

export function removeStoreProduct(
  token: string,
  storeId: string,
  productId: string,
) {
  return apiRequest<{ message: string }>(
    `/stores/${storeId}/products/${productId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export function addStoreProductImage(
  token: string,
  storeId: string,
  productId: string,
  imageUrl: string,
) {
  return apiRequest<{ image: unknown }>(
    `/stores/${storeId}/products/${productId}/images`,
    {
      method: "POST",
      token,
      body: { imageUrl },
    },
  );
}

export function removeStoreProductImage(
  token: string,
  storeId: string,
  productId: string,
  imageId: string,
) {
  return apiRequest<{ message: string }>(
    `/stores/${storeId}/products/${productId}/images/${imageId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

// Services under store
export function getStoreServices(storeId: string) {
  return apiRequest<{ services: unknown[] }>(`/stores/${storeId}/services`);
}

export function getStoreService(storeId: string, serviceId: string) {
  return apiRequest<{ service: unknown }>(
    `/stores/${storeId}/services/${serviceId}`,
  );
}

export function addStoreService(
  token: string,
  storeId: string,
  body: AddServicePayload,
) {
  return apiRequest<{ service: unknown }>(`/stores/${storeId}/services`, {
    method: "POST",
    token,
    body,
  });
}

export function updateStoreService(
  token: string,
  storeId: string,
  serviceId: string,
  body: UpdateServicePayload,
) {
  return apiRequest<{ service: unknown }>(
    `/stores/${storeId}/services/${serviceId}`,
    {
      method: "PUT",
      token,
      body,
    },
  );
}

export function removeStoreService(
  token: string,
  storeId: string,
  serviceId: string,
) {
  return apiRequest<{ message: string }>(
    `/stores/${storeId}/services/${serviceId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

// Inventory under store
export function getStoreInventory(token: string, storeId: string) {
  return apiRequest<{ inventory: unknown }>(`/stores/${storeId}/inventory`, {
    token,
  });
}
