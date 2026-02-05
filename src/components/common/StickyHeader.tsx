// src/components/common/StickyHeader.tsx
import { useApp } from "@/src/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius, shadows, spacing } from "../../theme/colors";

export const StickyHeader = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { cart } = useApp();

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Logo */}
        <Image
          source={require("../../assets/Meri_dukaan_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Right Side Icons */}
        <View style={styles.iconsRow}>
          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/notification/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text.inverse}
            />
            {/* Notification Badge */}
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* Cart Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/cart/cart")}
          >
            <Ionicons
              name="cart-outline"
              size={24}
              color={colors.text.inverse}
            />
            {/* Cart Badge */}
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Menu Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color={colors.text.inverse}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Ionicons
          name="search"
          size={18}
          color={colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search items in Bazar..."
          style={styles.input}
          placeholderTextColor={colors.text.secondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.primary, // Peacock Blue
    paddingTop: 40,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.medium,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  logo: {
    width: 150,
    height: 40,
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.brand.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, height: "100%", color: colors.text.primary },
});
