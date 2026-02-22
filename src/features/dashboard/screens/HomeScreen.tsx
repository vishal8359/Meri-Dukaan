// src/features/dashboard/screens/HomeScreen.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Mock Data
const QUICK_PICKS = [
  { id: "1", name: "Vegetables", icon: "🥬", color: "#4ade80" },
  { id: "2", name: "Fruits", icon: "🍎", color: "#fb923c" },
  { id: "3", name: "Dairy", icon: "🥛", color: "#60a5fa" },
  { id: "4", name: "Snacks", icon: "🍿", color: "#fbbf24" },
  { id: "5", name: "Beverages", icon: "🥤", color: "#f472b6" },
  { id: "6", name: "Bakery", icon: "🍞", color: "#a78bfa" },
  { id: "7", name: "Meat", icon: "🍗", color: "#f87171" },
  { id: "8", name: "Household", icon: "🧼", color: "#34d399" },
  { id: "9", name: "Electronics", icon: "📱", color: "#3b82f6" },
  { id: "10", name: "Gifts", icon: "🎁", color: "#ec4899" },
  { id: "11", name: "Stationery", icon: "📝", color: "#f59e0b" },
  { id: "12", name: "Garments", icon: "👕", color: "#8b5cf6" },
  { id: "13", name: "Salon", icon: "💇", color: "#f97316" },
  { id: "14", name: "Beauty", icon: "💄", color: "#db2777" },
  { id: "15", name: "Books", icon: "📚", color: "#06b6d4" },
  { id: "16", name: "Toys", icon: "🧸", color: "#10b981" },
];

const FLASH_DEALS = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    store: "Sharma Kirana",
    price: 30,
    originalPrice: 40,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=300",
    timeLeft: "2h 30m",
  },
  {
    id: "2",
    name: "Green Chilies",
    store: "Organic Farms",
    price: 45,
    originalPrice: 60,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1583846499862-bf1c00b4c7ed?q=80&w=300",
    timeLeft: "1h 15m",
  },
  {
    id: "3",
    name: "Fresh Milk",
    store: "Daily Dairy",
    price: 50,
    originalPrice: 60,
    discount: 17,
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=300",
    timeLeft: "45m",
  },
];

const TOP_OFFERS = [
  {
    id: "1",
    title: "Weekend Special",
    subtitle: "Up to 50% OFF",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600",
    color: "#fef3c7",
  },
  {
    id: "2",
    title: "Fresh Arrivals",
    subtitle: "New in stock today",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=600",
    color: "#dbeafe",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { getFeaturedStores } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;

  const featuredStores = getFeaturedStores(6);

  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}` as any);
  };

  const navigateToProduct = (productId: string) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: productId },
    } as any);
  };

  const QuickPickItem = ({ item }: { item: (typeof QUICK_PICKS)[0] }) => (
    <TouchableOpacity style={styles.quickPickItem}>
      <View
        style={[styles.quickPickIcon, { backgroundColor: item.color + "20" }]}
      >
        <Text style={styles.quickPickEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.quickPickName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const FlashDealCard = ({ item }: { item: (typeof FLASH_DEALS)[0] }) => (
    <TouchableOpacity
      style={styles.flashDealCard}
      onPress={() => navigateToProduct(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.flashDealImage} />

      {/* Discount Badge */}
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}% OFF</Text>
      </View>

      {/* Timer Badge */}
      <View style={styles.timerBadge}>
        <Clock size={10} color="#fff" />
        <Text style={styles.timerText}>{item.timeLeft}</Text>
      </View>

      <View style={styles.flashDealInfo}>
        <Text style={styles.flashDealName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.flashDealStore} numberOfLines={1}>
          {item.store}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.flashPrice}>₹{item.price}</Text>
          <Text style={styles.flashOriginalPrice}>₹{item.originalPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const OfferBanner = ({ item }: { item: (typeof TOP_OFFERS)[0] }) => (
    <TouchableOpacity
      style={[styles.offerBanner, { backgroundColor: item.color }]}
    >
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
        <View style={styles.shopNowBtn}>
          <Text style={styles.shopNowText}>Shop Now</Text>
          <ChevronRight size={14} color={colors.brand.primary} />
        </View>
      </View>
      <Image source={{ uri: item.image }} style={styles.offerImage} />
    </TouchableOpacity>
  );

  const StoreCard = ({ store }: any) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => navigateToStore(store.id)}
    >
      <Image
        source={
          typeof store.image === "string" ? { uri: store.image } : store.image
        }
        style={styles.storeCardImage}
      />

      {/* Distance Badge */}
      <View style={styles.storeDistanceBadge}>
        <MapPin size={10} color="#fff" />
        <Text style={styles.storeDistance}>{store.distance}</Text>
      </View>

      <View style={styles.storeCardContent}>
        <Text style={styles.storeCardName} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={styles.storeCardType} numberOfLines={1}>
          {store.type}
        </Text>

        <View style={styles.storeCardFooter}>
          <View style={styles.ratingBox}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>{store.rating}</Text>
          </View>
          <View style={styles.followersBox}>
            <Ionicons name="people" size={12} color={colors.text.secondary} />
            <Text style={styles.followersText}>{store.followers}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* Delivery Address Bar */}
        <View style={styles.addressBar}>
          <View style={styles.addressLeft}>
            <MapPin size={18} color={colors.brand.primary} />
            <View>
              <Text style={styles.deliveryLabel}>Deliver to</Text>
              <Text style={styles.addressText}>Rajendra Nagar, Patna</Text>
            </View>
          </View>
          <TouchableOpacity>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Picks */}
        <View style={styles.section}>
          <FlatList
            horizontal
            data={QUICK_PICKS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <QuickPickItem item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPicksList}
          />
        </View>

        {/* Top Offers */}
        <View style={styles.section}>
          <FlatList
            horizontal
            data={TOP_OFFERS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OfferBanner item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersList}
            pagingEnabled
          />
        </View>

        {/* Flash Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Zap size={20} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.sectionTitle}>Flash Deals</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={FLASH_DEALS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FlashDealCard item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashDealsList}
          />
        </View>

        {/* Trending Stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={20} color={colors.brand.primary} />
              <Text style={styles.sectionTitle}>Trending Stores</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/bazar")}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={featuredStores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <StoreCard store={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesList}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  addressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#fef3c7",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  addressLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  addressText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  // Quick Picks
  quickPicksList: {
    paddingHorizontal: spacing.sm,
  },
  quickPickItem: {
    alignItems: "center",
    marginHorizontal: spacing.xs,
    width: 68,
  },
  quickPickIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  quickPickEmoji: {
    fontSize: 30,
  },
  quickPickName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  // Offers
  offersList: {
    paddingHorizontal: spacing.md,
  },
  offerBanner: {
    width: width - 32,
    height: 140,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    flexDirection: "row",
    overflow: "hidden",
    ...shadows.medium,
  },
  offerContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  shopNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 4,
  },
  shopNowText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  offerImage: {
    width: 120,
    height: "100%",
  },
  // Flash Deals
  flashDealsList: {
    paddingHorizontal: spacing.md,
  },
  flashDealCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    marginRight: spacing.md,
    ...shadows.medium,
    overflow: "hidden",
  },
  flashDealImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f1f5f9",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.status.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },
  timerBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.status.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  timerText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
  },
  flashDealInfo: {
    padding: spacing.sm,
  },
  flashDealName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  flashDealStore: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flashPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  flashOriginalPrice: {
    fontSize: 12,
    color: colors.text.secondary,
    textDecorationLine: "line-through",
  },
  // Stores
  storesList: {
    paddingHorizontal: spacing.md,
  },
  storeCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    marginRight: spacing.md,
    ...shadows.medium,
    overflow: "hidden",
  },
  storeCardImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f1f5f9",
  },
  storeDistanceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  storeDistance: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  storeCardContent: {
    padding: spacing.sm,
  },
  storeCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  storeCardType: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  storeCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
  },
  followersBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  followersText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});
