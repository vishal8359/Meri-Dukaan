// app/dukaan/following.tsx

import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - spacing.md * 2;

export default function FollowingStoresScreen() {
  const router = useRouter();
  const { getFollowedStores, toggleFollowStore } = useApp();
  const followedStores = getFollowedStores();

  const navigateToStore = useCallback(
    (storeId: string) => {
      router.push(`/dukaan/${storeId}`);
    },
    [router],
  );

  const handleUnfollow = useCallback(
    (storeId: string) => {
      toggleFollowStore(storeId);
    },
    [toggleFollowStore],
  );

  const renderStoreCard = useCallback(
    ({ item }: { item: any }) => {
      const imageSource =
        typeof item.image === "string" ? { uri: item.image } : item.image;

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigateToStore(item.id)}
        >
          <Image
            source={imageSource}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            {/* Store Name + Type */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.type}</Text>
              </View>
            </View>

            {/* Meta Row */}
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={13} color={colors.brand.star} />
                <Text style={styles.metaValue}>{item.rating}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-sharp"
                  size={13}
                  color={colors.brand.primaryLight}
                />
                <Text style={styles.metaValue}>{item.distance}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Ionicons
                  name="people-outline"
                  size={13}
                  color={colors.text.tertiary}
                />
                <Text style={styles.metaValueLight}>{item.followers}</Text>
              </View>
            </View>

            {/* Unfollow Button */}
            <TouchableOpacity
              style={styles.unfollowBtn}
              onPress={() => handleUnfollow(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={colors.brand.primaryLight}
              />
              <Text style={styles.unfollowText}>Following</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [navigateToStore, handleUnfollow],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={colors.brand.primaryLight}
          />
          <Text style={styles.headerTitle}>Following Stores</Text>
        </View>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{followedStores.length}</Text>
        </View>
      </View>

      {/* Store List */}
      <FlatList
        data={followedStores}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="shield-outline"
                size={48}
                color={colors.ui.disabled}
              />
            </View>
            <Text style={styles.emptyTitle}>No stores followed yet</Text>
            <Text style={styles.emptySubtitle}>
              Follow stores to stay updated with their latest products and
              offers
            </Text>
            <TouchableOpacity
              style={styles.exploreCta}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons
                name="compass-outline"
                size={18}
                color={colors.text.inverse}
              />
              <Text style={styles.exploreCtaText}>Explore Stores</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 56,
    paddingBottom: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    ...shadows.small,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginLeft: -38, // Center compensating for back button
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
  },
  headerCount: {
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    minWidth: 30,
    alignItems: "center",
  },
  headerCountText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.inverse,
  },

  // List
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
    ...shadows.small,
  },
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: colors.ui.surfaceHover,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    backgroundColor: colors.tint.blueLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand.primaryLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Meta
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  metaValueLight: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.tertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.ui.disabled,
    marginHorizontal: 10,
  },

  // Unfollow
  unfollowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.brand.primaryLight,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.tint.blueLight,
  },
  unfollowText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primaryLight,
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  exploreCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
    ...shadows.small,
  },
  exploreCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
