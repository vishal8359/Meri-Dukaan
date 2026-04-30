import supabase from "../../../config/supabase.js";

/**
 * Resolve an order by short ID (first 8 chars of UUID).
 */
async function resolveOrderByShortId(shortId) {
  const normalised = (shortId || "").toLowerCase().replace("#", "");
  if (!normalised) return null;

  // Fetch recent orders and match by prefix
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_price, total_amount, delivery_address, delivery_phone, payment_method, payment_status, created_at")
    .in("status", ["processing", "in-transit", "confirmed"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (!orders) return null;
  return orders.find((o) => String(o.id).toLowerCase().startsWith(normalised)) || null;
}

/**
 * Get orders assigned to the delivery partner.
 */
export async function getAssignedDeliveries(_args, userId, userContext) {
  try {
    // Fetch orders that are in-transit or processing and need delivery
    // Since there's no delivery_partner_id column, we show all in-transit orders
    // In a production setup, orders would be assigned to specific partners
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, total_price, total_amount, delivery_address, delivery_phone, created_at, items:order_items(name, quantity, price, store_name)")
      .in("status", ["processing", "in-transit"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const deliveries = orders || [];

    if (deliveries.length === 0) {
      return {
        text: "No pending deliveries right now. Check back soon!",
        cards: [],
      };
    }

    // Text: Only short IDs, no raw UUIDs
    const summary = deliveries.map((o) => {
      const total = o.total_price || o.total_amount || 0;
      const shortId = String(o.id).slice(0, 8).toUpperCase();
      return `• #${shortId} — ₹${total} — ${o.status}\n  📍 ${o.delivery_address || "No address"}`;
    }).join("\n");

    return {
      text: `🚚 **Pending Deliveries (${deliveries.length})**\n\n${summary}`,
      cards: deliveries.map((o) => ({
        type: "delivery",
        data: {
          id: o.id,
          shortId: String(o.id).slice(0, 8).toUpperCase(),
          total: o.total_price || o.total_amount || 0,
          status: o.status,
          address: o.delivery_address,
          phone: o.delivery_phone,
          items: (o.items || []).map((i) => ({ name: i.name, quantity: i.quantity })),
          createdAt: o.created_at,
        },
      })),
    };
  } catch (err) {
    return { text: `Could not fetch deliveries: ${err.message}`, cards: [] };
  }
}

/**
 * Update delivery status.
 * Accepts orderShortId (8-char human-readable) instead of full UUID.
 */
export async function updateDeliveryStatus({ orderShortId, status }, userId) {
  try {
    const validStatuses = ["processing", "in-transit", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return {
        text: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
        cards: [],
      };
    }

    // RAG: Resolve order from short ID
    const orderMatch = await resolveOrderByShortId(orderShortId);
    if (!orderMatch) {
      return { text: `No order found matching "#${(orderShortId || "").toUpperCase()}". Check the order reference and try again.`, cards: [] };
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderMatch.id)
      .select("id, status")
      .single();

    if (error || !order) {
      return { text: "Could not update the order. Please try again.", cards: [] };
    }

    const statusEmoji = {
      processing: "🔄",
      "in-transit": "🚚",
      delivered: "✅",
      cancelled: "❌",
    };

    const shortId = String(order.id).slice(0, 8).toUpperCase();

    // Text: Only short ID
    return {
      text: `${statusEmoji[status] || "📋"} Order #${shortId} status updated to **${status}**.`,
      cards: [{
        type: "order",
        data: {
          id: order.id,
          shortId,
          status: order.status,
        },
      }],
    };
  } catch (err) {
    return { text: `Could not update status: ${err.message}`, cards: [] };
  }
}

/**
 * Get details of a specific delivery/order.
 * Accepts orderShortId (8-char human-readable) instead of full UUID.
 */
export async function getDeliveryDetails({ orderShortId }) {
  try {
    // RAG: Resolve order from short ID
    const orderMatch = await resolveOrderByShortId(orderShortId);
    if (!orderMatch) {
      return { text: `No delivery found matching "#${(orderShortId || "").toUpperCase()}". Check the reference and try again.`, cards: [] };
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, total_price, total_amount, delivery_address, delivery_phone, payment_method, payment_status, created_at, user:users(name, phone), items:order_items(name, quantity, price, store_name)")
      .eq("id", orderMatch.id)
      .single();

    if (error || !order) {
      return { text: "Order not found.", cards: [] };
    }

    const total = order.total_price || order.total_amount || 0;
    const itemList = (order.items || []).map((i) => `  • ${i.name} x${i.quantity}`).join("\n");
    const shortId = String(order.id).slice(0, 8).toUpperCase();

    // Text: Only short ID, no raw UUID
    return {
      text: `📦 **Delivery #${shortId}**\n\nStatus: ${order.status}\nTotal: ₹${total}\nPayment: ${order.payment_method} (${order.payment_status})\n\nCustomer: ${order.user?.name || "Unknown"}\nPhone: ${order.delivery_phone || order.user?.phone || "N/A"}\n📍 Address: ${order.delivery_address || "Not provided"}\n\nItems:\n${itemList}`,
      cards: [{
        type: "delivery",
        data: {
          id: order.id,
          shortId,
          total,
          status: order.status,
          address: order.delivery_address,
          phone: order.delivery_phone,
          customerName: order.user?.name,
          items: order.items || [],
        },
      }],
    };
  } catch (err) {
    return { text: `Could not fetch delivery details: ${err.message}`, cards: [] };
  }
}

// ── Tool Definitions ─────────────────────────────────────────

export const definitions = [
  {
    type: "function",
    function: {
      name: "getAssignedDeliveries",
      description: "Get list of pending deliveries / orders to deliver. Use when delivery partner asks about their deliveries or pending orders.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "updateDeliveryStatus",
      description: "Update the delivery status of an order. Valid statuses: processing, in-transit, delivered, cancelled. Pass the short order reference (e.g., '3A7F9B2E'), NOT a full UUID.",
      parameters: {
        type: "object",
        properties: {
          orderShortId: { type: "string", description: "Short order reference (first 8 chars, e.g., '3A7F9B2E'). NOT a full UUID." },
          status: { type: "string", enum: ["processing", "in-transit", "delivered", "cancelled"], description: "New delivery status" },
        },
        required: ["orderShortId", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getDeliveryDetails",
      description: "Get full details of a delivery including customer info, address, and items. Use when partner asks about a specific delivery. Pass the short order reference (e.g., '3A7F9B2E'), NOT a full UUID.",
      parameters: {
        type: "object",
        properties: {
          orderShortId: { type: "string", description: "Short order reference (first 8 chars, e.g., '3A7F9B2E'). NOT a full UUID." },
        },
        required: ["orderShortId"],
      },
    },
  },
];

export const handlers = {
  getAssignedDeliveries,
  updateDeliveryStatus,
  getDeliveryDetails,
};
