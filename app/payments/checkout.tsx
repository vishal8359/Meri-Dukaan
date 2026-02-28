// app/checkout.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    MapPin,
    Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useApp();

  const [selectedPayment, setSelectedPayment] = useState<
    "cod" | "online" | null
  >(null);
  const [selectedAddress, setSelectedAddress] = useState("default");

  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const totalAmount = cartTotal + deliveryFee;

  const addresses = [
    {
      id: "default",
      name: "Home",
      address: "Rajendra Nagar, Patna - 800016",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    {
      id: "office",
      name: "Office",
      address: "Boring Road, Patna - 800001",
      phone: "+91 98765 43210",
      isDefault: false,
    },
  ];

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

  const handlePlaceOrder = () => {
    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (selectedPayment === "cod") {
      Alert.alert(
        "Order Placed!",
        `Your order of ₹${totalAmount} has been placed successfully. Pay on delivery.`,
        [
          {
            text: "View Orders",
            onPress: () => {
              clearCart();
              router.replace("/myorders/orders");
            },
          },
        ],
      );
    } else {
      // For online payment, you would integrate payment gateway here
      Alert.alert("Payment Gateway", "Redirecting to payment gateway...", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay Now",
          onPress: () => {
            // Simulate payment success
            Alert.alert(
              "Payment Successful!",
              `Your payment of ₹${totalAmount} has been processed.`,
              [
                {
                  text: "Done",
                  onPress: () => {
                    clearCart();
                    router.replace("/myorders/orders");
                  },
                },
              ],
            );
          },
        },
      ]);
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
            <TouchableOpacity>
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
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
              <Text style={styles.summaryValue}>₹{cartTotal}</Text>
            </View>
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
            Your order will be delivered within 30-45 minutes
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
          style={[styles.placeOrderBtn, !selectedPayment && styles.disabledBtn]}
          onPress={handlePlaceOrder}
          disabled={!selectedPayment}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
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
});
