// app/notification/notifications.tsx
import {
    AppNotification,
    NotificationCategory,
    useNotifications,
} from "@/src/context/NotificationContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    BellOff,
    CheckCheck,
    CreditCard,
    Calendar,
    CalendarX,
    Gift,
    MapPin,
    Package,
    RefreshCw,
    ShoppingBag,
    Store,
    Tag,
    Trash2,
    TrendingDown,
    Truck,
    XCircle,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Icon / color mapping per notification type ─────

const TYPE_META: Record<
  string,
  { Icon: any; color: string; bgTint: string; label: string }
> = {
  order_placed: {
    Icon: ShoppingBag,
    color: colors.brand.primary,
    bgTint: colors.brand.primary + "14",
    label: "Order",
  },
  order_confirmed: {
    Icon: Package,
    color: colors.status.info,
    bgTint: colors.status.infoLight,
    label: "Confirmed",
  },
  order_shipped: {
    Icon: Truck,
    color: colors.tint.blue,
    bgTint: colors.tint.blueLight,
    label: "Shipped",
  },
  order_delivered: {
    Icon: CheckCheck,
    color: colors.status.success,
    bgTint: colors.status.successLight,
    label: "Delivered",
  },
  order_cancelled: {
    Icon: XCircle,
    color: colors.status.error,
    bgTint: colors.status.errorLight,
    label: "Cancelled",
  },
  offer: {
    Icon: Gift,
    color: colors.brand.accent,
    bgTint: colors.tint.orangeLight,
    label: "Offer",
  },
  price_drop: {
    Icon: TrendingDown,
    color: colors.status.success,
    bgTint: colors.tint.greenLight,
    label: "Price Drop",
  },
  back_in_stock: {
    Icon: RefreshCw,
    color: colors.tint.purple,
    bgTint: colors.tint.purpleLight,
    label: "Back in Stock",
  },
  new_store: {
    Icon: Store,
    color: colors.brand.secondary,
    bgTint: colors.tint.goldLight,
    label: "New Store",
  },
  store_update: {
    Icon: MapPin,
    color: colors.status.info,
    bgTint: colors.status.infoLight,
    label: "Store",
  },
  general: {
    Icon: Bell,
    color: colors.text.secondary,
    bgTint: colors.ui.background,
    label: "General",
  },
  booking_confirmed: {
    Icon: Calendar,
    color: colors.status.success,
    bgTint: colors.status.successLight,
    label: "Booking",
  },
  booking_cancelled: {
    Icon: CalendarX,
    color: colors.status.error,
    bgTint: colors.status.errorLight,
    label: "Cancelled",
  },
  payment_received: {
    Icon: CreditCard,
    color: colors.tint.green,
    bgTint: colors.tint.greenLight,
    label: "Payment",
  },
};

// ── Category filter tabs ───────────────────────────

type FilterKey = "all" | NotificationCategory;

const FILTERS: { key: FilterKey; label: string; Icon: any }[] = [
  { key: "all", label: "All", Icon: Bell },
  { key: "orders", label: "Orders", Icon: ShoppingBag },
  { key: "promotions", label: "Offers", Icon: Tag },
  { key: "stores", label: "Stores", Icon: Store },
];

// ── Time helpers ───────────────────────────────────

const DAY_MS = 86_400_000;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < DAY_MS) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2 * DAY_MS) return "Yesterday";
  if (diff < 7 * DAY_MS) return `${Math.floor(diff / DAY_MS)}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function sectionLabel(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < DAY_MS) return "Today";
  if (diff < 2 * DAY_MS) return "Yesterday";
  if (diff < 7 * DAY_MS) return "This Week";
  return "Earlier";
}

// ── NotificationCard ───────────────────────────────

const NotificationCard = React.memo(
  ({
    item,
    onPress,
    onRemove,
  }: {
    item: AppNotification;
    onPress: (n: AppNotification) => void;
    onRemove: (id: string) => void;
  }) => {
    const meta = TYPE_META[item.type] ?? TYPE_META.general;
    const { Icon, color, bgTint, label } = meta;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          !item.read && styles.cardUnread,
          pressed && styles.cardPressed,
        ]}
        onPress={() => onPress(item)}
      >
        {/* Left accent bar */}
        {!item.read && (
          <View style={[styles.cardAccent, { backgroundColor: color }]} />
        )}

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: bgTint }]}>
          <Icon size={20} color={color} />
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: bgTint }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{label}</Text>
            </View>
            <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onRemove(item.id)}
          hitSlop={10}
        >
          <Trash2 size={14} color={colors.text.tertiary} />
        </TouchableOpacity>
      </Pressable>
    );
  },
);

// ── Section Header ─────────────────────────────────

const SectionHeader = React.memo(({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
));

// ── Main Screen ────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();

  const { notifications, unreadCount, markRead, markAllRead, remove, loading, refresh } =
    useNotifications();

  const [filter, setFilter] = useState<FilterKey>("all");

  // ── Derive filtered + sectioned flat list data ──

  const listData = useMemo(() => {
    const filtered =
      filter === "all"
        ? notifications
        : notifications.filter((n) => n.category === filter);

    const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

    const result: (AppNotification | { id: string; _section: string })[] = [];
    let lastSection = "";
    for (const n of sorted) {
      const sec = sectionLabel(n.createdAt);
      if (sec !== lastSection) {
        result.push({ id: `sec-${sec}`, _section: sec });
        lastSection = sec;
      }
      result.push(n);
    }
    return result;
  }, [filter, notifications]);

  // ── Category-specific unread counts ──

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: unreadCount };
    for (const n of notifications) {
      if (!n.read) {
        counts[n.category] = (counts[n.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [notifications, unreadCount]);

  // ── Handlers ──

  const handlePress = useCallback(
    (n: AppNotification) => {
      markRead(n.id);
      if (n.route) {
        router.push(n.route as any);
      }
    },
    [markRead, router],
  );

  const handleRemove = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item._section) {
        return <SectionHeader title={item._section} />;
      }
      return (
        <NotificationCard
          item={item}
          onPress={handlePress}
          onRemove={handleRemove}
        />
      );
    },
    [handlePress, handleRemove],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <View
      style={[styles.container, { paddingTop: Math.max(insets.top - 30, 0) }]}
    >
      {/* ── Header ──────────────────────── */}
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
            <Bell size={16} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>{t("notif.title")}</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllRead}
            hitSlop={8}
          >
            <CheckCheck size={16} color={colors.brand.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* ── Category Filter Chips ───────── */}
      <View style={styles.filterBar}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = categoryCounts[f.key] ?? 0;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <f.Icon
                size={14}
                color={active ? "#fff" : colors.text.secondary}
              />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View
                  style={[styles.chipBadge, active && styles.chipBadgeActive]}
                >
                  <Text
                    style={[
                      styles.chipBadgeText,
                      active && styles.chipBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Notification List ───────────── */}
      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== "web"}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <BellOff size={44} color={colors.ui.disabled} />
            </View>
            <Text style={styles.emptyTitle}>{t("notif.empty")}</Text>
            <Text style={styles.emptySub}>
              {filter !== "all"
                ? `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} notifications.`
                : "You're all caught up! Check back later."}
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
    backgroundColor: colors.ui.surface,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
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
  markAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Filter chips */
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.ui.background,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: "#fff",
  },
  chipBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.status.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  chipBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },
  chipBadgeTextActive: {
    color: "#fff",
  },

  /* Section headers */
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
    fontSize: 11,
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
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  cardUnread: {
    backgroundColor: colors.brand.primary + "06",
    borderColor: colors.brand.primary + "20",
    ...shadows.medium,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginRight: 10,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
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
    color: colors.text.tertiary,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignSelf: "stretch",
    justifyContent: "center",
  },

  /* Empty state */
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.ui.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 5,
  },
  emptySub: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
