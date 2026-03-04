// app/myorders/[id].tsx
import { Order, OrderItem, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useMemo } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// --- Status helpers ---
const STATUS_MAP: Record<
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

// --- Timeline steps ---
const TIMELINE_STEPS = [
  {
    key: "processing",
    label: "Order Placed",
    icon: "receipt-outline" as const,
  },
  { key: "in-transit", label: "Shipped", icon: "bicycle-outline" as const },
  {
    key: "delivered",
    label: "Delivered",
    icon: "checkmark-circle-outline" as const,
  },
];

const getStepIndex = (status: string) => {
  if (status === "cancelled") return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

// --- PDF Receipt HTML Generator ---
const generateReceiptHTML = (order: Order): string => {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 8px; border-bottom:1px solid #f1f5f9;">
          <div style="font-weight:600; color:#0F172A;">${item.name}</div>
          ${item.storeName ? `<div style="font-size:12px; color:#64748B;">from ${item.storeName}</div>` : ""}
        </td>
        <td style="padding:10px 8px; border-bottom:1px solid #f1f5f9; text-align:center; color:#64748B;">${item.quantity}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #f1f5f9; text-align:center; color:#64748B;">₹${item.price.toLocaleString("en-IN")}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:600; color:#0F172A;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Order Receipt - ${order.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; background: #fff; padding: 32px; }
        .receipt { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid #203659; margin-bottom: 24px; }
        .brand { font-size: 28px; font-weight: 800; color: #203659; letter-spacing: -0.5px; }
        .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
        .order-meta { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .meta-block { }
        .meta-label { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .meta-value { font-size: 14px; font-weight: 600; color: #0F172A; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
        .status-processing { background: #FEF3C7; color: #B45309; }
        .status-in-transit { background: #DBEAFE; color: #1E40AF; }
        .status-delivered { background: #DCFCE7; color: #16A34A; }
        .status-cancelled { background: #FEF2F2; color: #991B1B; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { padding: 10px 8px; text-align: left; font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E2E8F0; }
        th:nth-child(2), th:nth-child(3) { text-align: center; }
        th:last-child { text-align: right; }
        .totals { border-top: 2px solid #E2E8F0; padding-top: 16px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total-row.grand { font-size: 18px; font-weight: 800; color: #203659; padding-top: 12px; border-top: 2px solid #203659; margin-top: 8px; }
        .delivery-info { margin-top: 24px; padding: 16px; background: #F5F7FA; border-radius: 8px; }
        .delivery-title { font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
        .delivery-text { font-size: 13px; color: #64748B; line-height: 1.5; }
        .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="brand">myBusz</div>
          <div class="subtitle">Order Receipt</div>
        </div>

        <div class="order-meta">
          <div class="meta-block">
            <div class="meta-label">Order ID</div>
            <div class="meta-value">#${order.id.slice(-8)}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Date</div>
            <div class="meta-value">${new Date(order.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Status</div>
            <div class="status-badge status-${order.status}">${STATUS_MAP[order.status]?.label || order.status}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Payment</div>
            <div class="meta-value">${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div class="total-row">
            <span>Delivery Fee</span>
            <span>${order.deliveryFee === 0 ? "FREE" : "₹" + order.deliveryFee.toLocaleString("en-IN")}</span>
          </div>
          <div class="total-row grand">
            <span>Total Amount</span>
            <span>₹${order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div class="delivery-info">
          <div class="delivery-title">Delivery Address</div>
          <div class="delivery-text">${order.deliveryAddress}</div>
          <div class="delivery-text" style="margin-top:4px">Phone: ${order.deliveryPhone}</div>
          ${order.deliveryDate ? `<div class="delivery-text" style="margin-top:4px">Expected Delivery: ${new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
        </div>

        <div class="footer">
          Thank you for shopping with myBusz!<br />
          This is a computer-generated receipt and does not require a signature.
        </div>
      </div>
    </body>
    </html>
  `;
};

// --- Item Row Component ---
const ItemRow = React.memo(({ item }: { item: OrderItem }) => (
  <View style={styles.itemRow}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.itemImage} />
    ) : (
      <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
        <Ionicons name="cube-outline" size={18} color={colors.ui.muted} />
      </View>
    )}
    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      {item.storeName && (
        <Text style={styles.itemStore}>from {item.storeName}</Text>
      )}
      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
    </View>
    <Text style={styles.itemPrice}>
      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
    </Text>
  </View>
));

// --- Main Screen ---
export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById, updateOrderStatus } = useApp();

  const order = useMemo(() => getOrderById(id), [id, getOrderById]);

  const statusConfig = order
    ? (STATUS_MAP[order.status] ?? STATUS_MAP.processing)
    : STATUS_MAP.processing;

  const currentStep = order ? getStepIndex(order.status) : 0;

  // --- Print / Share PDF ---
  const handleDownloadReceipt = useCallback(async () => {
    if (!order) return;
    try {
      const html = generateReceiptHTML(order);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Order Receipt #${order.id.slice(-8)}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("PDF Saved", `Receipt saved to:\n${uri}`);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to generate receipt. Please try again.");
    }
  }, [order]);

  const handleCancelOrder = useCallback(() => {
    if (!order) return;
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => updateOrderStatus(order.id, "cancelled"),
      },
    ]);
  }, [order, updateOrderStatus]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundWrap}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.ui.disabled}
          />
          <Text style={styles.notFoundText}>
            This order could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id.slice(-8)}</Text>
        <TouchableOpacity onPress={handleDownloadReceipt} hitSlop={8}>
          <Ionicons
            name="download-outline"
            size={24}
            color={colors.brand.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={16}
              color={statusConfig.color}
            />
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.statusDate}>
            Ordered on{" "}
            {new Date(order.orderDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>

          {/* Progress Timeline */}
          {order.status !== "cancelled" && (
            <View style={styles.timeline}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isLast = idx === TIMELINE_STEPS.length - 1;
                return (
                  <View key={step.key} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          isCompleted && styles.timelineDotActive,
                        ]}
                      >
                        <Ionicons
                          name={step.icon}
                          size={14}
                          color={
                            isCompleted
                              ? colors.text.inverse
                              : colors.text.tertiary
                          }
                        />
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.timelineLine,
                            isCompleted && styles.timelineLineActive,
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {order.status === "cancelled" && (
            <View style={styles.cancelledBanner}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.status.error}
              />
              <Text style={styles.cancelledText}>
                This order has been cancelled
              </Text>
            </View>
          )}
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </Text>
          {order.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              ₹{order.subtotal.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text
              style={[
                styles.priceValue,
                order.deliveryFee === 0 && { color: colors.status.success },
              ]}
            >
              {order.deliveryFee === 0
                ? "FREE"
                : `₹${order.deliveryFee.toLocaleString("en-IN")}`}
            </Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.text.secondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={18}
              color={colors.text.secondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{order.deliveryPhone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="card-outline"
              size={18}
              color={colors.text.secondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </Text>
            </View>
          </View>
          {order.deliveryDate && (
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.text.secondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Expected Delivery</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={handleDownloadReceipt}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.text.inverse}
            />
            <Text style={styles.receiptBtnText}>Download Receipt (PDF)</Text>
          </TouchableOpacity>

          {order.status === "processing" && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelOrder}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={colors.status.error}
              />
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },

  // Not found
  notFoundWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.text.secondary,
  },

  // Status Card
  statusCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusDate: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },

  // Timeline
  timeline: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineLeft: {
    alignItems: "center",
    width: 32,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotActive: {
    backgroundColor: colors.brand.primary,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.ui.border,
  },
  timelineLineActive: {
    backgroundColor: colors.brand.primary,
  },
  timelineLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
    marginTop: 5,
  },
  timelineLabelActive: {
    color: colors.text.primary,
    fontWeight: "600",
  },

  // Cancelled
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.status.errorLight,
    borderRadius: radius.sm,
  },
  cancelledText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.status.error,
  },

  // Section
  section: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm + 2,
  },

  // Item Row
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    gap: spacing.sm,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.ui.backgroundAlt,
  },
  itemImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  itemStore: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  itemQty: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },

  // Price Breakdown
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.sm,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.primary,
  },

  // Delivery Info
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },

  // Actions
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  receiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    ...shadows.small,
  },
  receiptBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.errorLight,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.status.error,
  },
});
