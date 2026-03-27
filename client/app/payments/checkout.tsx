// app/checkout.tsx
import * as orderApi from "@/src/api/orders";
import { useApp } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Wallet,
  Wrench,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import Toast from "react-native-toast-message";

type CheckoutMode = "cart" | "product" | "service";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    cart,
    clearCart,
    removeFromCart,
    bookedServices,
    catalogProducts,
    confirmBooking,
    placeOrder,
    refreshOrders,
    user,
    savedAddresses,
    selectedAddressId,
  } = useApp();
  const { authToken } = useAuth();
  const params = useLocalSearchParams<{
    mode?: string;
    productId?: string;
    serviceId?: string;
    serviceName?: string;
    includeProducts?: string;
    includeServices?: string;
  }>();

  const mode: CheckoutMode = (params.mode as CheckoutMode) || "cart";
  const includeProducts = params.includeProducts !== "false";
  const includeServices = params.includeServices !== "false";

  const [selectedPayment, setSelectedPayment] = useState<
    "cod" | "online" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    selectedAddressId ||
      savedAddresses.find((a) => a.isDefault)?.id ||
      savedAddresses[0]?.id ||
      "",
  );

  // Derive order items based on checkout mode
  const orderProducts = useMemo(() => {
    if (mode === "product" && params.productId) {
      return cart.filter((item) => item.id === params.productId);
    }
    if (mode === "service") return [];
    return includeProducts ? cart : [];
  }, [mode, params.productId, cart, includeProducts]);

  const orderServices = useMemo(() => {
    if (mode === "service" && params.serviceId) {
      return bookedServices.filter((s) => s.id === params.serviceId);
    }
    if (mode === "product") return [];
    return includeServices ? bookedServices : [];
  }, [mode, params.serviceId, bookedServices, includeServices]);

  const productsSubtotal = orderProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const servicesSubtotal = orderServices.reduce((sum, s) => sum + s.price, 0);
  const itemSubtotal = productsSubtotal + servicesSubtotal;
  const deliveryFee =
    orderProducts.length > 0 ? (productsSubtotal > 500 ? 0 : 40) : 0;
  const totalAmount = itemSubtotal + deliveryFee;

  const productStoreIdByProductId = useMemo(() => {
    const map = new Map<string, string>();
    catalogProducts.forEach((item) => {
      if (item?.id && item?.storeId) {
        map.set(String(item.id), String(item.storeId));
      }
    });
    return map;
  }, [catalogProducts]);

  const productIdByLegacyCartId = useMemo(() => {
    const map = new Map<string, string>();
    catalogProducts.forEach((item) => {
      if (item?.id && item?.storeId) {
        map.set(`${String(item.storeId)}-${String(item.id)}`, String(item.id));
      }
    });
    return map;
  }, [catalogProducts]);

  const normalizedOrderProducts = useMemo(
    () =>
      orderProducts.map((item) => {
        const rawProductId = String(item.id || "");
        const rawStoreId = item.storeId ? String(item.storeId) : "";

        const directProductId = isUuid(rawProductId) ? rawProductId : null;
        const mappedLegacyProductId = productIdByLegacyCartId.get(rawProductId);

        const inferredFromPrefix =
          !directProductId &&
          !mappedLegacyProductId &&
          rawStoreId &&
          rawProductId.startsWith(`${rawStoreId}-`)
            ? rawProductId.slice(rawStoreId.length + 1)
            : "";

        const resolvedProductId =
          directProductId ||
          (mappedLegacyProductId && isUuid(mappedLegacyProductId)
            ? mappedLegacyProductId
            : null) ||
          (isUuid(inferredFromPrefix) ? inferredFromPrefix : null);

        const resolvedStoreId =
          rawStoreId ||
          (resolvedProductId
            ? (productStoreIdByProductId.get(resolvedProductId) ?? "")
            : "");

        return {
          ...item,
          resolvedProductId,
          resolvedStoreId,
        };
      }),
    [orderProducts, productIdByLegacyCartId, productStoreIdByProductId],
  );

  const addresses = savedAddresses.map((a) => ({
    id: a.id,
    name: a.label,
    address: `${a.address}, ${a.city} - ${a.pincode}`,
    phone: a.phone,
    isDefault: a.isDefault,
  }));

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay with cash when order arrives",
      icon: Wallet,
      available: true,
    },
    {
      id: "online",
      name: "Online Payment",
      description: "UPI, Cards, Net Banking, Wallets",
      icon: CreditCard,
      available: true,
    },
  ];

  const finalizePostOrderState = () => {
    // Show success toast based on mode
    if (
      mode === "service" ||
      (mode === "cart" && !includeProducts && includeServices)
    ) {
      Toast.show({
        type: "success",
        text1: "Booking Confirmed!",
        text2: params.serviceName
          ? `${params.serviceName} is now confirmed`
          : "Your service booking is confirmed",
        visibilityTime: 2500,
        position: "top",
      });
    } else if (mode === "cart" && includeProducts && includeServices) {
      Toast.show({
        type: "success",
        text1: "Order & Booking Confirmed!",
        text2: "Your order is placed and services are booked",
        visibilityTime: 2500,
        position: "top",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Order Placed!",
        text2: "Your order has been placed successfully",
        visibilityTime: 2500,
        position: "top",
      });
    }

    // Clear items based on checkout mode
    if (mode === "cart") {
      if (includeProducts) clearCart();
      if (includeServices) {
        orderServices.forEach((s) => {
          void confirmBooking(s.id);
        });
      }
    } else if (mode === "product") {
      // Remove only the ordered product from cart
      if (params.productId) removeFromCart(params.productId);
    } else if (mode === "service") {
      // Confirm the booking only after payment is complete
      if (params.serviceId) {
        void confirmBooking(params.serviceId);
      }
    }

    // Navigate to appropriate page based on what was checked out
    const hasProducts =
      mode === "product" ||
      (mode === "cart" && includeProducts && orderProducts.length > 0);
    const hasServices =
      mode === "service" ||
      (mode === "cart" && includeServices && orderServices.length > 0);

    if (hasProducts && !hasServices) {
      router.replace("/myorders/orders");
    } else if (hasServices && !hasProducts) {
      router.replace("/bookings/services");
    } else {
      // Both products and services — go to orders (primary)
      router.replace("/myorders/orders");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (!selectedAddress) {
      Alert.alert("Address Required", "Please select a delivery address");
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddress);
    const hasProducts =
      mode === "product" ||
      (mode === "cart" && includeProducts && orderProducts.length > 0);

    const uniqueStoreIds = Array.from(
      new Set(
        normalizedOrderProducts
          .map((item) => item.resolvedStoreId)
          .filter(Boolean),
      ),
    );

    if (hasProducts && uniqueStoreIds.length !== 1) {
      Alert.alert(
        "Checkout Limitation",
        "Please checkout items from one store at a time.",
      );
      return;
    }

    const orderPayload = {
      storeId: String(uniqueStoreIds[0] || ""),
      items: normalizedOrderProducts.map((item) => ({
        productId: item.resolvedProductId || "",
        quantity: item.quantity,
      })),
      deliveryFee,
      deliveryAddress: selectedAddr?.address || "",
      deliveryPhone: selectedAddr?.phone || user?.phone || "",
    };

    if (
      hasProducts &&
      (!orderPayload.deliveryAddress || !orderPayload.deliveryPhone)
    ) {
      Alert.alert(
        "Address Incomplete",
        "Please provide a valid delivery address and phone number.",
      );
      return;
    }

    const hasOnlyUuidItems = orderPayload.items.every((item) =>
      isUuid(item.productId),
    );
    const hasUuidStore = isUuid(orderPayload.storeId);

    if (hasProducts && (!hasOnlyUuidItems || !hasUuidStore)) {
      Alert.alert(
        "Sync Required",
        "Some cart items are local/mock and not saved in backend yet. Please re-add products from live stores before checkout.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (hasProducts && selectedPayment === "cod") {
        const now = new Date();
        const deliveryEst = new Date(now);
        deliveryEst.setDate(deliveryEst.getDate() + 3);

        await placeOrder({
          id: `ORD${Date.now()}`,
          items: normalizedOrderProducts.map((p) => ({
            id: p.resolvedProductId || p.id,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            image: p.image,
            storeName: p.storeName,
            storeId: p.resolvedStoreId,
          })),
          subtotal: productsSubtotal,
          deliveryFee,
          totalAmount,
          status: "processing",
          paymentMethod: "cod",
          orderDate: now.toISOString(),
          deliveryDate: deliveryEst.toISOString(),
          deliveryAddress: orderPayload.deliveryAddress,
          deliveryPhone: orderPayload.deliveryPhone,
        });
      }

      if (hasProducts && selectedPayment === "online") {
        if (!authToken) {
          throw new Error("Please log in again to continue payment.");
        }

        const onlineOrder = await orderApi.createOnlineOrder(
          authToken,
          orderPayload,
        );

        const checkoutOptions = {
          key: onlineOrder.checkout.keyId,
          amount: String(onlineOrder.checkout.amount),
          currency: onlineOrder.checkout.currency,
          name: onlineOrder.checkout.name,
          description: onlineOrder.checkout.description,
          order_id: onlineOrder.checkout.orderId,
          prefill: {
            name: user?.name || "Sangam User",
            contact: orderPayload.deliveryPhone,
          },
          theme: {
            color: colors.brand.primary,
          },
        };

        const razorpayResult = await RazorpayCheckout.open(checkoutOptions);

        await orderApi.verifyOnlinePayment(authToken, {
          localOrderId: onlineOrder.localOrderId,
          razorpayOrderId: String(razorpayResult.razorpay_order_id),
          razorpayPaymentId: String(razorpayResult.razorpay_payment_id),
          razorpaySignature: String(razorpayResult.razorpay_signature),
        });

        try {
          await refreshOrders();
        } catch {
          // Checkout success should not be blocked by a background refresh issue.
        }
      }

      finalizePostOrderState();
    } catch (error: any) {
      const message =
        error?.description ||
        error?.message ||
        "Unable to complete checkout. Please try again.";
      Alert.alert("Checkout Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const AddressCard = ({ address }: any) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        selectedAddress === address.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedAddress(address.id)}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressNameRow}>
          <MapPin size={18} color={colors.brand.primary} />
          <Text style={styles.addressName}>{address.name}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        {selectedAddress === address.id && (
          <CheckCircle2 size={20} color={colors.status.success} />
        )}
      </View>
      <Text style={styles.addressText}>{address.address}</Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
    </TouchableOpacity>
  );

  const PaymentMethod = ({ method }: any) => {
    const Icon = method.icon;
    const isSelected = selectedPayment === method.id;

    return (
      <TouchableOpacity
        style={[styles.paymentCard, isSelected && styles.selectedCard]}
        onPress={() => setSelectedPayment(method.id as "cod" | "online")}
        disabled={!method.available}
      >
        <View style={styles.paymentLeft}>
          <View
            style={[
              styles.paymentIconContainer,
              isSelected && styles.selectedIconContainer,
            ]}
          >
            <Icon
              size={22}
              color={isSelected ? colors.brand.primary : colors.text.secondary}
            />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{method.name}</Text>
            <Text style={styles.paymentDescription}>{method.description}</Text>
          </View>
        </View>
        {isSelected && <CheckCircle2 size={20} color={colors.status.success} />}
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity
              onPress={() => router.push("/address/saved-addresses" as any)}
            >
              <Text style={styles.addNewText}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} />
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {/* Product Items */}
          {orderProducts.length > 0 && (
            <View style={styles.itemsGroup}>
              <View style={styles.groupHeader}>
                <Package size={16} color={colors.brand.primary} />
                <Text style={styles.groupTitle}>
                  Products ({orderProducts.length})
                </Text>
              </View>
              {orderProducts.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View
                      style={[styles.itemImage, styles.itemImagePlaceholder]}
                    >
                      <Package size={18} color={colors.text.secondary} />
                    </View>
                  )}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.storeName && (
                      <Text style={styles.itemStore}>{item.storeName}</Text>
                    )}
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Service Items */}
          {orderServices.length > 0 && (
            <View style={styles.itemsGroup}>
              <View style={styles.groupHeader}>
                <Wrench size={16} color={colors.brand.primary} />
                <Text style={styles.groupTitle}>
                  Services ({orderServices.length})
                </Text>
              </View>
              {orderServices.map((svc) => (
                <View key={svc.id} style={styles.orderItem}>
                  {svc.image ? (
                    <Image
                      source={{ uri: svc.image }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View
                      style={[styles.itemImage, styles.itemImagePlaceholder]}
                    >
                      <Wrench size={18} color={colors.text.secondary} />
                    </View>
                  )}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {svc.serviceName}
                    </Text>
                    <Text style={styles.itemStore}>{svc.storeName}</Text>
                    <View style={styles.serviceTimingRow}>
                      <Calendar size={12} color={colors.text.secondary} />
                      <Text style={styles.serviceTimingText}>
                        {new Date(svc.bookingDate).toLocaleDateString()}
                      </Text>
                      <Clock size={12} color={colors.text.secondary} />
                      <Text style={styles.serviceTimingText}>
                        {svc.bookingTime}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>₹{svc.price}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Price Breakdown */}
          <View style={styles.summaryCard}>
            {orderProducts.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Products ({orderProducts.length})
                </Text>
                <Text style={styles.summaryValue}>₹{productsSubtotal}</Text>
              </View>
            )}
            {orderServices.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Services ({orderServices.length})
                </Text>
                <Text style={styles.summaryValue}>₹{servicesSubtotal}</Text>
              </View>
            )}
            {orderProducts.length > 0 && (
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
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <PaymentMethod key={method.id} method={method} />
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <AlertCircle size={18} color={colors.status.info} />
          <Text style={styles.infoText}>
            {mode === "service"
              ? "Your service booking will be confirmed after payment"
              : orderProducts.length > 0
                ? "Your order will be delivered within 30-45 minutes"
                : "Booking confirmation will be sent to your phone"}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomAmount}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.placeOrderBtn,
            (!selectedPayment || isSubmitting) && styles.disabledBtn,
          ]}
          onPress={handlePlaceOrder}
          disabled={!selectedPayment || isSubmitting}
        >
          <Text style={styles.placeOrderText}>
            {isSubmitting ? "Processing..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  addressCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.ui.borderLight,
  },
  selectedCard: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "05",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  addressNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.brand.primaryLight + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  addressText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  summaryCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  freeText: {
    color: colors.status.success,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.ui.backgroundAlt,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.ui.borderLight,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  selectedIconContainer: {
    backgroundColor: colors.brand.primary + "15",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.infoLight,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.status.infoDark,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    ...shadows.medium,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  bottomAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  placeOrderBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  disabledBtn: {
    backgroundColor: colors.ui.disabled,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  // Order item styles
  itemsGroup: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ui.backgroundAlt,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemStore: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  serviceTimingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceTimingText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginRight: 6,
  },
});
