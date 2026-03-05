// src/context/NotificationContext.tsx
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

// ── Notification Types ─────────────────────────────

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "offer"
  | "new_store"
  | "price_drop"
  | "back_in_stock"
  | "store_update"
  | "general";

/** Broad category for filtering */
export type NotificationCategory =
  | "orders"
  | "promotions"
  | "stores"
  | "general";

const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  order_placed: "orders",
  order_confirmed: "orders",
  order_shipped: "orders",
  order_delivered: "orders",
  order_cancelled: "orders",
  offer: "promotions",
  price_drop: "promotions",
  back_in_stock: "promotions",
  new_store: "stores",
  store_update: "stores",
  general: "general",
};

export interface AppNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  read: boolean;
  createdAt: number; // timestamp
  /** Optional deep-link route, e.g. "/myorders/ORD123" */
  route?: string;
  /** Extra metadata (orderId, storeId, discount%, etc.) */
  meta?: Record<string, string>;
}

// ── Context shape ──────────────────────────────────

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;

  /** Push a new notification */
  push: (
    type: NotificationType,
    title: string,
    body: string,
    opts?: { route?: string; meta?: Record<string, string> },
  ) => void;

  /** Mark one notification read */
  markRead: (id: string) => void;

  /** Mark every notification read */
  markAllRead: () => void;

  /** Remove one notification */
  remove: (id: string) => void;

  /** Clear all notifications */
  clearAll: () => void;

  /** Get category for a type */
  getCategoryForType: (type: NotificationType) => NotificationCategory;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// ── Seed data (realistic demo notifications) ───────

const now = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "order_shipped",
    category: "orders",
    title: "Order Shipped!",
    body: "Your order #ORD-7F3A is on its way. Expected delivery by tomorrow.",
    read: false,
    createdAt: now - 2 * HOUR,
    route: "/myorders/orders",
    meta: { orderId: "ORD-7F3A" },
  },
  {
    id: "n2",
    type: "offer",
    category: "promotions",
    title: "Flash Sale — 30% Off!",
    body: "All dairy products at Sharma Kirana are 30% off until midnight. Don't miss out!",
    read: false,
    createdAt: now - 5 * HOUR,
    route: "/dukaan/store1",
    meta: { storeId: "store1", discount: "30" },
  },
  {
    id: "n3",
    type: "order_delivered",
    category: "orders",
    title: "Order Delivered",
    body: "Your order #ORD-2B9E has been delivered. Rate your experience!",
    read: false,
    createdAt: now - 1 * DAY,
    route: "/myorders/orders",
    meta: { orderId: "ORD-2B9E" },
  },
  {
    id: "n4",
    type: "new_store",
    category: "stores",
    title: "New Store Near You",
    body: "Organic Farms just opened 500m from your location. Check out their fresh produce!",
    read: true,
    createdAt: now - 1 * DAY - 4 * HOUR,
    route: "/dukaan/store3",
    meta: { storeId: "store3", distance: "500m" },
  },
  {
    id: "n5",
    type: "price_drop",
    category: "promotions",
    title: "Price Drop Alert",
    body: "Basmati Rice 5kg dropped from ₹480 to ₹360 at Gupta Traders.",
    read: true,
    createdAt: now - 2 * DAY,
    route: "/product/p3",
    meta: { productId: "p3", oldPrice: "480", newPrice: "360" },
  },
  {
    id: "n6",
    type: "order_confirmed",
    category: "orders",
    title: "Order Confirmed",
    body: "Your order #ORD-9D1C has been confirmed and is being prepared.",
    read: true,
    createdAt: now - 3 * DAY,
    route: "/myorders/orders",
    meta: { orderId: "ORD-9D1C" },
  },
  {
    id: "n7",
    type: "back_in_stock",
    category: "promotions",
    title: "Back in Stock!",
    body: "Amul Butter 500g is back in stock at Fresh Mart. Order now before it's gone!",
    read: true,
    createdAt: now - 3 * DAY - 6 * HOUR,
    route: "/product/p12",
    meta: { productId: "p12" },
  },
  {
    id: "n8",
    type: "store_update",
    category: "stores",
    title: "Store Update",
    body: "Rajesh Electronics has added 15 new products this week. Take a look!",
    read: true,
    createdAt: now - 4 * DAY,
    route: "/dukaan/store5",
    meta: { storeId: "store5" },
  },
];

// ── Provider ───────────────────────────────────────

let _counter = SEED_NOTIFICATIONS.length;
const nextId = () => `n${++_counter}`;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(SEED_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const push = useCallback(
    (
      type: NotificationType,
      title: string,
      body: string,
      opts?: { route?: string; meta?: Record<string, string> },
    ) => {
      const notif: AppNotification = {
        id: nextId(),
        type,
        category: TYPE_TO_CATEGORY[type],
        title,
        body,
        read: false,
        createdAt: Date.now(),
        route: opts?.route,
        meta: opts?.meta,
      };
      setNotifications((prev) => [notif, ...prev]);
    },
    [],
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getCategoryForType = useCallback(
    (type: NotificationType) => TYPE_TO_CATEGORY[type],
    [],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      push,
      markRead,
      markAllRead,
      remove,
      clearAll,
      getCategoryForType,
    }),
    [
      notifications,
      unreadCount,
      push,
      markRead,
      markAllRead,
      remove,
      clearAll,
      getCategoryForType,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return ctx;
};
