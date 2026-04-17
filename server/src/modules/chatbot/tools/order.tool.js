import * as orderService from "../../order/order.service.js";
import * as cartService from "../../cart/cart.service.js";
import supabase from "../../../config/supabase.js";

/**
 * Place an order from the user's cart.
 */
export async function placeOrder({ storeId, deliveryAddress, deliveryPhone }, userId) {
  try {
    // Get cart items to build order
    const { items } = await cartService.getItems(userId);

    if (!items || items.length === 0) {
      return {
        text: "Your cart is empty. Add some products first before placing an order.",
        cards: [],
      };
    }

    // Group items by store
    const itemsByStore = {};
    for (const item of items) {
      const sid = item.product?.store_id || storeId;
      if (!sid) continue;
      if (!itemsByStore[sid]) itemsByStore[sid] = [];
      itemsByStore[sid].push({
        productId: item.product_id || item.product?.id,
        quantity: item.quantity,
      });
    }

    // If storeId is provided, only order from that store
    // Otherwise use the first store in cart
    const targetStoreId = storeId || Object.keys(itemsByStore)[0];
    const targetItems = itemsByStore[targetStoreId];

    if (!targetItems || targetItems.length === 0) {
      return {
        text: "No items found for the specified store. Please check your cart.",
        cards: [],
      };
    }

    const order = await orderService.place(userId, {
      storeId: targetStoreId,
      items: targetItems,
      deliveryFee: 0,
      deliveryAddress: deliveryAddress || null,
      deliveryPhone: deliveryPhone || null,
    });

    const total = order.total_price || order.total_amount || 0;

    return {
      text: `✅ Order placed successfully!\n\nOrder ID: #${String(order.id).slice(0, 8).toUpperCase()}\nTotal: ₹${total}\nPayment: Cash on Delivery\nStatus: Processing\n\nYou can track your order anytime by saying "track my order".`,
      cards: [{
        type: "order",
        data: {
          id: order.id,
          shortId: String(order.id).slice(0, 8).toUpperCase(),
          total,
          status: order.status || "processing",
          paymentMethod: "cod",
          items: order.items || [],
          createdAt: order.created_at,
        },
      }],
    };
  } catch (err) {
    return {
      text: `Could not place order: ${err.message || "Something went wrong"}. Please try again.`,
      cards: [],
    };
  }
}

/**
 * Track a specific order or get latest order status.
 */
export async function trackOrder({ orderId }, userId) {
  try {
    let order;

    if (orderId) {
      order = await orderService.findById(orderId, userId);
    } else {
      // Get the most recent order
      const orders = await orderService.listByUser(userId);
      order = orders?.[0];
    }

    if (!order) {
      return {
        text: "No orders found. Place an order first!",
        cards: [],
      };
    }

    const statusEmoji = {
      processing: "🔄",
      confirmed: "✅",
      "in-transit": "🚚",
      delivered: "📦",
      cancelled: "❌",
    };

    const emoji = statusEmoji[order.status] || "📋";
    const total = order.total_price || order.total_amount || 0;
    const itemCount = order.items?.length || 0;

    return {
      text: `${emoji} **Order #${String(order.id).slice(0, 8).toUpperCase()}**\n\nStatus: ${order.status?.toUpperCase()}\nTotal: ₹${total}\nItems: ${itemCount}\nPayment: ${order.payment_method || "COD"} (${order.payment_status || "pending"})\nPlaced: ${new Date(order.created_at).toLocaleDateString("en-IN")}`,
      cards: [{
        type: "order",
        data: {
          id: order.id,
          shortId: String(order.id).slice(0, 8).toUpperCase(),
          total,
          status: order.status,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          items: (order.items || []).map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price || i.price_at_purchase,
          })),
          createdAt: order.created_at,
        },
      }],
    };
  } catch (err) {
    return {
      text: `Could not fetch order: ${err.message || "Unknown error"}.`,
      cards: [],
    };
  }
}

/**
 * List recent orders.
 */
export async function listOrders(_args, userId) {
  try {
    const orders = await orderService.listByUser(userId);
    const recent = (orders || []).slice(0, 5);

    if (recent.length === 0) {
      return {
        text: "You haven't placed any orders yet. Start shopping by searching for products!",
        cards: [],
      };
    }

    const summary = recent.map((o) => {
      const total = o.total_price || o.total_amount || 0;
      return `• #${String(o.id).slice(0, 8).toUpperCase()} — ₹${total} — ${o.status}`;
    }).join("\n");

    return {
      text: `Your recent orders:\n${summary}`,
      cards: recent.map((o) => ({
        type: "order",
        data: {
          id: o.id,
          shortId: String(o.id).slice(0, 8).toUpperCase(),
          total: o.total_price || o.total_amount || 0,
          status: o.status,
          paymentMethod: o.payment_method,
          createdAt: o.created_at,
        },
      })),
    };
  } catch (err) {
    return {
      text: `Could not list orders: ${err.message || "Unknown error"}.`,
      cards: [],
    };
  }
}

// ── Tool Definitions ─────────────────────────────────────────

export const definitions = [
  {
    type: "function",
    function: {
      name: "placeOrder",
      description: "Place an order from the user's cart. Ask for delivery address before calling. Use when user says to place/confirm/submit their order.",
      parameters: {
        type: "object",
        properties: {
          storeId: { type: "string", description: "Store ID to order from. If not given, uses the first store in cart." },
          deliveryAddress: { type: "string", description: "Delivery address for the order" },
          deliveryPhone: { type: "string", description: "Phone number for delivery contact" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trackOrder",
      description: "Track the status of an order. If no orderId given, tracks the most recent order. Use when user asks about order status, delivery, or 'where is my order'.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "Specific order UUID to track. Leave empty for latest order." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listOrders",
      description: "List the user's recent orders. Use when user asks to see all orders or order history.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

export const handlers = {
  placeOrder,
  trackOrder,
  listOrders,
};
