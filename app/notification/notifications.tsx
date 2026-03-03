// app/notifications.tsx
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    BellOff,
    CheckCheck,
    Package,
    ShoppingBag,
    Store,
    Truck,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Types ──────────────────────────────────────────
interface Notification {
  id: string;
  type: "order" | "delivery" | "store" | "offer" | "general";
  title: string;
  message: string;
  time: string;
  read: boolean;
  section?: string;
}

// ── Mock Data ──────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Order Delivered",
    message: "Your order #ORD001 has been delivered successfully",
    time: "2 hours ago",
    read: false,
    section: "Today",
  },
  {
    id: "2",
    type: "offer",
    title: "Special Offer!",
    message: "Get 20% off on all vegetables at Sharma Kirana",
    time: "5 hours ago",
    read: false,
    section: "Today",
  },
  {
    id: "3",
    type: "delivery",
    title: "Out for Delivery",
    message: "Your order #ORD002 is out for delivery",
    time: "1 day ago",
    read: true,
    section: "Yesterday",
  },
  {
    id: "4",
    type: "store",
    title: "New Store Near You",
    message: "Organic Farms just opened 500m away from you",
    time: "2 days ago",
    read: true,
    section: "Earlier",
  },
  {
    id: "5",
    type: "order",
    title: "Order Confirmed",
    message: "Your order #ORD003 has been confirmed",
    time: "3 days ago",
    read: true,
    section: "Earlier",
  },
];

// ── Icon + Color Map ───────────────────────────────
const NOTIFICATION_META: Record<
  Notification["type"],
  { Icon: any; color: string; label: string }
> = {
  order: { Icon: ShoppingBag, color: colors.brand.primary, label: "Order" },
  delivery: { Icon: Truck, color: colors.status.info, label: "Delivery" },
  store: { Icon: Store, color: colors.brand.accent, label: "Store" },
  offer: { Icon: Package, color: colors.status.success, label: "Offer" },
  general: { Icon: Bell, color: colors.text.secondary, label: "General" },
};

// ── List Item (extracted outside component for stable reference) ──
const NotificationItem = React.memo(
  ({
    item,
    onPress,
  }: {
    item: Notification;
    onPress: (id: string) => void;
  }) => {
    const meta = NOTIFICATION_META[item.type];
    const { Icon, color, label } = meta;

    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => onPress(item.id)}
        activeOpacity={0.65}
      >
        {/* Colored left accent */}
        <View style={[styles.cardAccent, { backgroundColor: color }]} />

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: color + "14" }]}>
          <Icon size={20} color={color} />
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: color + "18" }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{label}</Text>
            </View>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

// ── Section Header ─────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ── Main Screen ────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Build a flat list with section headers injected
  const listData = useMemo(() => {
    const filtered =
      filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications;

    const result: (Notification | { id: string; _sectionHeader: string })[] =
      [];
    let lastSection = "";
    for (const n of filtered) {
      if (n.section && n.section !== lastSection) {
        result.push({ id: `section-${n.section}`, _sectionHeader: n.section });
        lastSection = n.section;
      }
      result.push(n);
    }
    return result;
  }, [filter, notifications]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item._sectionHeader) {
        return <SectionHeader title={item._sectionHeader} />;
      }
      return <NotificationItem item={item} onPress={markAsRead} />;
    },
    [markAsRead],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top - 25 }]}>
      {/* ── Header ────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerIconWrap}>
            <Bell size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>{t("notif.title")}</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* ── Filter Bar ────────────────────── */}
      <View style={styles.filterBar}>
        <View style={styles.filterPills}>
          {(["all", "unread"] as const).map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.pillText, active && styles.pillTextActive]}
                >
                  {f === "all" ? "All" : `Unread (${unreadCount})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllAsRead}
            activeOpacity={0.7}
          >
            <CheckCheck size={14} color={colors.brand.primary} />
            <Text style={styles.markAllText}>{t("notif.markAllRead")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Virtualized List ──────────────── */}
      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Virtualization tuning
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== "web"}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <BellOff size={40} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>{t("notif.empty")}</Text>
            <Text style={styles.emptySub}>
              No {filter === "unread" ? "unread " : ""}notifications right now.
              {"\n"}Check back later.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    ...shadows.small,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  headerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.status.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },

  /* Filter Bar */
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  filterPills: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.ui.background,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  pillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  pillTextActive: {
    color: "#fff",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary + "0D",
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },

  /* Section Headers */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ui.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  /* List */
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  /* Notification Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  cardUnread: {
    backgroundColor: colors.brand.primary + "06",
    borderColor: colors.brand.primary + "22",
    ...shadows.medium,
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },

  /* Empty State */
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.ui.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
