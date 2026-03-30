// app/myorders/orders.tsx
import { Order, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterKey =
  | "all"
  | "processing"
  | "in-transit"
  | "delivered"
  | "cancelled";

const STATUS_CONFIG: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bg: string;
    label: string;
  }
> = {
  processing: {
    icon: "time-outline",
    color: colors.status.warning,
    bg: colors.status.warningLight,
    label: "Processing",
  },
  "in-transit": {
    icon: "bicycle-outline",
    color: colors.status.info,
    bg: colors.status.infoLight,
    label: "In Transit",
  },
  delivered: {
    icon: "checkmark-circle-outline",
    color: colors.status.success,
    bg: colors.status.successLight,
    label: "Delivered",
  },
  cancelled: {
    icon: "close-circle-outline",
    color: colors.status.error,
    bg: colors.status.errorLight,
    label: "Cancelled",
  },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "in-transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

// --- Order Card Component ---
const OrderCard = React.memo(
  ({ order, onPress }: { order: Order; onPress: () => void }) => {
    const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.processing;
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const itemNames = order.items
      .slice(0, 3)
      .map((i) => i.name)
      .join(", ");
    const moreCount = order.items.length > 3 ? order.items.length - 3 : 0;
    const firstImage = order.items.find((i) => i.image)?.image;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {/* Top row: image, info, status */}
        <View style={styles.cardTop}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <Ionicons name="cube-outline" size={24} color={colors.ui.muted} />
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.orderId}>#{order.id.slice(-8)}</Text>
            <Text style={styles.itemSummary} numberOfLines={1}>
              {itemNames}
              {moreCount > 0 && ` +${moreCount} more`}
            </Text>
            <Text style={styles.itemCount}>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={13} color={config.color} />
            <Text style={[styles.statusLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom row: dates + total + arrow */}
        <View style={styles.cardBottom}>
          <View style={styles.dateCol}>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={colors.text.secondary}
              />
              <Text style={styles.dateText}>
                {new Date(order.orderDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            {order.deliveryDate && (
              <View style={styles.dateRow}>
                <Ionicons
                  name="cube-outline"
                  size={13}
                  color={colors.text.secondary}
                />
                <Text style={styles.dateText}>
                  Est.{" "}
                  {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.totalCol}>
            <Text style={styles.totalAmount}>
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Paid Online"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
          />
        </View>
      </TouchableOpacity>
    );
  },
);

// --- Empty State ---
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <Ionicons name="receipt-outline" size={56} color={colors.ui.disabled} />
    </View>
    <Text style={styles.emptyTitle}>No orders yet</Text>
    <Text style={styles.emptySubtitle}>
      Your orders will appear here after you make a purchase
    </Text>
  </View>
);

// --- Main Screen ---
export default function OrdersScreen() {
  const router = useRouter();
  const { orders } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const navigateToDetail = useCallback(
    (orderId: string) => {
      router.push({ pathname: "/myorders/[id]", params: { id: orderId } });
    },
    [router],
  );

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard order={item} onPress={() => navigateToDetail(item.id)} />
    ),
    [navigateToDetail],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Summary strip */}
      {orders.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryCount}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryCount, { color: colors.status.warning }]}
            >
              {orderCounts["processing"] || 0}
            </Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryCount, { color: colors.status.success }]}
            >
              {orderCounts["delivered"] || 0}
            </Text>
            <Text style={styles.summaryLabel}>Delivered</Text>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          const count = orderCounts[f.key] || 0;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {f.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    isActive && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      isActive && styles.filterBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 7,
    backgroundColor: colors.ui.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    ...shadows.small,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },

  // Summary strip
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm - 15,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  summaryItem: { alignItems: "center" },
  summaryCount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: 1,
  },
  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ui.disabled,
  },

  // Filter Bar
  filterBar: {
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  filterBarContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    gap: 6,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.ui.backgroundAlt,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  filterBadge: {
    backgroundColor: colors.ui.border,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  filterBadgeTextActive: {
    color: colors.text.inverse,
  },

  // List
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    marginBottom: 2,
  },
  itemSummary: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: colors.ui.borderLight,
    marginVertical: spacing.sm,
  },

  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateCol: {
    flex: 1,
    gap: 3,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  totalCol: {
    alignItems: "flex-end",
    marginRight: spacing.sm,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  paymentMethod: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.ui.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
