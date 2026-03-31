// src/context/NotificationContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as notificationApi from "../api/notifications";

// ── Notification Types ─────────────────────────────

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "booking_confirmed"
  | "booking_cancelled"
  | "payment_received"
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
  booking_confirmed: "orders",
  booking_cancelled: "orders",
  payment_received: "orders",
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
  createdAt: number; // timestamp ms
  /** Optional deep-link route */
  route?: string;
  /** Extra metadata */
  meta?: Record<string, string>;
}

// ── Context shape ──────────────────────────────────

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;

  /** Fetch latest notifications from server */
  refresh: () => Promise<void>;

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

// ── Mapper ─────────────────────────────────────────

function mapNotification(raw: notificationApi.RawNotification): AppNotification {
  return {
    id: raw.id,
    type: raw.type as NotificationType,
    category:
      (raw.category as NotificationCategory) ||
      TYPE_TO_CATEGORY[raw.type as NotificationType] ||
      "general",
    title: raw.title,
    body: raw.body,
    read: !!raw.read,
    createdAt: new Date(raw.created_at).getTime(),
    route: raw.route || undefined,
    meta: raw.meta || undefined,
  };
}

// ── Provider ───────────────────────────────────────

const POLL_INTERVAL = 30_000; // 30 seconds

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { authToken, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // ── Fetch from backend ──

  const refresh = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications(authToken);
      setNotifications(res.notifications.map(mapNotification));
      setUnreadCount(res.unreadCount);
    } catch {
      // Silently ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Load on auth change + periodic poll
  useEffect(() => {
    if (!isAuthenticated || !authToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, authToken, refresh]);

  // ── Optimistic operations with API sync ──

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (authToken) {
        notificationApi.markRead(authToken, id).catch(() => {});
      }
    },
    [authToken],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (authToken) {
      notificationApi.markAllRead(authToken).catch(() => {});
    }
  }, [authToken]);

  const remove = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
      if (authToken) {
        notificationApi.deleteNotification(authToken, id).catch(() => {});
      }
    },
    [authToken],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    if (authToken) {
      notificationApi.clearAll(authToken).catch(() => {});
    }
  }, [authToken]);

  const getCategoryForType = useCallback(
    (type: NotificationType) => TYPE_TO_CATEGORY[type],
    [],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
      remove,
      clearAll,
      getCategoryForType,
    }),
    [
      notifications,
      unreadCount,
      loading,
      refresh,
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
