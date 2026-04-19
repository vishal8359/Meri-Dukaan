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
      {data.image ? (
        <Image
          source={{ uri: data.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 20 }}>📦</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {data.name}
        </Text>

        {data.storeName && (
          <Text style={styles.store} numberOfLines={1}>🏪 {data.storeName}</Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {hasDiscount && (
            <>
              <Text style={styles.mrp}>₹{data.realPrice}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}%</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {data.available !== false ? (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAddToCart?.(data.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.addBtn, styles.outOfStock]}>
          <Text style={[styles.addBtnText, { color: colors.text.tertiary }]}>✕</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.sm,
    marginHorizontal: 12,
    marginVertical: 3,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.ui.backgroundAlt,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 1,
  },
  store: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  mrp: {
    fontSize: 10,
    color: colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  discountText: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  outOfStock: {
    backgroundColor: colors.ui.backgroundAlt,
  },
});
