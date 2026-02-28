import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Minus,
    Plus,
    ShoppingBag,
    Square,
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

// Extended cart item with booking info
interface BookedService {
  id: string;
  serviceName: string;
  storeName: string;
  storeId: string;
  price: number;
  bookingDate: string;
  bookingTime: string;
  image?: string;
}

export default function CartScreen() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, cartTotal } = useApp();

  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );

  // Selection state for summary calculation
  const [selectedCategories, setSelectedCategories] = useState<{
    products: boolean;
    services: boolean;
  }>({ products: true, services: true });

  // Mock booked services
  const [bookedServices, setBookedServices] = useState<BookedService[]>([
    {
      id: "1",
      serviceName: "Home Delivery",
      storeName: "Sharma Kirana",
      storeId: "1",
      price: 0,
      bookingDate: "2024-02-15",
      bookingTime: "10:00 AM",
      image:
        "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=300",
    },
    {
      id: "2",
      serviceName: "Same Day Delivery",
      storeName: "Organic Farms",
      storeId: "2",
      price: 50,
      bookingDate: "2024-02-15",
      bookingTime: "2:00 PM",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300",
    },
  ]);

  const updateQuantity = (item: any, increment: boolean) => {
    if (increment) {
      addToCart(item);
    } else {
      if (item.quantity === 1) {
        removeFromCart(item.id);
      }
    }
  };

  const removeService = (serviceId: string) => {
    setBookedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const toggleCategory = (category: "products" | "services") => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const servicesTotal = bookedServices.reduce(
    (sum, service) => sum + service.price,
    0,
  );

  // Calculate total based on selection
  const activeCartTotal = selectedCategories.products ? cartTotal : 0;
  const activeServicesTotal = selectedCategories.services ? servicesTotal : 0;
  const deliveryFee = activeCartTotal > 500 || activeCartTotal === 0 ? 0 : 40;
  const totalAmount = activeCartTotal + activeServicesTotal + deliveryFee;

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
              onPress={() => removeFromCart(item.id)}
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
              <Text style={styles.subtotalLabel}>Subtotal:</Text>
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

    return (
      <TouchableOpacity
        onPress={() => router.push(`/service/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.serviceItem}>
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
                {item.price === 0 ? "FREE" : `₹${item.price}`}
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
          <Text style={styles.headerTitle}>My Cart</Text>
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
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>
            Add items from stores to get started
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(drawer)/(tabs)/bazar")}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
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
                Products ({cart.length})
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
                Services ({bookedServices.length})
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
                    ? `${cart.length} ${cart.length === 1 ? "item" : "items"}`
                    : `${bookedServices.length} ${bookedServices.length === 1 ? "booking" : "bookings"}`}
                </Text>
              </View>
            }
          />

          <View style={styles.summaryCard}>
            {/* Products Selection Row */}
            <TouchableOpacity
              style={styles.summaryRow}
              onPress={() => toggleCategory("products")}
              activeOpacity={0.7}
            >
              <View style={styles.selectionLabelGroup}>
                {selectedCategories.products ? (
                  <CheckCircle
                    size={20}
                    color={colors.brand.primary}
                    fill={colors.brand.primary}
                  />
                ) : (
                  <Square size={20} color={colors.text.secondary} />
                )}
                <Text
                  style={[
                    styles.summaryLabel,
                    !selectedCategories.products && {
                      color: colors.text.secondary,
                    },
                  ]}
                >
                  Products
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  !selectedCategories.products && {
                    textDecorationLine: "line-through",
                    color: colors.text.secondary,
                  },
                ]}
              >
                ₹{cartTotal}
              </Text>
            </TouchableOpacity>

            {/* Services Selection Row */}
            <TouchableOpacity
              style={styles.summaryRow}
              onPress={() => toggleCategory("services")}
              activeOpacity={0.7}
            >
              <View style={styles.selectionLabelGroup}>
                {selectedCategories.services ? (
                  <CheckCircle
                    size={20}
                    color={colors.brand.primary}
                    fill={colors.brand.primary}
                  />
                ) : (
                  <Square size={20} color={colors.text.secondary} />
                )}
                <Text
                  style={[
                    styles.summaryLabel,
                    !selectedCategories.services && {
                      color: colors.text.secondary,
                    },
                  ]}
                >
                  Services
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  !selectedCategories.services && {
                    textDecorationLine: "line-through",
                    color: colors.text.secondary,
                  },
                ]}
              >
                {servicesTotal === 0 ? (
                  <Text style={styles.freeText}>FREE</Text>
                ) : (
                  `₹${servicesTotal}`
                )}
              </Text>
            </TouchableOpacity>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? (
                  <Text style={styles.freeText}>FREE</Text>
                ) : (
                  `₹${deliveryFee}`
                )}
              </Text>
            </View>

            {activeCartTotal > 500 && (
              <View style={styles.savingsRow}>
                <CheckCircle
                  size={16}
                  color={colors.status.success}
                  fill={colors.status.success}
                />
                <Text style={styles.savingsText}>
                  You saved ₹40 on delivery!
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push("/payments/checkout")}
              disabled={
                !selectedCategories.products && !selectedCategories.services
              }
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ArrowLeft
                size={18}
                color="#FFF"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
          </View>
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
  summaryCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.md,
    ...shadows.large,
    paddingBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  selectionLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text.primary,
  },
  freeText: { color: colors.status.success, fontWeight: "800" },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.successLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.success,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.status.successDark,
    flex: 1,
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 24,
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
