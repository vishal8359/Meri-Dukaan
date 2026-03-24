import { apiRequest } from "./client";

export function placeOrder(
  token: string,
  body: {
    storeId: string;
    items: { productId: string; quantity: number }[];
    paymentMethod?: "cod";
    deliveryFee: number;
    deliveryAddress: string;
    deliveryPhone: string;
  },
) {
  return apiRequest<{ order: unknown }>("/orders", {
    method: "POST",
    token,
    body,
  });
}

export function createOnlineOrder(
  token: string,
  body: {
    storeId: string;
    items: { productId: string; quantity: number }[];
    deliveryFee: number;
    deliveryAddress: string;
    deliveryPhone: string;
  },
) {
  return apiRequest<{
    localOrderId: string;
    checkout: {
      keyId: string;
      orderId: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
    };
  }>("/orders/online/create", {
    method: "POST",
    token,
    body,
  });
}

export function verifyOnlinePayment(
  token: string,
  body: {
    localOrderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) {
  return apiRequest<{ order: unknown; message: string }>("/orders/online/verify", {
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

export function updateOrderStatus(
  token: string,
  id: string,
  status: "processing" | "confirmed" | "in-transit" | "delivered" | "cancelled",
) {
  return apiRequest<{ order: unknown }>(`/orders/${id}/status`, {
    method: "PUT",
    token,
    body: { status },
  });
}
