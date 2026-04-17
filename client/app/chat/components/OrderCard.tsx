import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius, shadows } from "../../../src/theme/colors";

interface OrderCardProps {
  data: {
    id: string;
    shortId: string;
    total: number;
    status: string;
    paymentMethod?: string;
    paymentStatus?: string;
    items?: Array<{ name: string; quantity: number; price?: number }>;
    createdAt?: string;
  };
  onTrack?: (orderId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; emoji: string }> = {
  processing: {
    label: "Processing",
    bg: colors.tint.blueLight,
    text: colors.tint.blue,
    emoji: "🔄",
  },
  confirmed: {
    label: "Confirmed",
    bg: colors.status.successLight,
    text: colors.status.successDark,
    emoji: "✅",
  },
  "in-transit": {
    label: "In Transit",
    bg: colors.tint.orangeLight,
    text: colors.tint.orange,
    emoji: "🚚",
  },
  delivered: {
    label: "Delivered",
    bg: colors.status.successLight,
    text: colors.status.successDark,
    emoji: "📦",
  },
  cancelled: {
    label: "Cancelled",
    bg: colors.status.errorLight,
    text: colors.status.errorDark,
    emoji: "❌",
  },
};

export default function OrderCard({ data, onTrack }: OrderCardProps) {
  const statusInfo = STATUS_CONFIG[data.status] || STATUS_CONFIG.processing;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order #{data.shortId}</Text>
          {data.createdAt && (
            <Text style={styles.date}>
              {new Date(data.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.text }]}>
            {statusInfo.emoji} {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Items */}
      {data.items && data.items.length > 0 && (
        <View style={styles.itemsSection}>
          {data.items.slice(0, 3).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
              {item.price !== undefined && (
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
              )}
            </View>
          ))}
          {data.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{data.items.length - 3} more item(s)
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{data.total}</Text>
        </View>
        {data.paymentMethod && (
          <Text style={styles.payment}>
            {data.paymentMethod === "cod" ? "💵 Cash on Delivery" : "💳 Online"}
          </Text>
        )}
      </View>

      {/* Action Button */}
      {data.status !== "delivered" && data.status !== "cancelled" && (
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => onTrack?.(data.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.trackBtnText}>📍 Track Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    marginHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.ui.border,
    overflow: "hidden",
    ...shadows.small,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
    paddingBottom: 10,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemsSection: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  itemQty: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    minWidth: 50,
    textAlign: "right",
  },
  moreItems: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: "italic",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.ui.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  payment: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  trackBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  trackBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
