// src/hooks/useNotificationBridge.ts
//
// Bridges AppContext events → NotificationContext.
// Drop this hook into any top-level component that is inside both providers.
// It watches orders array for status transitions and auto-pushes notifications.

import { useEffect, useRef } from "react";
import { Order, useApp } from "../context/AppContext";
import { useNotifications } from "../context/NotificationContext";

/** Friendly copy for each order status */
const STATUS_COPY: Record<
  Order["status"],
  { title: string; body: (id: string) => string }
> = {
  processing: {
    title: "Order Placed",
    body: (id) =>
      `Your order #${id.slice(-8)} has been placed and is being prepared.`,
  },
  "in-transit": {
    title: "Order Shipped!",
    body: (id) => `Your order #${id.slice(-8)} is on its way. Sit tight!`,
  },
  delivered: {
    title: "Order Delivered",
    body: (id) => `Your order #${id.slice(-8)} has been delivered. Enjoy!`,
  },
  cancelled: {
    title: "Order Cancelled",
    body: (id) => `Your order #${id.slice(-8)} has been cancelled.`,
  },
};

/**
 * Call this once near the root (e.g. inside _layout or a wrapper component).
 * It listens without rendering anything.
 */
export function useNotificationBridge() {
  const { orders } = useApp();
  const { push } = useNotifications();

  // Keep a snapshot of previously-seen order statuses so we only fire on *changes*
  const prevSnapshotRef = useRef<Map<string, Order["status"]>>(new Map());

  useEffect(() => {
    const prev = prevSnapshotRef.current;

    for (const order of orders) {
      const oldStatus = prev.get(order.id);

      if (oldStatus === undefined) {
        // Brand-new order — fire "processing" notification only for newly placed
        if (order.status === "processing") {
          push(
            "order_placed",
            STATUS_COPY.processing.title,
            STATUS_COPY.processing.body(order.id),
            {
              route: `/myorders/${order.id}`,
              meta: { orderId: order.id },
            },
          );
        }
      } else if (oldStatus !== order.status) {
        // Status changed — map to notification type
        const typeMap: Record<Order["status"], Parameters<typeof push>[0]> = {
          processing: "order_confirmed",
          "in-transit": "order_shipped",
          delivered: "order_delivered",
          cancelled: "order_cancelled",
        };
        const copy = STATUS_COPY[order.status];
        push(typeMap[order.status], copy.title, copy.body(order.id), {
          route: `/myorders/${order.id}`,
          meta: { orderId: order.id },
        });
      }
    }

    // Rebuild snapshot
    const next = new Map<string, Order["status"]>();
    for (const o of orders) next.set(o.id, o.status);
    prevSnapshotRef.current = next;
  }, [orders, push]);
}
