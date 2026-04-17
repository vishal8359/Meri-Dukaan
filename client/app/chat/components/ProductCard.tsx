import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { colors, radius, shadows } from "../../../src/theme/colors";

interface ProductCardProps {
  data: {
    id: string;
    name: string;
    category?: string;
    realPrice?: number;
    offerPrice?: number;
    stock?: number;
    available?: boolean;
    storeName?: string;
    image?: string | null;
    description?: string;
  };
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
}

export default function ProductCard({
  data,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const price = data.offerPrice || data.realPrice || 0;
  const hasDiscount = data.realPrice && data.offerPrice && data.realPrice > data.offerPrice;
  const discount = hasDiscount
    ? Math.round(((data.realPrice! - data.offerPrice!) / data.realPrice!) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onViewDetails?.(data.id)}
    >
      {data.image && (
        <Image
          source={{ uri: data.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {data.name}
        </Text>

        {data.storeName && (
          <Text style={styles.store}>🏪 {data.storeName}</Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {hasDiscount && (
            <>
              <Text style={styles.mrp}>₹{data.realPrice}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% off</Text>
              </View>
            </>
          )}
        </View>

        {data.stock !== undefined && data.stock < 5 && data.stock > 0 && (
          <Text style={styles.lowStock}>Only {data.stock} left!</Text>
        )}

        {data.available !== false ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddToCart?.(data.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.addBtn, styles.outOfStock]}>
            <Text style={[styles.addBtnText, { color: colors.text.tertiary }]}>
              Out of Stock
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    marginHorizontal: 12,
    marginVertical: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: colors.ui.backgroundAlt,
  },
  body: {
    padding: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  store: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  mrp: {
    fontSize: 13,
    color: colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  lowStock: {
    fontSize: 12,
    color: colors.status.warning,
    fontWeight: "500",
    marginBottom: 6,
  },
  addBtn: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  outOfStock: {
    backgroundColor: colors.ui.backgroundAlt,
  },
});
