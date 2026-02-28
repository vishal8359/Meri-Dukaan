// src/features/dukaan/components/StoreCardVertical.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors, radius, shadows, spacing } from "../../../theme/colors";

// Get screen width to calculate exact card width
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - spacing.md * 3) / 2; // Subtracting margins and gaps

interface Store {
  id: string;
  name: string;
  type: string;
  followers: string;
  rating: number;
  distance: string;
  image: any;
}

interface StoreCardGridProps {
  store: Store;
  onPress?: () => void;
}

export const StoreCardGrid = ({ store, onPress }: StoreCardGridProps) => {
  const imageSource =
    typeof store.image === "string" ? { uri: store.image } : store.image;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.card}
      onPress={onPress}
    >
      {/* Top: Store Image & Rating Overlay */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={colors.text.primary} />
          <Text style={styles.ratingText}>{store.rating}</Text>
        </View>
      </View>

      {/* Bottom: Store Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>

        <Text style={styles.typeText} numberOfLines={1}>
          {store.type}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.distanceBox}>
            <Ionicons
              name="location-sharp"
              size={12}
              color={colors.brand.primary}
            />
            <Text style={styles.distanceText}>{store.distance}</Text>
          </View>

          {/* A smaller, cleaner visit button for grid view */}
          <View style={styles.miniBtn}>
            <Ionicons
              name="arrow-forward"
              size={12}
              color={colors.text.inverse}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    width: CARD_WIDTH,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: colors.ui.surfaceHover,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.star,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.text.primary,
  },
  infoContainer: {
    padding: spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.primary,
    marginBottom: 2,
  },
  typeText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  distanceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: "700",
  },
  miniBtn: {
    backgroundColor: colors.brand.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
});
