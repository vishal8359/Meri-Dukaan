import supabase from "../../../config/supabase.js";
import * as productService from "../../product/product.service.js";
import * as orderService from "../../order/order.service.js";

/**
 * View incoming orders for the shop owner's store.
 */
export async function viewStoreOrders(_args, userId, userContext) {
  try {
    const storeId = userContext?.storeId;
    if (!storeId) {
      return { text: "You don't seem to own a store. Please create a store first.", cards: [] };
    }

    const orders = await orderService.listByStore(storeId, userId);
    const recent = (orders || []).slice(0, 10);

    if (recent.length === 0) {
      return { text: "No orders yet for your store. Once customers order, they'll appear here.", cards: [] };
    }

    const pending = recent.filter((o) => o.status === "processing").length;
    const summary = recent.slice(0, 5).map((o) => {
      const total = o.total_price || o.total_amount || 0;
      const itemCount = o.items?.length || 0;
      return `• #${String(o.id).slice(0, 8).toUpperCase()} — ₹${total} — ${o.status} (${itemCount} items)`;
    }).join("\n");

    return {
      text: `📊 **Store Orders** (${pending} pending)\n\nRecent orders:\n${summary}\n\nTotal orders: ${orders.length}`,
      cards: recent.slice(0, 5).map((o) => ({
        type: "order",
        data: {
          id: o.id,
          shortId: String(o.id).slice(0, 8).toUpperCase(),
          total: o.total_price || o.total_amount || 0,
          status: o.status,
          items: (o.items || []).map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          createdAt: o.created_at,
        },
      })),
    };
  } catch (err) {
    return { text: `Could not fetch store orders: ${err.message}`, cards: [] };
  }
}

/**
 * Add a product to the owner's store.
 */
export async function addProduct({ name, type, realPrice, offerPrice, stock, description }, userId, userContext) {
  try {
    const storeId = userContext?.storeId;
    if (!storeId) {
      return { text: "You don't seem to own a store. Please create one first.", cards: [] };
    }

    const product = await productService.create(storeId, {
      name,
      type: type || "general",
      realPrice: realPrice || 0,
      offerPrice: offerPrice || realPrice || 0,
      stock: stock || 0,
      description: description || "",
      available: true,
    });

    return {
      text: `✅ Product "${name}" added successfully!\n\nPrice: ₹${offerPrice || realPrice}\nStock: ${stock || 0}\nCategory: ${type || "general"}`,
      cards: [{
        type: "product",
        data: {
          id: product.id,
          name: product.name,
          category: product.type,
          realPrice: product.real_price,
          offerPrice: product.offer_price,
          stock: product.stock,
          storeId,
          storeName: userContext.storeName,
        },
      }],
    };
  } catch (err) {
    return { text: `Could not add product: ${err.message}`, cards: [] };
  }
}

/**
 * Update a product in the owner's store.
 */
export async function updateProduct({ productId, name, realPrice, offerPrice, stock, description, available }, userId, userContext) {
  try {
    const storeId = userContext?.storeId;
    if (!storeId) {
      return { text: "Store not found.", cards: [] };
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (realPrice !== undefined) updates.realPrice = realPrice;
    if (offerPrice !== undefined) updates.offerPrice = offerPrice;
    if (stock !== undefined) updates.stock = stock;
    if (description !== undefined) updates.description = description;
    if (available !== undefined) updates.available = available;

    const product = await productService.update(productId, storeId, updates);

    return {
      text: `✅ Product "${product.name}" updated successfully.`,
      cards: [{
        type: "product",
        data: {
          id: product.id,
          name: product.name,
          realPrice: product.real_price,
          offerPrice: product.offer_price,
          stock: product.stock,
        },
      }],
    };
  } catch (err) {
    return { text: `Could not update product: ${err.message}`, cards: [] };
  }
}

/**
 * Get basic store analytics.
 */
export async function getStoreAnalytics(_args, userId, userContext) {
  try {
    const storeId = userContext?.storeId;
    if (!storeId) {
      return { text: "Store not found.", cards: [] };
    }

    const [ordersResult, productsResult] = await Promise.all([
      supabase
        .from("order_items")
        .select("order_id, price, quantity")
        .eq("store_id", storeId),
      supabase
        .from("products")
        .select("id, name, stock")
        .eq("store_id", storeId)
        .eq("shown", true),
    ]);

    const orderItems = ordersResult.data || [];
    const products = productsResult.data || [];

    const totalRevenue = orderItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
    const uniqueOrders = new Set(orderItems.map((i) => i.order_id));
    const lowStock = products.filter((p) => (p.stock || 0) < 5);

    return {
      text: `📊 **Store Analytics — ${userContext.storeName}**\n\n• Total Orders: ${uniqueOrders.size}\n• Total Revenue: ₹${totalRevenue.toFixed(2)}\n• Active Products: ${products.length}\n• Low Stock Items: ${lowStock.length}${lowStock.length > 0 ? ` (${lowStock.map((p) => p.name).join(", ")})` : ""}`,
      cards: [],
    };
  } catch (err) {
    return { text: `Could not fetch analytics: ${err.message}`, cards: [] };
  }
}

// ── Tool Definitions ─────────────────────────────────────────

export const definitions = [
  {
    type: "function",
    function: {
      name: "viewStoreOrders",
      description: "View incoming orders for the shop owner's store. Use when owner asks about orders, new orders, or pending orders.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "addProduct",
      description: "Add a new product to the shop owner's store. Collect name, type, price, and stock before calling.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name" },
          type: { type: "string", description: "Product category/type" },
          realPrice: { type: "number", description: "MRP / original price" },
          offerPrice: { type: "number", description: "Selling / offer price" },
          stock: { type: "integer", description: "Available stock quantity" },
          description: { type: "string", description: "Product description" },
        },
        required: ["name", "realPrice"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateProduct",
      description: "Update an existing product in the owner's store. Specify productId and fields to change.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "UUID of the product to update" },
          name: { type: "string", description: "New product name" },
          realPrice: { type: "number", description: "New MRP" },
          offerPrice: { type: "number", description: "New offer price" },
          stock: { type: "integer", description: "New stock quantity" },
          description: { type: "string", description: "New description" },
          available: { type: "boolean", description: "Product availability" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getStoreAnalytics",
      description: "Get analytics summary for the shop owner's store (orders, revenue, low stock). Use when owner asks about analytics, performance, or overview.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export const handlers = {
  viewStoreOrders,
  addProduct,
  updateProduct,
  getStoreAnalytics,
};
