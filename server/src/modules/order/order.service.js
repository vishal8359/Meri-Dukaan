import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";
import * as cartService from "../cart/cart.service.js";

async function place(userId, { storeId, items }) {
  // Look up current product prices to compute total & capture price_at_purchase
  const productIds = items.map((i) => i.productId);

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, offer_price, stock, available")
    .in("id", productIds)
    .eq("store_id", storeId);

  if (pErr) throw pErr;

  const priceMap = new Map(products.map((p) => [p.id, p]));

  // Validate all products exist, belong to the store, and are available
  const orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = priceMap.get(item.productId);
    if (!product) throw AppError.badRequest(`Product ${item.productId} not found in this store`);
    if (!product.available) throw AppError.badRequest(`Product ${item.productId} is not available`);
    if (product.stock < item.quantity) throw AppError.badRequest(`Insufficient stock for product ${item.productId}`);

    const priceAtPurchase = product.offer_price;
    totalPrice += priceAtPurchase * item.quantity;
    orderItems.push({ productId: item.productId, quantity: item.quantity, priceAtPurchase });
  }

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      store_id: storeId,
      total_price: totalPrice,
      status: "processing",
    })
    .select()
    .single();

  if (orderErr) throw orderErr;

  // Insert order items
  const rows = orderItems.map((oi) => ({
    order_id: order.id,
    product_id: oi.productId,
    quantity: oi.quantity,
    price_at_purchase: oi.priceAtPurchase,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(rows);
  if (itemsErr) throw itemsErr;

  // Decrement stock for purchased products
  for (const oi of orderItems) {
    const product = priceMap.get(oi.productId);
    await supabase
      .from("products")
      .update({ stock: product.stock - oi.quantity })
      .eq("id", oi.productId);
  }

  // Clear cart after order
  await cartService.clear(userId);

  return { ...order, items: rows };
}

async function listByUser(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(id, name)), store:stores(id, store_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(orderId, userId) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(id, name, images:product_images(image_url))), store:stores(id, store_name)")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error || !order) throw AppError.notFound("Order not found");
  return order;
}

async function updateStatus(orderId, status) {
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !order) throw AppError.notFound("Order not found");
  return order;
}

export { place, listByUser, findById, updateStatus };
