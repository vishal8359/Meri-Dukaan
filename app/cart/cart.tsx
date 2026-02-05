// app/cart.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react-native";
import React from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { cart, addToCart, updateCartQuantity, removeFromCart, cartTotal } =
    useApp();

  const updateQuantity = (item: any, increment: boolean) => {
    if (increment) {
      addToCart(item);
    } else {
      updateCartQuantity(item.id, item.quantity - 1);
    }
  };

  const CartItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.cartItem}>
        <View style={styles.itemInfo}>
          <View style={styles.itemIconContainer}>
            <ShoppingBag size={20} color={colors.brand.primary} />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
        </View>

        <View style={styles.itemActions}>
          {/* Quantity Controls */}
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

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFromCart(item.id)}
          >
            <Trash2 size={18} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>
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
        <View style={styles.headerTitleContainer}>
          <ShoppingBag size={20} color={colors.brand.primary} />
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {cart.length === 0 ? (
        // Empty Cart State
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag size={80} color="#cbd5e1" strokeWidth={1.5} />
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
        // Cart with Items
        <View style={styles.contentContainer}>
          {/* Cart Items List */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CartItem item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.itemCountText}>
                  {cart.length} {cart.length === 1 ? "item" : "items"} in cart
                </Text>
              </View>
            }
          />

          {/* Bottom Summary Card */}
          <View style={styles.summaryCard}>
            {/* Price Breakdown */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{cartTotal}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {cartTotal > 500 ? (
                  <Text style={styles.freeText}>FREE</Text>
                ) : (
                  "₹40"
                )}
              </Text>
            </View>

            {cartTotal > 500 && (
              <View style={styles.savingsRow}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.savingsText}>
                  You saved ₹40 on delivery!
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{cartTotal + (cartTotal > 500 ? 0 : 40)}
              </Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ArrowLeft
                size={18}
                color="#FFF"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>

            {/* Continue Shopping Link */}
            <TouchableOpacity
              style={styles.continueShoppingBtn}
              onPress={() => router.push("/(drawer)/(tabs)/bazar")}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFF",
    ...shadows.small,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  cartItem: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: radius.md,
    padding: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: radius.sm,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    minWidth: 40,
    textAlign: "center",
  },
  deleteBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
  },
  summaryCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  continueShoppingBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  continueShoppingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});
