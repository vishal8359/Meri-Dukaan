// app/orders.tsx
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle,
    Package,
    Truck,
    XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Mock order data
const ORDERS = [
  {
    id: "ORD001",
    storeName: "Sharma Kirana",
    storeImage:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=300",
    items: ["Fresh Tomatoes", "Onions", "Potatoes"],
    totalItems: 5,
    totalAmount: 450,
    status: "delivered",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-17",
  },
  {
    id: "ORD002",
    storeName: "Organic Farms",
    storeImage:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300",
    items: ["Green Chilies", "Coriander"],
    totalItems: 3,
    totalAmount: 280,
    status: "in-transit",
    orderDate: "2024-01-18",
    deliveryDate: "2024-01-20",
  },
  {
    id: "ORD003",
    storeName: "Modern Furniture",
    storeImage:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300",
    items: ["Wooden Chair", "Table Lamp"],
    totalItems: 2,
    totalAmount: 3500,
    status: "processing",
    orderDate: "2024-01-19",
    deliveryDate: "2024-01-22",
  },
  {
    id: "ORD004",
    storeName: "Sharma Kirana",
    storeImage:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=300",
    items: ["Rice", "Dal", "Oil"],
    totalItems: 4,
    totalAmount: 890,
    status: "cancelled",
    orderDate: "2024-01-10",
    deliveryDate: null,
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          icon: CheckCircle,
          color: colors.status.success,
          bg: colors.status.successLight,
          text: t("orders.delivered"),
        };
      case "in-transit":
        return {
          icon: Truck,
          color: colors.status.info,
          bg: colors.status.infoLight,
          text: t("orders.inTransit"),
        };
      case "processing":
        return {
          icon: Package,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          text: t("orders.processing"),
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: colors.status.error,
          bg: colors.status.errorLight,
          text: t("orders.cancelled"),
        };
      default:
        return {
          icon: Package,
          color: colors.text.secondary,
          bg: colors.ui.backgroundAlt,
          text: "Unknown",
        };
    }
  };

  const filteredOrders =
    activeFilter === "all"
      ? ORDERS
      : ORDERS.filter((order) => order.status === activeFilter);

  const OrderCard = ({ order }: { order: (typeof ORDERS)[0] }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View style={styles.storeInfo}>
            <Image
              source={{ uri: order.storeImage }}
              style={styles.storeImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>
                {t("orders.orderNum")}
                {order.id}
              </Text>
              <Text style={styles.storeName}>{order.storeName}</Text>
            </View>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <StatusIcon size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.itemsText}>
            {order.items.join(", ")}
            {order.totalItems > order.items.length &&
              ` +${order.totalItems - order.items.length} more`}
          </Text>

          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.metaText}>
                {t("orders.ordered")}{" "}
                {new Date(order.orderDate).toLocaleDateString()}
              </Text>
            </View>

            {order.deliveryDate && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.text.secondary}
                />
                <Text style={styles.metaText}>
                  {t("orders.delivery")}{" "}
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.totalLabel}>{t("orders.totalAmount")}</Text>
              <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
            </View>

            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>
                {t("orders.viewDetails")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.text.inverse}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("orders.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: "all", label: t("orders.all") },
          { key: "processing", label: t("orders.processing") },
          { key: "in-transit", label: t("orders.inTransit") },
          { key: "delivered", label: t("orders.delivered") },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter.key && styles.activeFilterTabText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={64} color={colors.ui.disabled} />
            <Text style={styles.emptyText}>{t("orders.noOrders")}</Text>
            <Text style={styles.emptySubtext}>
              Start shopping to see your orders here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    ...shadows.small,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.surface,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
  },
  activeFilterTab: {
    backgroundColor: colors.brand.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  activeFilterTabText: {
    color: colors.text.inverse,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  storeImage: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 2,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  orderDetails: {
    gap: spacing.sm,
  },
  itemsText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  orderMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
