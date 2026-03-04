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
const CARD_WIDTH = (width - spacing.md * 3) / 2;

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

// React.memo prevents unnecessary re-renders when parent re-renders
export const StoreCardGrid = React.memo(
  ({ store, onPress }: StoreCardGridProps) => {
    const imageSource =
      typeof store.image === "string" ? { uri: store.image } : store.image;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={onPress}
      >
        {/* Image with gradient-like overlays */}
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />

          {/* Rating badge - top right */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#FFF" />
            <Text style={styles.ratingText}>{store.rating}</Text>
          </View>

          {/* Category tag - bottom left over image */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText} numberOfLines={1}>
              {store.type}
            </Text>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {store.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.distanceBox}>
              <Ionicons
                name="location-sharp"
                size={11}
                color={colors.brand.primaryLight}
              />
              <Text style={styles.distanceText}>{store.distance}</Text>
            </View>

            <View style={styles.dot} />

            <View style={styles.followersBox}>
              <Ionicons
                name="people-outline"
                size={11}
                color={colors.text.tertiary}
              />
              <Text style={styles.followersText}>{store.followers}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    width: CARD_WIDTH,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 130,
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
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
  },
  categoryTag: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: radius.sm,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.inverse,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    color: colors.brand.primaryLight,
    fontWeight: "600",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.ui.disabled,
    marginHorizontal: 6,
  },
  followersBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  followersText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
});
