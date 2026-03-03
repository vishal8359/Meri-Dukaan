// app/payments/history.tsx
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Download,
    Filter,
    IndianRupee,
    ReceiptText,
    RefreshCw,
    Search,
    Store,
    Wallet,
    XCircle
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
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
  image?: string;
}

interface PaymentRecord {
  id: string;
  orderId: string;
  transactionId: string;
  date: string;
  time: string;
  storeName: string;
  storeImage: string;
  storeId: string;
  items: PaymentItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "UPI" | "Card" | "COD" | "Wallet" | "Net Banking";
  status: "success" | "failed" | "refunded" | "pending";
  refundAmount?: number;
  refundDate?: string;
}

// --- Mock Data ---
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "PAY001",
    orderId: "ORD001",
    transactionId: "TXN78234901",
    date: "2024-01-17",
    time: "10:34 AM",
    storeName: "Sharma Kirana",
    storeImage:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=300",
    storeId: "1",
    items: [
      { id: "p1", name: "Fresh Tomatoes", qty: 2, price: 80 },
      { id: "p2", name: "Organic Onions", qty: 3, price: 120 },
      { id: "p3", name: "Potatoes (1kg)", qty: 1, price: 40 },
    ],
    subtotal: 450,
    deliveryFee: 0,
    discount: 50,
    totalAmount: 400,
    paymentMethod: "UPI",
    status: "success",
  },
  {
    id: "PAY002",
    orderId: "ORD002",
    transactionId: "TXN78234902",
    date: "2024-01-18",
    time: "2:15 PM",
    storeName: "Organic Farms",
    storeImage:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300",
    storeId: "2",
    items: [
      { id: "p4", name: "Green Chilies (250g)", qty: 1, price: 30 },
      { id: "p5", name: "Fresh Coriander", qty: 2, price: 40 },
    ],
    subtotal: 280,
    deliveryFee: 40,
    discount: 0,
    totalAmount: 320,
    paymentMethod: "Card",
    status: "success",
  },
  {
    id: "PAY003",
    orderId: "ORD003",
    transactionId: "TXN78234903",
    date: "2024-01-19",
    time: "5:48 PM",
    storeName: "Modern Furniture",
    storeImage:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300",
    storeId: "3",
    items: [
      { id: "p6", name: "Wooden Chair", qty: 1, price: 2500 },
      { id: "p7", name: "Table Lamp", qty: 1, price: 1000 },
    ],
    subtotal: 3500,
    deliveryFee: 0,
    discount: 200,
    totalAmount: 3300,
    paymentMethod: "Net Banking",
    status: "pending",
  },
  {
    id: "PAY004",
    orderId: "ORD004",
    transactionId: "TXN78234904",
    date: "2024-01-10",
    time: "9:20 AM",
    storeName: "Sharma Kirana",
    storeImage:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=300",
    storeId: "1",
    items: [
      { id: "p8", name: "Basmati Rice (5kg)", qty: 1, price: 450 },
      { id: "p9", name: "Toor Dal (1kg)", qty: 2, price: 240 },
      { id: "p10", name: "Sunflower Oil (1L)", qty: 1, price: 200 },
    ],
    subtotal: 890,
    deliveryFee: 0,
    discount: 0,
    totalAmount: 890,
    paymentMethod: "COD",
    status: "refunded",
    refundAmount: 890,
    refundDate: "2024-01-12",
  },
  {
    id: "PAY005",
    orderId: "ORD005",
    transactionId: "TXN78234905",
    date: "2024-01-22",
    time: "11:05 AM",
    storeName: "Glow Up Studio",
    storeImage:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300",
    storeId: "6",
    items: [{ id: "p11", name: "Hair Spa Treatment", qty: 1, price: 1200 }],
    subtotal: 1200,
    deliveryFee: 0,
    discount: 100,
    totalAmount: 1100,
    paymentMethod: "Wallet",
    status: "success",
  },
  {
    id: "PAY006",
    orderId: "ORD006",
    transactionId: "TXN78234906",
    date: "2024-01-25",
    time: "3:30 PM",
    storeName: "Pizza Palace",
    storeImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300",
    storeId: "4",
    items: [
      { id: "p12", name: "Margherita Pizza", qty: 2, price: 500 },
      { id: "p13", name: "Garlic Bread", qty: 1, price: 150 },
      { id: "p14", name: "Cold Drink (750ml)", qty: 2, price: 120 },
    ],
    subtotal: 770,
    deliveryFee: 30,
    discount: 0,
    totalAmount: 800,
    paymentMethod: "UPI",
    status: "failed",
  },
];

type FilterType = "all" | "success" | "failed" | "refunded" | "pending";

// --- Main Component ---
export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "success", label: "Successful" },
    { key: "pending", label: "Pending" },
    { key: "failed", label: "Failed" },
    { key: "refunded", label: "Refunded" },
  ];

  const filteredPayments = useMemo(() => {
    let data = MOCK_PAYMENTS;
    if (activeFilter !== "all") {
      data = data.filter((p) => p.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.storeName.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q) ||
          p.items.some((i) => i.name.toLowerCase().includes(q)),
      );
    }
    return data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [activeFilter, searchQuery]);

  const totals = useMemo(() => {
    const successful = MOCK_PAYMENTS.filter((p) => p.status === "success");
    const totalSpent = successful.reduce((s, p) => s + p.totalAmount, 0);
    const totalRefunded = MOCK_PAYMENTS.filter(
      (p) => p.status === "refunded",
    ).reduce((s, p) => s + (p.refundAmount || 0), 0);
    return {
      totalSpent,
      totalRefunded,
      totalTransactions: MOCK_PAYMENTS.length,
    };
  }, []);

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
      case "refunded":
        return {
          icon: RefreshCw,
          color: colors.tint.purple,
          bg: colors.tint.purpleLight,
          text: "Refunded",
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
      case "Wallet":
        return Wallet;
      case "Net Banking":
        return ArrowUpRight;
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
            <Image
              source={{ uri: item.storeImage }}
              style={styles.storeThumb}
            />
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
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>
                  ₹{item.subtotal.toLocaleString("en-IN")}
                </Text>
              </View>
              {item.deliveryFee > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Delivery Fee</Text>
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
                    Discount
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
                <Text style={styles.breakdownTotal}>Total Paid</Text>
                <Text style={styles.breakdownTotalValue}>
                  ₹{item.totalAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            {/* Refund info */}
            {item.status === "refunded" && item.refundAmount && (
              <View style={styles.refundBanner}>
                <RefreshCw size={14} color={colors.tint.purple} />
                <Text style={styles.refundText}>
                  ₹{item.refundAmount} refunded on{" "}
                  {formatDate(item.refundDate!)}
                </Text>
              </View>
            )}

            {/* Transaction ID */}
            <View style={styles.txnRow}>
              <Text style={styles.txnLabel}>Transaction ID</Text>
              <Text style={styles.txnValue}>{item.transactionId}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <Download size={15} color={colors.brand.primary} />
                <Text style={styles.actionBtnText}>Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/dukaan/${item.storeId}` as any)}
              >
                <Store size={15} color={colors.tint.green} />
                <Text
                  style={[styles.actionBtnText, { color: colors.tint.green }]}
                >
                  Visit Store
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
          style={[styles.sumCard, { backgroundColor: colors.tint.purpleLight }]}
        >
          <View
            style={[
              styles.sumIconBg,
              { backgroundColor: colors.tint.purple + "25" },
            ]}
          >
            <RefreshCw size={18} color={colors.tint.purple} />
          </View>
          <Text style={[styles.sumValue, { color: colors.tint.purple }]}>
            ₹{totals.totalRefunded.toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.sumLabel, { color: colors.tint.purple + "99" }]}>
            Refunded
          </Text>
        </View>

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
            Transactions
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by store, order, or item..."
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
                      MOCK_PAYMENTS.filter((p) =>
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
      <Text style={styles.emptyTitle}>No Payments Found</Text>
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
        <Text style={styles.topTitle}>Payment History</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Filter size={20} color={colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  storeThumb: {
    width: 42,
    height: 42,
    borderRadius: 12,
    marginRight: spacing.sm,
    backgroundColor: colors.ui.backgroundAlt,
  },
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
});
