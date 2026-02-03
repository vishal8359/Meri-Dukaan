// src/features/dashboard/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../../../context/AppContext";
import { colors, radius, shadows, spacing } from "../../../theme/colors";

const { width } = Dimensions.get("window");

// --- Mock Data for Banners ---
const BANNERS = [
  {
    id: "1",
    image: require("../../../assets/banner1.png"),
    storeId: "1", // Links to store ID from context
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600",
    storeId: "2",
  },
];

const TRENDING_CATEGORIES = [
  { id: "t1", title: "Vegetables", icon: "leaf", color: "#4ADE80" },
  { id: "t2", title: "Furniture", icon: "bed", color: "#F59E0B" },
  { id: "t3", title: "Dairy", icon: "water", color: "#3B82F6" },
  { id: "t4", title: "Electronics", icon: "flashlight", color: "#6366F1" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { getFeaturedStores } = useApp();

  // Get top 5 featured stores from context (sorted by rating)
  const featuredStores = getFeaturedStores(5);

  // Navigate to individual store detail page
  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. TOP BANNERS (PROMOTIONS) */}
      <View style={styles.bannerSection}>
        <FlatList
          data={BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigateToStore(item.storeId)}
              style={styles.bannerWrapper}
            >
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : item.image
                }
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 2. FEATURED STORES (NEARBY) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shops Near You</Text>
            <Text style={styles.sectionSubtitle}>
              Discover local gems in your area
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(drawer)/(tabs)/bazar")}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredStores}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.storeCard}
              onPress={() => navigateToStore(item.id)}
            >
              <View>
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.storeImage}
                />
                {/* Distance Overlay */}
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={10} color="#FFF" />
                  <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <Ionicons
                      name="people-outline"
                      size={12}
                      color={colors.text.secondary}
                    />
                    <Text style={styles.footerLabel}>{item.followers}</Text>
                  </View>
                  <View style={styles.footerInfo}>
                    <Ionicons name="star" size={12} color="#E9C46A" />
                    <Text
                      style={[
                        styles.footerLabel,
                        { fontWeight: "bold", color: colors.text.primary },
                      ]}
                    >
                      {item.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 3. TRENDING CATEGORIES */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.md }]}>
          Trending Now
        </Text>
        <View style={styles.trendingGrid}>
          {TRENDING_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View
                style={[styles.iconBox, { backgroundColor: cat.color + "15" }]}
              >
                <Ionicons name={cat.icon as any} size={26} color={cat.color} />
              </View>
              <Text style={styles.categoryText}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bannerSection: {
    marginTop: spacing.md,
  },
  bannerWrapper: {
    width: width,
    paddingHorizontal: spacing.md,
  },
  bannerImage: {
    width: "100%",
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.ui.border,
  },
  sectionContainer: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#143e47", // Peacock Blue
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  viewAllText: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  horizontalListPadding: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xl,
  },
  storeCard: {
    width: 170,
    marginRight: spacing.md,
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    marginBottom: 8,
  },
  storeImage: {
    width: "100%",
    height: 100,
  },
  distanceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(20, 62, 71, 0.9)", // Primary with opacity
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    gap: 3,
  },
  distanceText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardContent: {
    padding: spacing.sm,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#143e47",
  },
  typeBadge: {
    backgroundColor: "#B7DEE540",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginVertical: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#143e47",
    textTransform: "uppercase",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: 40,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
  },
});
