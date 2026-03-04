// app/bookings/services.tsx
import { BookedService, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterKey = "all" | "confirmed" | "pending" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }
> = {
  confirmed: {
    icon: "checkmark-circle-outline",
    color: colors.status.success,
    bg: colors.status.successLight,
    label: "Confirmed",
  },
  pending: {
    icon: "time-outline",
    color: colors.status.warning,
    bg: colors.status.warningLight,
    label: "Pending",
  },
  completed: {
    icon: "trophy-outline",
    color: colors.status.info,
    bg: colors.status.infoLight,
    label: "Completed",
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
  { key: "confirmed", label: "Confirmed" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

// --- Booking Card ---
const BookingCard = React.memo(
  ({
    booking,
    onCancel,
    onViewStore,
  }: {
    booking: BookedService;
    onCancel: (id: string) => void;
    onViewStore: (storeId: string) => void;
  }) => {
    const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;

    return (
      <View style={styles.card}>
        {/* Top: image + info + status */}
        <View style={styles.cardTop}>
          {booking.image ? (
            <Image source={{ uri: booking.image }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <Ionicons name="construct-outline" size={22} color={colors.ui.muted} />
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {booking.serviceName}
            </Text>
            <TouchableOpacity
              onPress={() => onViewStore(booking.storeId)}
              activeOpacity={0.6}
            >
              <Text style={styles.storeName} numberOfLines={1}>
                {booking.storeName}
              </Text>
            </TouchableOpacity>
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

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>{booking.bookingTime}</Text>
          </View>
          {booking.duration && (
            <View style={styles.detailItem}>
              <Ionicons name="hourglass-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.detailText}>{booking.duration}</Text>
            </View>
          )}
        </View>

        {/* Footer: price + actions */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>Amount</Text>
            <Text style={styles.price}>₹{booking.price.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.actionRow}>
            {(booking.status === "confirmed" || booking.status === "pending") && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => onCancel(booking.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-outline" size={16} color={colors.status.error} />
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.storeBtn}
              onPress={() => onViewStore(booking.storeId)}
              activeOpacity={0.7}
            >
              <Ionicons name="storefront-outline" size={16} color={colors.brand.primary} />
              <Text style={styles.storeBtnText}>View Store</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

// --- Empty State ---
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <Ionicons name="calendar-clear-outline" size={56} color={colors.ui.disabled} />
    </View>
    <Text style={styles.emptyTitle}>No bookings yet</Text>
    <Text style={styles.emptySubtitle}>
      Your booked services will appear here
    </Text>
  </View>
);

// --- Main Screen ---
export default function BookedServicesScreen() {
  const router = useRouter();
  const { bookedServices, cancelBooking } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookedServices;
    return bookedServices.filter((b) => b.status === activeFilter);
  }, [bookedServices, activeFilter]);

  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookedServices.length };
    bookedServices.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [bookedServices]);

  const handleCancel = useCallback(
    (bookingId: string) => {
      Alert.alert(
        "Cancel Booking",
        "Are you sure you want to cancel this booking?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: () => cancelBooking(bookingId),
          },
        ],
      );
    },
    [cancelBooking],
  );

  const handleViewStore = useCallback(
    (storeId: string) => {
      router.push({ pathname: "/dukaan/[id]", params: { id: storeId } } as any);
    },
    [router],
  );

  const renderBooking = useCallback(
    ({ item }: { item: BookedService }) => (
      <BookingCard
        booking={item}
        onCancel={handleCancel}
        onViewStore={handleViewStore}
      />
    ),
    [handleCancel, handleViewStore],
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
        <Text style={styles.headerTitle}>Booked Services</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Summary strip */}
      {bookedServices.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryCount}>{bookedServices.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: colors.status.success }]}>
              {bookingCounts["confirmed"] || 0}
            </Text>
            <Text style={styles.summaryLabel}>Confirmed</Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: colors.status.warning }]}>
              {bookingCounts["pending"] || 0}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
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
          const count = bookingCounts[f.key] || 0;
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
                  style={[styles.filterBadge, isActive && styles.filterBadgeActive]}
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

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
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
    paddingTop: 32,
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
    paddingVertical: spacing.sm + 2,
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
    maxHeight: 42,
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
    paddingVertical: 5,
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
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  storeName: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: "600",
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

  // Details row
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.text.secondary,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.status.errorLight,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.error,
  },
  storeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.tint.blueLight,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  storeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
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
