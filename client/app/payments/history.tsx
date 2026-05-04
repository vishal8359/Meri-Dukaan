// app/payments/history.tsx
import { useApp, type Order } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Filter,
  IndianRupee,
  ReceiptText,
  Search,
  Store,
  Wallet,
  XCircle
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// --- Types ---
interface PaymentItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface PaymentRecord {
  id: string;
  orderId: string;
  transactionId: string;
  date: string;
  time: string;
  storeName: string;
  storeId: string;
  items: PaymentItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "UPI" | "Card" | "COD" | "Online";
  status: "success" | "failed" | "pending";
}

type FilterType = "all" | "success" | "failed" | "pending";

// --- Map Order → PaymentRecord ---
function mapOrderToPayment(order: Order): PaymentRecord {
  const createdAt = new Date(order.orderDate);
  const paymentStatus: PaymentRecord["status"] =
    order.status === "delivered"
      ? "success"
      : order.status === "cancelled"
        ? "failed"
        : "pending";

  return {
    id: order.id,
    orderId: order.id,
    transactionId: order.id,
    date: createdAt.toISOString().split("T")[0],
    time: createdAt.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    storeName: order.items[0]?.storeName ?? "Store",
    storeId: order.items[0]?.storeId ?? "",
    items: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      qty: i.quantity,
      price: i.price,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: 0,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod === "cod" ? "COD" : "Online",
    status: paymentStatus,
  };
}

// --- Main Component ---
export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { orders, refreshOrders } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshOrders().finally(() => setIsLoading(false));
  }, [refreshOrders]);

  const payments = useMemo(() => orders.map(mapOrderToPayment), [orders]);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("payments.all") },
    { key: "success", label: t("payments.success") },
    { key: "pending", label: t("payments.pending") },
    { key: "failed", label: t("payments.failed") },
  ];

  const filteredPayments = useMemo(() => {
    let data = payments;
    if (activeFilter !== "all") {
      data = data.filter((p) => p.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.storeName.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.items.some((i) => i.name.toLowerCase().includes(q)),
      );
    }
    return data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [activeFilter, searchQuery, payments]);

  const totals = useMemo(() => {
    const successful = payments.filter((p) => p.status === "success");
    const totalSpent = successful.reduce((s, p) => s + p.totalAmount, 0);
    return {
      totalSpent,
      totalTransactions: payments.length,
    };
  }, [payments]);

  // --- Status Config ---
  const getStatusConfig = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle2,
          color: colors.status.success,
          bg: colors.status.successLight,
          text: "Successful",
        };
      case "failed":
        return {
          icon: XCircle,
          color: colors.status.error,
          bg: colors.status.errorLight,
          text: "Failed",
        };
      case "pending":
        return {
          icon: Clock,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          text: "Pending",
        };
    }
  };

  const getPaymentIcon = (method: PaymentRecord["paymentMethod"]) => {
    switch (method) {
      case "UPI":
        return Wallet;
      case "Card":
        return CreditCard;
      case "COD":
        return IndianRupee;
      case "Online":
        return CreditCard;
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // --- Toggle expand ---
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // --- Render Payment Card ---
  const renderPaymentCard = ({ item }: { item: PaymentRecord }) => {
    const statusCfg = getStatusConfig(item.status);
    const StatusIcon = statusCfg.icon;
    const PaymentIcon = getPaymentIcon(item.paymentMethod);
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.paymentCard}
        activeOpacity={0.85}
        onPress={() => toggleExpand(item.id)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.storeRow}>
            <View style={styles.storeThumbPlaceholder}>
              <Store size={18} color={colors.text.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{item.storeName}</Text>
              <View style={styles.orderMeta}>
                <Text style={styles.orderId}>{item.orderId}</Text>
                <View style={styles.dot} />
                <Text style={styles.dateText}>
                  {formatDate(item.date)} • {item.time}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <StatusIcon size={13} color={statusCfg.color} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.text}
            </Text>
          </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <View style={[styles.methodBadge]}>
              <PaymentIcon size={14} color={colors.brand.primary} />
              <Text style={styles.methodText}>{item.paymentMethod}</Text>
            </View>
            <Text style={styles.itemCount}>
              {item.items.length} item{item.items.length > 1 ? "s" : ""}
            </Text>
          </View>
          <Text style={styles.totalAmount}>
            ₹{item.totalAmount.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Expanded Detail Section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Divider */}
            <View style={styles.expandDivider} />

            {/* Items */}
            <Text style={styles.expandLabel}>Items Purchased</Text>
            {item.items.map((product) => (
              <View key={product.id} style={styles.itemRow}>
                <View style={styles.itemDot} />
                <Text style={styles.itemName}>{product.name}</Text>
                <Text style={styles.itemQty}>×{product.qty}</Text>
                <Text style={styles.itemPrice}>₹{product.price}</Text>
              </View>
            ))}

            {/* Breakdown */}
            <View style={styles.breakdownSection}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  {t("payments.subtotal")}
                </Text>
                <Text style={styles.breakdownValue}>
                  ₹{item.subtotal.toLocaleString("en-IN")}
                </Text>
              </View>
              {item.deliveryFee > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {t("payments.deliveryFee")}
                  </Text>
                  <Text style={styles.breakdownValue}>₹{item.deliveryFee}</Text>
                </View>
              )}
              {item.discount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text
                    style={[
                      styles.breakdownLabel,
                      { color: colors.status.success },
                    ]}
                  >
                    {t("payments.discount")}
                  </Text>
                  <Text
                    style={[
                      styles.breakdownValue,
                      { color: colors.status.success },
                    ]}
                  >
                    -₹{item.discount}
                  </Text>
                </View>
              )}
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownTotal}>
                  {t("payments.totalPaid")}
                </Text>
                <Text style={styles.breakdownTotalValue}>
                  ₹{item.totalAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            {/* Transaction ID */}
            <View style={styles.txnRow}>
              <Text style={styles.txnLabel}>{t("payments.transactionId")}</Text>
              <Text style={styles.txnValue}>{item.transactionId}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <Download size={15} color={colors.brand.primary} />
                <Text style={styles.actionBtnText}>
                  {t("payments.downloadReceipt")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/dukaan/${item.storeId}` as any)}
              >
                <Store size={15} color={colors.tint.green} />
                <Text
                  style={[styles.actionBtnText, { color: colors.tint.green }]}
                >
                  {t("payments.visitStore")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expand indicator */}
        {!isExpanded && (
          <View style={styles.expandHint}>
            <Text style={styles.expandHintText}>Tap for details</Text>
            <ChevronRight size={14} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --- Header with Summary ---
  const renderHeader = () => (
    <View>
      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <LinearGradient
          colors={[colors.gradient.navyStart, colors.gradient.navyEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sumCard}
        >
          <View style={styles.sumIconBg}>
            <IndianRupee size={18} color="#FFF" />
          </View>
          <Text style={styles.sumValue}>
            ₹{totals.totalSpent.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.sumLabel}>Total Spent</Text>
        </LinearGradient>

        <View
          style={[styles.sumCard, { backgroundColor: colors.tint.blueLight }]}
        >
          <View
            style={[
              styles.sumIconBg,
              { backgroundColor: colors.tint.blue + "20" },
            ]}
          >
            <ReceiptText size={18} color={colors.tint.blue} />
          </View>
          <Text style={[styles.sumValue, { color: colors.tint.blue }]}>
            {totals.totalTransactions}
          </Text>
          <Text style={[styles.sumLabel, { color: colors.tint.blue + "99" }]}>
            {t("payments.transactions")}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("payments.searchPlaceholder")}
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <XCircle size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
              {isActive && f.key !== "all" && (
                <View style={styles.filterCount}>
                  <Text style={styles.filterCountText}>
                    {
                      payments.filter((p) =>
                        f.key === "all" ? true : p.status === f.key,
                      ).length
                    }
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultsText}>
        {filteredPayments.length} payment
        {filteredPayments.length !== 1 ? "s" : ""} found
      </Text>
    </View>
  );

  // --- Empty state ---
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <ReceiptText size={48} color={colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>{t("payments.noPayments")}</Text>
      <Text style={styles.emptyDesc}>
        {searchQuery
          ? "Try a different search term"
          : "Your payment history will appear here"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{t("payments.title")}</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Filter size={20} color={colors.brand.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          renderItem={renderPaymentCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  } as ViewStyle,

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    ...shadows.small,
  } as ViewStyle,
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  topTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: 0.3,
  } as TextStyle,
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  listContent: {
    paddingBottom: spacing.xxl,
  } as ViewStyle,

  // Summary Cards
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  } as ViewStyle,
  sumCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    ...shadows.small,
  } as ViewStyle,
  sumIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  } as ViewStyle,
  sumValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 2,
  } as TextStyle,
  sumLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
    padding: 0,
  } as TextStyle,

  // Filters
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  } as ViewStyle,
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.ui.surface,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    gap: 6,
  } as ViewStyle,
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  } as ViewStyle,
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  } as TextStyle,
  filterChipTextActive: {
    color: "#FFF",
  } as TextStyle,
  filterCount: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  } as ViewStyle,
  filterCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  } as TextStyle,

  resultsText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "600",
    paddingHorizontal: spacing.md + 4,
    marginBottom: spacing.sm,
  } as TextStyle,

  // Payment Card
  paymentCard: {
    backgroundColor: colors.ui.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.small,
  } as ViewStyle,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  } as ViewStyle,
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  } as ViewStyle,
  storeThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: spacing.sm,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  storeName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  } as TextStyle,
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  } as ViewStyle,
  orderId: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand.primary,
  } as TextStyle,
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.tertiary,
  } as ViewStyle,
  dateText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: "500",
  } as TextStyle,

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 4,
  } as ViewStyle,
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  } as TextStyle,

  // Summary Row
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  } as ViewStyle,
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  } as ViewStyle,
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.ui.background,
  } as ViewStyle,
  methodText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
  } as TextStyle,
  itemCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  } as TextStyle,
  totalAmount: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.text.primary,
  } as TextStyle,

  // Expand hint
  expandHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    gap: 4,
  } as ViewStyle,
  expandHintText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  } as TextStyle,

  // Expanded section
  expandedSection: {
    marginTop: spacing.sm,
  } as ViewStyle,
  expandDivider: {
    height: 1,
    backgroundColor: colors.ui.borderLight,
    marginBottom: spacing.md,
  } as ViewStyle,
  expandLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  } as TextStyle,
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  } as ViewStyle,
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
    marginRight: spacing.sm,
  } as ViewStyle,
  itemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.caption,
  } as TextStyle,
  itemQty: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.tertiary,
    marginRight: spacing.md,
  } as TextStyle,
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  } as TextStyle,

  // Breakdown
  breakdownSection: {
    backgroundColor: colors.ui.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  } as ViewStyle,
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  } as ViewStyle,
  breakdownLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: "500",
  } as TextStyle,
  breakdownValue: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: "600",
  } as TextStyle,
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.sm,
  } as ViewStyle,
  breakdownTotal: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text.primary,
  } as TextStyle,
  breakdownTotalValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.brand.primary,
  } as TextStyle,

  // Refund Banner
  refundBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.tint.purpleLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  } as ViewStyle,
  refundText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.tint.purple,
  } as TextStyle,

  // Transaction ID
  txnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
  } as ViewStyle,
  txnLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
  txnValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    fontFamily: "monospace",
  } as TextStyle,

  // Actions
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  } as ViewStyle,
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.ui.background,
    borderWidth: 1,
    borderColor: colors.ui.border,
  } as ViewStyle,
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primary,
  } as TextStyle,

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  } as ViewStyle,
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  } as TextStyle,
  emptyDesc: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    fontWeight: "500",
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
});
