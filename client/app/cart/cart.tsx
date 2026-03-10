import { BookedService, useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Minus,
    Plus,
    ShoppingBag,
    Store,
    Trash2,
    Wrench,
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
import Toast from "react-native-toast-message";

export default function CartScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    bookedServices,
    cancelBooking,
    confirmBooking,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"products" | "services">(
    tab === "services" ? "services" : "products",
  );

  const updateQuantity = (item: any, increment: boolean) => {
    if (increment) {
      addToCart(item);
    } else {
      if (item.quantity > 1) {
        updateCartQuantity(item.id, item.quantity - 1);
      } else {
        removeFromCart(item.id);
        Toast.show({
          type: "info",
          text1: t("cart.removeItem"),
          text2: `${item.name} removed`,
          visibilityTime: 1500,
          position: "top",
        });
      }
    }
  };

  const removeService = (serviceId: string) => {
    cancelBooking(serviceId);
    Toast.show({
      type: "info",
      text1: t("cart.serviceRemoved"),
      text2: t("cart.bookingCancelled"),
      visibilityTime: 1500,
      position: "top",
    });
  };

  const deliveryFee = cartTotal > 500 || cartTotal === 0 ? 0 : 40;

  const ProductCard = ({ item }: { item: any }) => {
    const hasImage = item.image && item.image !== "";
    const imageSource = hasImage
      ? typeof item.image === "string"
        ? { uri: item.image }
        : item.image
      : null;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cartItem}>
          <View style={styles.itemHeader}>
            <View style={styles.imageContainer}>
              {imageSource ? (
                <Image source={imageSource} style={styles.productImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <ShoppingBag size={24} color={colors.brand.primary} />
                </View>
              )}
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              {item.storeName && (
                <TouchableOpacity
                  style={styles.storeTag}
                  onPress={() =>
                    item.storeId && router.push(`/dukaan/${item.storeId}`)
                  }
                >
                  <Store size={12} color={colors.brand.primary} />
                  <Text style={styles.storeText} numberOfLines={1}>
                    {item.storeName}
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                removeFromCart(item.id);
                Toast.show({
                  type: "info",
                  text1: t("cart.removeItem"),
                  text2: `${item.name} removed`,
                  visibilityTime: 1500,
                  position: "top",
                });
              }}
            >
              <Trash2 size={18} color={colors.status.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(item, false)}
              >
                <Minus size={14} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(item, true)}
              >
                <Plus size={14} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalLabel}>{t("cart.subtotal")}:</Text>
              <Text style={styles.subtotalValue}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ServiceCard = ({ item }: { item: BookedService }) => {
    const hasImage = item.image && item.image !== "";
    const isPending = item.status === "pending";

    return (
      <TouchableOpacity
        onPress={() => router.push(`/service/${item.serviceId}`)}
        activeOpacity={0.8}
      >
        <View
          style={[styles.serviceItem, isPending && styles.serviceItemPending]}
        >
          {/* Status badge */}
          <View
            style={[
              styles.statusBadge,
              isPending ? styles.statusPending : styles.statusConfirmed,
            ]}
          >
            {isPending ? (
              <AlertTriangle size={12} color={colors.status.warningDark} />
            ) : (
              <CheckCircle size={12} color={colors.status.successDark} />
            )}
            <Text
              style={[
                styles.statusText,
                isPending
                  ? { color: colors.status.warningDark }
                  : { color: colors.status.successDark },
              ]}
            >
              {isPending ? t("cart.pendingPayment") : t("cart.confirmed")}
            </Text>
          </View>

          <View style={styles.itemHeader}>
            <View style={styles.imageContainer}>
              {hasImage ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Wrench size={24} color={colors.brand.primary} />
                </View>
              )}
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.serviceName}
              </Text>

              <TouchableOpacity
                style={styles.storeTag}
                onPress={() => router.push(`/dukaan/${item.storeId}`)}
              >
                <Store size={12} color={colors.brand.primary} />
                <Text style={styles.storeText} numberOfLines={1}>
                  {item.storeName}
                </Text>
              </TouchableOpacity>

              <Text style={styles.itemPrice}>
                {item.price === 0 ? t("cart.free") : `₹${item.price}`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => removeService(item.id)}
            >
              <Trash2 size={18} color={colors.status.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.bookingInfo}>
              <Calendar size={14} color={colors.brand.primary} />
              <Text style={styles.bookingText}>
                {new Date(item.bookingDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.bookingInfo}>
              <Clock size={14} color={colors.brand.primary} />
              <Text style={styles.bookingText}>{item.bookingTime}</Text>
            </View>
          </View>

          {isPending && (
            <TouchableOpacity
              style={styles.confirmPayBtn}
              onPress={() => {
                router.push({
                  pathname: "/payments/checkout",
                  params: {
                    mode: "service",
                    serviceId: item.id,
                    serviceName: item.serviceName,
                  },
                } as any);
              }}
            >
              <Text style={styles.confirmPayText}>{t("cart.confirmPay")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const isEmpty = cart.length === 0 && bookedServices.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ShoppingBag size={20} color={colors.brand.primary} />
          <Text style={styles.headerTitle}>{t("cart.myCart")}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag
              size={80}
              color={colors.ui.disabled}
              strokeWidth={1.5}
            />
          </View>
          <Text style={styles.emptyText}>{t("cart.empty")}</Text>
          <Text style={styles.emptySubtext}>{t("cart.emptySubtext")}</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(drawer)/(tabs)/bazar")}
          >
            <Text style={styles.shopButtonText}>{t("cart.startShopping")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "products" && styles.activeTab]}
              onPress={() => setActiveTab("products")}
            >
              <ShoppingBag
                size={18}
                color={
                  activeTab === "products"
                    ? colors.brand.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "products" && styles.activeTabText,
                ]}
              >
                {t("cart.products")} ({cart.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "services" && styles.activeTab]}
              onPress={() => setActiveTab("services")}
            >
              <Wrench
                size={18}
                color={
                  activeTab === "services"
                    ? colors.brand.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "services" && styles.activeTabText,
                ]}
              >
                {t("cart.services")} ({bookedServices.length})
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={(activeTab === "products" ? cart : bookedServices) as any[]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              activeTab === "products" ? (
                <ProductCard item={item} />
              ) : (
                <ServiceCard item={item as BookedService} />
              )
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.itemCountText}>
                  {activeTab === "products"
                    ? `${cart.length} ${cart.length === 1 ? t("cart.item") : t("cart.items")}`
                    : `${bookedServices.length} ${bookedServices.length === 1 ? t("cart.booking") : t("cart.bookings")}`}
                </Text>
              </View>
            }
          />

          {/* Show checkout summary only for products tab */}
          {activeTab === "products" && cart.length > 0 && (
            <View style={styles.summaryCard}>
              {/* Products Total Row */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("cart.products")}</Text>
                <Text style={styles.summaryValue}>₹{cartTotal}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("cart.deliveryFee")}</Text>
                <Text style={styles.summaryValue}>
                  {deliveryFee === 0 ? (
                    <Text style={styles.freeText}>FREE</Text>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </Text>
              </View>

              {cartTotal > 500 && (
                <View style={styles.savingsRow}>
                  <CheckCircle
                    size={16}
                    color={colors.status.success}
                    fill={colors.status.success}
                  />
                  <Text style={styles.savingsText}>
                    {t("cart.savedDelivery")}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>{t("cart.total")}</Text>
                <Text style={styles.totalValue}>
                  ₹{cartTotal + deliveryFee}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() =>
                  router.push({
                    pathname: "/payments/checkout",
                    params: {
                      mode: "cart",
                      includeProducts: "true",
                      includeServices: "false",
                    },
                  } as any)
                }
              >
                <Text style={styles.checkoutBtnText}>
                  {t("cart.proceedCheckout")}
                </Text>
                <ArrowLeft
                  size={18}
                  color="#FFF"
                  style={{ transform: [{ rotate: "180deg" }] }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
  },
  contentContainer: { flex: 1 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: colors.brand.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  activeTabText: { color: colors.brand.primary, fontWeight: "700" },
  listContent: { padding: spacing.md, paddingBottom: 280 },
  listHeader: { marginBottom: spacing.md },
  itemCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  cartItem: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  serviceItem: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1.5,
    borderColor: colors.tint.purpleLight,
  },
  itemHeader: {
    flexDirection: "row",
    marginBottom: spacing.md,
    alignItems: "flex-start",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginRight: spacing.md,
    backgroundColor: colors.ui.backgroundAlt,
    ...shadows.small,
  },
  productImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.tint.purpleLight,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: { flex: 1, justifyContent: "space-between" },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  storeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.tint.purpleLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  storeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.brand.primary,
    maxWidth: 120,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.status.errorBorder,
    backgroundColor: colors.status.errorLight,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.background,
    borderRadius: radius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    minWidth: 45,
    textAlign: "center",
  },
  subtotalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  subtotalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  bookingDetails: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1.5,
    borderTopColor: colors.tint.purpleLight,
  },
  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.tint.purpleLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flex: 1,
  },
  bookingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  serviceItemPending: {
    borderColor: colors.status.warning || "#f59e0b",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  statusPending: {
    backgroundColor: colors.status.warningLight,
  },
  statusConfirmed: {
    backgroundColor: colors.status.successLight,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  confirmPayBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmPayText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  summaryCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    ...shadows.large,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: "center",
    paddingVertical: 3,
  },
  selectionLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.primary,
  },
  freeText: { color: colors.status.success, fontWeight: "800" },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.success,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.successDark,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    marginTop: spacing.md,
    ...shadows.medium,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
    backgroundColor: colors.ui.backgroundAlt,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  shopButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 40,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    ...shadows.medium,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
