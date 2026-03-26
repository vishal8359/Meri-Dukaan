import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";
import * as cartService from "../cart/cart.service.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../../config/env.js";

function getRazorpayClient() {
  const keyId = env.razorpay.keyId;
  const keySecret = env.razorpay.keySecret;

  if (!keyId || !keySecret) {
    throw AppError.serviceUnavailable(
      "Online payment is unavailable. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function normalizeAmount(value) {
  return Number(Number(value).toFixed(2));
}

async function resolveOrderDraft(storeId, items, deliveryFee = 0) {
  const productIds = items.map((item) => item.productId);

  const { data: store, error: storeErr } = await supabase
    .from("stores")
    .select("id, store_name, shown")
    .eq("id", storeId)
    .single();

  if (storeErr || !store) throw AppError.badRequest("Store not found");
  if (!store.shown) throw AppError.badRequest("Store is not available");

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, name, offer_price, real_price, stock, available, shown, images:product_images(image_url)")
    .in("id", productIds)
    .eq("store_id", storeId);

  if (pErr) throw pErr;

  const priceMap = new Map((products || []).map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = priceMap.get(item.productId);
    if (!product) {
      throw AppError.badRequest(`Product ${item.productId} not found in this store`);
    }

    if (!product.shown || !product.available) {
      throw AppError.badRequest(`Product ${product.name || item.productId} is not available`);
    }

    if (Number(product.stock) < item.quantity) {
      throw AppError.badRequest(`Insufficient stock for product ${product.name || item.productId}`);
    }

    const price = normalizeAmount(product.offer_price ?? product.real_price ?? 0);
    const quantity = Number(item.quantity);
    subtotal += price * quantity;

    orderItems.push({
      product_id: item.productId,
      name: product.name,
      price,
      quantity,
      image: product.images?.[0]?.image_url || null,
      store_name: store.store_name,
      store_id: store.id,
    });
  }

  const normalizedSubtotal = normalizeAmount(subtotal);
  const normalizedDeliveryFee = normalizeAmount(deliveryFee);
  const totalAmount = normalizeAmount(normalizedSubtotal + normalizedDeliveryFee);

  return {
    store,
    orderItems,
    subtotal: normalizedSubtotal,
    deliveryFee: normalizedDeliveryFee,
    totalAmount,
  };
}

async function insertOrderWithItems(userId, payload) {
  const { orderItems, ...orderPayload } = payload;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      ...orderPayload,
    })
    .select()
    .single();

  if (orderErr || !order) throw orderErr || AppError.badRequest("Order create failed");

  const rows = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(rows);
  if (itemsErr) throw itemsErr;

  return { ...order, items: rows };
}

async function decrementStockForOrderItems(orderItems) {
  for (const item of orderItems) {
    const quantity = Number(item.quantity || 0);
    const { data, error } = await supabase.rpc("decrement_product_stock", {
      p_product_id: item.product_id,
      p_quantity: quantity,
    });

    if (error) throw error;
    if (data === null) {
      throw AppError.badRequest(`Insufficient stock for ${item.name}`);
    }
  }
}

async function place(
  userId,
  { storeId, items, deliveryFee = 0, deliveryAddress, deliveryPhone },
) {
  const draft = await resolveOrderDraft(storeId, items, deliveryFee);

  let order;
  try {
    order = await insertOrderWithItems(userId, {
      subtotal: draft.subtotal,
      delivery_fee: draft.deliveryFee,
      total_amount: draft.totalAmount,
      status: "processing",
      payment_method: "cod",
      payment_status: "pending",
      delivery_address: deliveryAddress,
      delivery_phone: deliveryPhone,
      orderItems: draft.orderItems,
    });

    await decrementStockForOrderItems(order.items);
  } catch (error) {
    if (order?.id) {
      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id)
        .eq("user_id", userId);
    }
    throw error;
  }

  await cartService.clear(userId);

  return order;
}

async function createOnline(
  userId,
  { storeId, items, deliveryFee = 0, deliveryAddress, deliveryPhone },
) {
  const draft = await resolveOrderDraft(storeId, items, deliveryFee);
  const razorpay = getRazorpayClient();

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(draft.totalAmount * 100),
    currency: "INR",
    receipt: `order_${Date.now()}`,
    notes: {
      storeId,
      userId,
    },
  });

  const order = await insertOrderWithItems(userId, {
    subtotal: draft.subtotal,
    delivery_fee: draft.deliveryFee,
    total_amount: draft.totalAmount,
    status: "processing",
    payment_method: "online",
    payment_status: "pending",
    delivery_address: deliveryAddress,
    delivery_phone: deliveryPhone,
    razorpay_order_id: razorpayOrder.id,
    orderItems: draft.orderItems,
  });

  return {
    localOrderId: order.id,
    checkout: {
      keyId: env.razorpay.keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Sangam App",
      description: `Order #${order.id.slice(0, 8)}`,
    },
  };
}

async function verifyOnlinePayment(
  userId,
  { localOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature },
) {
  const keySecret = env.razorpay.keySecret;
  if (!keySecret) {
    throw AppError.serviceUnavailable("Online payment verification is unavailable.");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", localOrderId)
    .eq("user_id", userId)
    .single();

  if (error || !order) throw AppError.notFound("Order not found");
  if (order.razorpay_order_id !== razorpayOrderId) {
    throw AppError.badRequest("Razorpay order id mismatch");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", localOrderId)
      .eq("user_id", userId);
    throw AppError.badRequest("Invalid Razorpay payment signature");
  }

  if (order.payment_status !== "paid") {
    await decrementStockForOrderItems(order.items || []);
    await cartService.clear(userId);
  }

  const { data: updated, error: updateErr } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      payment_method: "online",
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    })
    .eq("id", localOrderId)
    .eq("user_id", userId)
    .select("*, items:order_items(*)")
    .single();

  if (updateErr || !updated) throw updateErr || AppError.badRequest("Payment update failed");

  return updated;
}

async function listByUser(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(orderId, userId) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error || !order) throw AppError.notFound("Order not found");
  return order;
}

async function updateStatus(orderId, userId, status) {
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !order) throw AppError.notFound("Order not found");
  return order;
}

export {
  place,
  createOnline,
  verifyOnlinePayment,
  listByUser,
  findById,
  updateStatus,
};
