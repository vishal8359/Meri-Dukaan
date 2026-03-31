import { apiRequest } from "./client";

export function getWishlist(token: string) {
  return apiRequest<{ items: unknown[] }>("/wishlist", { token });
}

export function addToWishlist(
  token: string,
  body: {
    itemId: string;
    name: string;
    price: number;
    type: "product" | "service" | "store";
    description?: string;
    image?: string;
    rating?: number;
    storeName?: string;
    storeId?: string;
    category?: string;
  },
) {
  return apiRequest<{ item: unknown }>("/wishlist", {
    method: "POST",
    token,
    body,
  });
}

export function removeFromWishlist(token: string, itemId: string) {
  return apiRequest<{ message: string }>(`/wishlist/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export function clearWishlist(token: string) {
  return apiRequest<{ message: string }>("/wishlist", {
    method: "DELETE",
    token,
  });
}
