import { apiRequest } from "./client";

export function getCart(token: string) {
  return apiRequest<{ cartId: string; items: unknown[] }>("/cart", { token });
}

export function addToCart(token: string, productId: string, quantity = 1) {
  return apiRequest<{ item: unknown }>("/cart", {
    method: "POST",
    token,
    body: { productId, quantity },
  });
}

export function updateCartItem(token: string, itemId: string, quantity: number) {
  return apiRequest<{ item: unknown }>(`/cart/${itemId}`, {
    method: "PUT",
    token,
    body: { quantity },
  });
}

export function removeCartItem(token: string, itemId: string) {
  return apiRequest<{ message: string }>(`/cart/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export function clearCart(token: string) {
  return apiRequest<{ message: string }>("/cart", {
    method: "DELETE",
    token,
  });
}
