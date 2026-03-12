import { apiRequest } from "./client";

export function placeOrder(token: string, body: { storeId: string; items: Array<{ productId: string; quantity: number }> }) {
  return apiRequest<{ order: unknown }>("/orders", {
    method: "POST",
    token,
    body,
  });
}

export function getOrders(token: string) {
  return apiRequest<{ orders: unknown[] }>("/orders", { token });
}

export function getOrderById(token: string, id: string) {
  return apiRequest<{ order: unknown }>(`/orders/${id}`, { token });
}
