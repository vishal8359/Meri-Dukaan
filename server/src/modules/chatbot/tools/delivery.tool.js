import supabase from "../../../config/supabase.js";

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

    const summary = deliveries.map((o) => {
      const total = o.total_price || o.total_amount || 0;
      return `• #${String(o.id).slice(0, 8).toUpperCase()} — ₹${total} — ${o.status}\n  📍 ${o.delivery_address || "No address"}`;
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
 */
export async function updateDeliveryStatus({ orderId, status }, userId) {
  try {
    const validStatuses = ["processing", "in-transit", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return {
        text: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
        cards: [],
      };
    }

    // Find THE order (delivery partners should be able to update any order)
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id, status")
      .single();

    if (error || !order) {
      return { text: "Order not found. Please check the order ID.", cards: [] };
    }

    const statusEmoji = {
      processing: "🔄",
      "in-transit": "🚚",
      delivered: "✅",
      cancelled: "❌",
    };

    return {
      text: `${statusEmoji[status] || "📋"} Order #${String(orderId).slice(0, 8).toUpperCase()} status updated to **${status}**.`,
      cards: [{
        type: "order",
        data: {
          id: order.id,
          shortId: String(order.id).slice(0, 8).toUpperCase(),
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
 */
export async function getDeliveryDetails({ orderId }) {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, total_price, total_amount, delivery_address, delivery_phone, payment_method, payment_status, created_at, user:users(name, phone), items:order_items(name, quantity, price, store_name)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { text: "Order not found.", cards: [] };
    }

    const total = order.total_price || order.total_amount || 0;
    const itemList = (order.items || []).map((i) => `  • ${i.name} x${i.quantity}`).join("\n");

    return {
      text: `📦 **Delivery #${String(order.id).slice(0, 8).toUpperCase()}**\n\nStatus: ${order.status}\nTotal: ₹${total}\nPayment: ${order.payment_method} (${order.payment_status})\n\nCustomer: ${order.user?.name || "Unknown"}\nPhone: ${order.delivery_phone || order.user?.phone || "N/A"}\n📍 Address: ${order.delivery_address || "Not provided"}\n\nItems:\n${itemList}`,
      cards: [{
        type: "delivery",
        data: {
          id: order.id,
          shortId: String(order.id).slice(0, 8).toUpperCase(),
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
      description: "Update the delivery status of an order. Valid statuses: processing, in-transit, delivered, cancelled.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "UUID of the order to update" },
          status: { type: "string", enum: ["processing", "in-transit", "delivered", "cancelled"], description: "New delivery status" },
        },
        required: ["orderId", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getDeliveryDetails",
      description: "Get full details of a delivery including customer info, address, and items. Use when partner asks about a specific delivery.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "UUID of the order/delivery" },
        },
        required: ["orderId"],
      },
    },
  },
];

export const handlers = {
  getAssignedDeliveries,
  updateDeliveryStatus,
  getDeliveryDetails,
};
