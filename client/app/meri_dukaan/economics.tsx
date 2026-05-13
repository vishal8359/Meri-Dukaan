// app/meri_dukaan/economics.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  Box,
  IndianRupee,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Wrench,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type EconTab = "overview" | "products" | "services";

export default function StoreEconomicsScreen() {
  const router = useRouter();
  const { myStore, storeOrders, storeBookings, refreshStoreEconomics } = useApp();
  const [activeTab, setActiveTab] = useState<EconTab>("overview");

  // Compute economics from store-received orders and bookings
  const economics = useMemo(() => {
    if (!myStore) return null;

    // --- Product orders (from order_items belonging to this store) ---
    const productRevenue = storeOrders.reduce((sum, o) => {
      const storeItems = o.items.filter((i) => i.storeId === myStore.id);
      return sum + storeItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);

    // --- Service bookings revenue (from service_bookings for this store) ---
    const paidBookings = storeBookings.filter(
      (b) => b.status === "booked" || b.status === "completed",
    );
    const serviceRevenue = paidBookings.reduce((s, b) => s + b.price, 0);

    const totalRevenue = productRevenue + serviceRevenue;
    const totalOrders = storeOrders.length;
    const deliveredOrders = storeOrders.filter(
      (o) => o.status === "delivered",
    ).length;
    const cancelledOrders = storeOrders.filter(
      (o) => o.status === "cancelled",
    ).length;
    const activeOrders = storeOrders.filter(
      (o) => o.status === "processing" || o.status === "in-transit",
    ).length;

    // Product-level economics
    const productEconomics = myStore.products.map((product) => {
      const productItems = storeOrders.flatMap((o) =>
        o.items.filter(
          (i) => i.id === product.id && i.storeId === myStore.id,
        ),
      );
      const unitsSold = productItems.reduce((s, i) => s + i.quantity, 0);
      const revenue = productItems.reduce(
        (s, i) => s + i.price * i.quantity,
        0,
      );
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        inStock: product.inStock,
        quantity: product.quantity,
        unit: product.unit,
        unitsSold,
        revenue,
        image: product.images[0],
      };
    });

    // Service-level economics (from service_bookings, not product orders)
    const serviceEconomics = myStore.services.map((service) => {
      const serviceBookingItems = storeBookings.filter(
        (b) => b.serviceId === service.id,
      );
      const paidServiceBookings = serviceBookingItems.filter(
        (b) => b.status === "booked" || b.status === "completed",
      );
      const bookings = paidServiceBookings.length;
      const revenue = paidServiceBookings.reduce((s, b) => s + b.price, 0);
      return {
        id: service.id,
        name: service.name,
        price: service.price,
        available: service.available,
        duration: service.duration,
        bookings,
        revenue,
        image: service.images[0],
      };
    });

    const totalProducts = myStore.products.length;
    const totalServices = myStore.services.length;
    const inStockProducts = myStore.products.filter((p) => p.inStock).length;
    const availableServices = myStore.services.filter(
      (s) => s.available,
    ).length;

    return {
      totalRevenue,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      activeOrders,
      totalProducts,
      totalServices,
      inStockProducts,
      availableServices,
      productEconomics,
      serviceEconomics,
      avgOrderValue: totalOrders > 0 ? productRevenue / totalOrders : 0,
    };
  }, [myStore, storeOrders, storeBookings]);

  if (!myStore) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Economics</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Store size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Store Found</Text>
          <Text style={styles.emptySubtitle}>
            Create your dukaan first to view economics
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const tabs: { key: EconTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "products", label: "Products", icon: Package },
    { key: "services", label: "Services", icon: Wrench },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Economics</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <tab.icon
                size={16}
                color={isActive ? colors.brand.primary : colors.text.tertiary}
              />
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && economics && (
          <OverviewTab economics={economics} storeName={myStore.name} />
        )}
        {activeTab === "products" && economics && (
          <ProductsEconTab items={economics.productEconomics} />
        )}
        {activeTab === "services" && economics && (
          <ServicesEconTab items={economics.serviceEconomics} />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ========== OVERVIEW TAB ==========
function OverviewTab({
  economics,
  storeName,
}: {
  economics: any;
  storeName: string;
}) {
  return (
    <>
      {/* Store Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Store size={20} color={colors.brand.primary} />
          <Text style={styles.summaryStoreName}>{storeName}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.metricsGrid}>
          <MetricCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${economics.totalRevenue.toLocaleString("en-IN")}`}
            color={colors.tint.green}
            bgColor={colors.tint.greenLight}
          />
          <MetricCard
            icon={ShoppingCart}
            label="Total Orders"
            value={economics.totalOrders.toString()}
            color={colors.brand.primary}
            bgColor={colors.tint.blueLight}
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg. Order Value"
            value={`₹${Math.round(economics.avgOrderValue).toLocaleString("en-IN")}`}
            color={colors.tint.purple}
            bgColor={colors.tint.purpleLight}
          />
          <MetricCard
            icon={Box}
            label="Active Orders"
            value={economics.activeOrders.toString()}
            color={colors.tint.orange}
            bgColor={colors.tint.orangeLight}
          />
        </View>
      </View>

      {/* Order Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Order Breakdown</Text>
        <BreakdownRow
          label="Delivered"
          value={economics.deliveredOrders}
          total={economics.totalOrders}
          color={colors.status.success}
        />
        <BreakdownRow
          label="Active"
          value={economics.activeOrders}
          total={economics.totalOrders}
          color={colors.brand.primary}
        />
        <BreakdownRow
          label="Cancelled"
          value={economics.cancelledOrders}
          total={economics.totalOrders}
          color={colors.status.error}
        />
      </View>

      {/* Inventory Snapshot */}
      <View style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Inventory Snapshot</Text>
        <View style={styles.inventoryRow}>
          <View style={styles.inventoryItem}>
            <Package size={18} color={colors.tint.green} />
            <View>
              <Text style={styles.inventoryValue}>
                {economics.inStockProducts}/{economics.totalProducts}
              </Text>
              <Text style={styles.inventoryLabel}>Products In Stock</Text>
            </View>
          </View>
          <View style={styles.inventoryItem}>
            <Wrench size={18} color={colors.brand.primary} />
            <View>
              <Text style={styles.inventoryValue}>
                {economics.availableServices}/{economics.totalServices}
              </Text>
              <Text style={styles.inventoryLabel}>Services Available</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

// ========== PRODUCTS ECONOMICS TAB ==========
function ProductsEconTab({
  items,
}: {
  items: {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
    quantity: number;
    unit: string;
    unitsSold: number;
    revenue: number;
  }[];
}) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Package size={36} color={colors.text.tertiary} />
        <Text style={styles.emptyTabText}>No products added yet</Text>
      </View>
    );
  }

  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const totalUnitsSold = items.reduce((s, i) => s + i.unitsSold, 0);

  return (
    <>
      {/* Products Summary */}
      <View style={styles.tabSummary}>
        <View style={styles.tabSummaryItem}>
          <Text style={styles.tabSummaryValue}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.tabSummaryLabel}>Products Revenue</Text>
        </View>
        <View style={styles.tabSummaryDivider} />
        <View style={styles.tabSummaryItem}>
          <Text style={styles.tabSummaryValue}>{totalUnitsSold}</Text>
          <Text style={styles.tabSummaryLabel}>Units Sold</Text>
        </View>
        <View style={styles.tabSummaryDivider} />
        <View style={styles.tabSummaryItem}>
          <Text style={styles.tabSummaryValue}>{items.length}</Text>
          <Text style={styles.tabSummaryLabel}>Total Products</Text>
        </View>
      </View>

      {/* Per-Product Cards */}
      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemNameRow}>
              <View
                style={[
                  styles.stockDot,
                  {
                    backgroundColor: item.inStock
                      ? colors.status.success
                      : colors.status.error,
                  },
                ]}
              />
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
          <View style={styles.itemMetrics}>
            <View style={styles.itemMetric}>
              <Text style={styles.itemMetricValue}>{item.unitsSold}</Text>
              <Text style={styles.itemMetricLabel}>Sold</Text>
            </View>
            <View style={styles.itemMetric}>
              <Text style={styles.itemMetricValue}>
                ₹{item.revenue.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.itemMetricLabel}>Revenue</Text>
            </View>
            <View style={styles.itemMetric}>
              <Text style={styles.itemMetricValue}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={styles.itemMetricLabel}>Stock</Text>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

// ========== SERVICES ECONOMICS TAB ==========
function ServicesEconTab({
  items,
}: {
  items: {
    id: string;
    name: string;
    price: number;
    available: boolean;
    duration: string;
    bookings: number;
    revenue: number;
  }[];
}) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Wrench size={36} color={colors.text.tertiary} />
        <Text style={styles.emptyTabText}>No services added yet</Text>
      </View>
    );
  }

  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const totalBookings = items.reduce((s, i) => s + i.bookings, 0);

  return (
    <>
      {/* Services Summary */}
      <View style={styles.tabSummary}>
        <View style={styles.tabSummaryItem}>
          <Text style={styles.tabSummaryValue}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.tabSummaryLabel}>Services Revenue</Text>
        </View>
        <View style={styles.tabSummaryDivider} />
        <View style={styles.tabSummaryItem}>
          <Text style={styles.tabSummaryValue}>{totalBookings}</Text>
          <Text style={styles.tabSummaryLabel}>Total Bookings</Text>
        </View>
        <View style={styles.tabSummaryDivider} />
        <View style={styles.tabSummaryItem}>
          <Text style={styles.tabSummaryValue}>{items.length}</Text>
          <Text style={styles.tabSummaryLabel}>Total Services</Text>
        </View>
      </View>

      {/* Per-Service Cards */}
      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemNameRow}>
              <View
                style={[
                  styles.stockDot,
                  {
                    backgroundColor: item.available
                      ? colors.status.success
                      : colors.status.error,
                  },
                ]}
              />
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
          <View style={styles.itemMetrics}>
            <View style={styles.itemMetric}>
              <Text style={styles.itemMetricValue}>{item.bookings}</Text>
              <Text style={styles.itemMetricLabel}>Bookings</Text>
            </View>
            <View style={styles.itemMetric}>
              <Text style={styles.itemMetricValue}>
                ₹{item.revenue.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.itemMetricLabel}>Revenue</Text>
            </View>
            <View style={styles.itemMetric}>
              <Text style={styles.itemMetricValue}>{item.duration}</Text>
              <Text style={styles.itemMetricLabel}>Duration</Text>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

// ========== SHARED COMPONENTS ==========
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: bgColor }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLabel}>
        <View style={[styles.breakdownDot, { backgroundColor: color }]} />
        <Text style={styles.breakdownText}>{label}</Text>
      </View>
      <View style={styles.breakdownRight}>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.max(pct, 2)}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.breakdownCount}>{value}</Text>
      </View>
    </View>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ui.background },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  scroll: { padding: spacing.md },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.ui.background,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.brand.primary + "12",
    borderWidth: 1,
    borderColor: colors.brand.primary + "30",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.brand.primary,
  },

  /* Empty States */
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  emptyTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTabText: {
    fontSize: 15,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryStoreName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.md,
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.ui.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  metricIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  /* Breakdown Card */
  breakdownCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  breakdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 100,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  breakdownRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: spacing.sm,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.ui.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    width: 30,
    textAlign: "right",
  },

  /* Inventory Snapshot */
  inventoryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  inventoryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.ui.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  inventoryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  inventoryLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
  },

  /* Tab Summary Bar */
  tabSummary: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    alignItems: "center",
    ...shadows.small,
  },
  tabSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  tabSummaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  tabSummaryLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  tabSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.ui.border,
  },

  /* Per-Item Cards */
  itemCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.primary,
    marginLeft: spacing.sm,
  },
  itemMetrics: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.ui.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  itemMetric: {
    flex: 1,
    alignItems: "center",
  },
  itemMetricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  itemMetricLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
