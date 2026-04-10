import eventBus from "../../lib/eventBus.js";
import { getQueue } from "../../lib/notificationQueue.js";
import * as notificationService from "./notification.service.js";
import supabase from "../../config/supabase.js";

// ── Helpers ────────────────────────────────────────

const TYPE_TO_CATEGORY = {
  order_placed: "orders",
  order_confirmed: "orders",
  order_shipped: "orders",
  order_delivered: "orders",
  order_cancelled: "orders",
  booking_confirmed: "orders",
  booking_cancelled: "orders",
  payment_received: "orders",
  onboarding_verified: "general",
  onboarding_rejected: "general",
  general: "general",
};

function shortId(id) {
  return String(id).slice(0, 8).toUpperCase();
}

function build(type, title, body, route, meta = {}) {
  return {
    type,
    category: TYPE_TO_CATEGORY[type] || "general",
    title,
    body,
    route,
    meta,
  };
}

async function getStoreOwner(storeId) {
  const { data } = await supabase
    .from("stores")
    .select("owner_id, store_name")
    .eq("id", storeId)
    .single();
  return data;
}

async function enqueue(userId, notification) {
  const queue = getQueue();
  if (queue) {
    await queue.add(
      "send-notification",
      { userId, notification },
      { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
    );
  } else {
    // Fallback: save synchronously when Redis/BullMQ unavailable
    await notificationService.create(userId, notification);
  }
}

// ── Event Handlers ─────────────────────────────────

export function registerEventListeners() {
  // ─── Order Placed (COD) ────────────────────────
  eventBus.on("order.placed", async ({ userId, order }) => {
    try {
      const total = order.total_price || order.total_amount || 0;
      const oid = shortId(order.id);

      await enqueue(
        userId,
        build(
          "order_placed",
          "Order Placed!",
          `Your order #${oid} worth ₹${total} has been placed successfully.`,
          `/myorders/${order.id}`,
          { orderId: order.id },
        ),
      );

      const store = await getStoreOwner(order.store_id);
      if (store?.owner_id && store.owner_id !== userId) {
        await enqueue(
          store.owner_id,
          build(
            "order_placed",
            "New Order Received!",
            `You received order #${oid} worth ₹${total}.`,
            `/meri_dukaan/my-dukaan`,
            { orderId: order.id, storeName: store.store_name },
          ),
        );
      }
    } catch (err) {
      console.error("[notification-listener] order.placed:", err.message);
    }
  });

  // ─── Order Payment Verified (Online) ───────────
  eventBus.on("order.payment_verified", async ({ userId, order }) => {
    try {
      const total = order.total_price || order.total_amount || 0;
      const oid = shortId(order.id);

      await enqueue(
        userId,
        build(
          "payment_received",
          "Payment Confirmed!",
          `Payment of ₹${total} for order #${oid} is confirmed.`,
          `/myorders/${order.id}`,
          { orderId: order.id },
        ),
      );

      const store = await getStoreOwner(order.store_id);
      if (store?.owner_id && store.owner_id !== userId) {
        await enqueue(
          store.owner_id,
          build(
            "payment_received",
            "Payment Received!",
            `₹${total} received for order #${oid}.`,
            `/meri_dukaan/my-dukaan`,
            { orderId: order.id, storeName: store.store_name },
          ),
        );
      }
    } catch (err) {
      console.error(
        "[notification-listener] order.payment_verified:",
        err.message,
      );
    }
  });

  // ─── Order Status Changed ─────────────────────
  eventBus.on("order.status_changed", async ({ order, newStatus }) => {
    try {
      const oid = shortId(order.id);
      const buyerId = order.user_id;

      const statusMap = {
        processing: {
          type: "order_confirmed",
          title: "Order Confirmed",
          body: `Your order #${oid} is being prepared.`,
        },
        "in-transit": {
          type: "order_shipped",
          title: "Order Shipped!",
          body: `Your order #${oid} is on its way.`,
        },
        delivered: {
          type: "order_delivered",
          title: "Order Delivered!",
          body: `Your order #${oid} has been delivered. Enjoy!`,
        },
        cancelled: {
          type: "order_cancelled",
          title: "Order Cancelled",
          body: `Your order #${oid} has been cancelled.`,
        },
      };

      const info = statusMap[newStatus];
      if (info && buyerId) {
        await enqueue(
          buyerId,
          build(info.type, info.title, info.body, `/myorders/${order.id}`, {
            orderId: order.id,
          }),
        );
      }
    } catch (err) {
      console.error(
        "[notification-listener] order.status_changed:",
        err.message,
      );
    }
  });

  // ─── Service Booking Created ──────────────────
  eventBus.on("booking.created", async ({ userId, booking }) => {
    try {
      const serviceName = booking.service?.name || "Service";
      const storeName = booking.store?.store_name || "Store";
      const bid = shortId(booking.id);

      await enqueue(
        userId,
        build(
          "booking_confirmed",
          "Booking Confirmed!",
          `Your booking #${bid} for ${serviceName} at ${storeName} is confirmed.`,
          `/bookings/services`,
          { bookingId: booking.id },
        ),
      );

      if (booking.store_id) {
        const store = await getStoreOwner(booking.store_id);
        if (store?.owner_id && store.owner_id !== userId) {
          await enqueue(
            store.owner_id,
            build(
              "booking_confirmed",
              "New Booking!",
              `New booking #${bid} for ${serviceName}.`,
              `/meri_dukaan/my-dukaan`,
              { bookingId: booking.id, storeName: store.store_name },
            ),
          );
        }
      }
    } catch (err) {
      console.error("[notification-listener] booking.created:", err.message);
    }
  });

  // ─── Service Booking Payment Verified ─────────
  eventBus.on("booking.payment_verified", async ({ userId, booking }) => {
    try {
      const serviceName = booking.service?.name || "Service";
      const bid = shortId(booking.id);

      await enqueue(
        userId,
        build(
          "payment_received",
          "Booking Payment Confirmed!",
          `Payment for booking #${bid} (${serviceName}) is confirmed.`,
          `/bookings/services`,
          { bookingId: booking.id },
        ),
      );

      if (booking.store_id) {
        const store = await getStoreOwner(booking.store_id);
        if (store?.owner_id && store.owner_id !== userId) {
          await enqueue(
            store.owner_id,
            build(
              "payment_received",
              "Booking Payment Received!",
              `Payment received for booking #${bid}.`,
              `/meri_dukaan/my-dukaan`,
              { bookingId: booking.id, storeName: store.store_name },
            ),
          );
        }
      }
    } catch (err) {
      console.error(
        "[notification-listener] booking.payment_verified:",
        err.message,
      );
    }
  });

  // ─── Service Booking Cancelled ────────────────
  eventBus.on("booking.cancelled", async ({ userId, booking }) => {
    try {
      const serviceName = booking.service?.name || "Service";
      const bid = shortId(booking.id);

      await enqueue(
        userId,
        build(
          "booking_cancelled",
          "Booking Cancelled",
          `Your booking #${bid} for ${serviceName} has been cancelled.`,
          `/bookings/services`,
          { bookingId: booking.id },
        ),
      );

      if (booking.store_id) {
        const store = await getStoreOwner(booking.store_id);
        if (store?.owner_id && store.owner_id !== userId) {
          await enqueue(
            store.owner_id,
            build(
              "booking_cancelled",
              "Booking Cancelled",
              `Booking #${bid} for ${serviceName} was cancelled.`,
              `/meri_dukaan/my-dukaan`,
              { bookingId: booking.id, storeName: store.store_name },
            ),
          );
        }
      }
    } catch (err) {
      console.error("[notification-listener] booking.cancelled:", err.message);
    }
  });

  // ─── Onboarding Verified ───────────────────────
  eventBus.on("onboarding:verified", async ({ userId, partnerId, score }) => {
    try {
      await enqueue(
        userId,
        build(
          "onboarding_verified",
          "🎉 You're Verified!",
          `Congratulations! You are now a verified myBusz delivery partner. Score: ${score}/100`,
          `/Transporter/transporter`,
          { partnerId, score },
        ),
      );
    } catch (err) {
      console.error("[notification-listener] onboarding:verified:", err.message);
    }
  });

  // ─── Onboarding Rejected ──────────────────────
  eventBus.on("onboarding:rejected", async ({ userId, partnerId, reasons, score }) => {
    try {
      const reasonText = (reasons || [])
        .map((r) => r.message)
        .join(", ") || "Verification requirements not met";

      await enqueue(
        userId,
        build(
          "onboarding_rejected",
          "Application Update",
          `Your delivery partner application was not approved: ${reasonText}`,
          `/Transporter/transporter`,
          { partnerId, reasons, score },
        ),
      );
    } catch (err) {
      console.error("[notification-listener] onboarding:rejected:", err.message);
    }
  });

  console.info("[notification-listener] Event listeners registered");
}
