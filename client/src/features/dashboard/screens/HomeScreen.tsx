// src/features/dashboard/screens/HomeScreen.tsx
import {
  PRODUCT_CATEGORIES,
  SERVICE_CATEGORY_IDS,
} from "@/src/constants/catalog";
import * as storeApi from "@/src/api/stores";
import { useApp } from "@/src/context/AppContext";
import { colors, radius, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Scissors,
    Star,
    TrendingUp,
    Zap,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
  ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const QUICK_PICKS = PRODUCT_CATEGORIES.filter((c) => c.id !== "all");

type DashboardProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  storeId: string;
  storeName: string;
  distance: string;
  isSubscription: boolean;
  category: string;
};

type DashboardService = {
  id: string;
  name: string;
  image: string;
  price: number;
  discount?: number;
  rating: number;
  storeId: string;
  storeName: string;
  distance: string;
  duration?: string;
};

const TOP_OFFERS = [
  {
    id: "1",
    title: "Weekend Special",
    subtitle: "Up to 50% OFF",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600",
    gradient: [colors.status.warningLight, colors.tint.goldLight] as [
      string,
      string,
    ],
    linkType: "product" as const,
    linkId: "p1",
  },
  {
    id: "2",
    title: "Fresh Arrivals",
    subtitle: "New in stock today",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=600",
    gradient: [colors.status.infoLight, colors.status.infoBorder] as [
      string,
      string,
    ],
    linkType: "store" as const,
    linkId: "1",
  },
  {
    id: "3",
    title: "Mega Sale",
    subtitle: "Flat 200 OFF",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600",
    gradient: [colors.tint.pinkLight, colors.tint.pinkLight] as [
      string,
      string,
    ],
    linkType: "category" as const,
    linkId: "grocery",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { cart, allStores, getSelectedAddress } = useApp();
  const selectedAddress = getSelectedAddress();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [flashDealProducts, setFlashDealProducts] = React.useState<
    DashboardProduct[]
  >([]);
  const [flashDealServices, setFlashDealServices] = React.useState<
    DashboardService[]
  >([]);
  const [isDealsLoading, setIsDealsLoading] = React.useState(true);

  const bannerScrollRef = useRef<FlatList>(null);
  const bannerIndexRef = useRef(0);
  const trendingScrollRef = useRef<FlatList>(null);
  const trendingIndexRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        setIsDealsLoading(true);
        const storesRes = await storeApi.getStores({ page: 1, limit: 12 });
        const stores = Array.isArray(storesRes?.stores)
          ? (storesRes.stores as any[])
          : [];

        const storeSlice = stores.slice(0, 8);

        const [productBuckets, serviceBuckets] = await Promise.all([
          Promise.all(
            storeSlice.map(async (store) => {
              const res = await storeApi.getStoreProducts(String(store.id));
              const products = Array.isArray(res?.products)
                ? (res.products as any[])
                : [];

              return products.map((p) => {
                const offer = Number(p?.offer_price ?? 0);
                const real = Number(p?.real_price ?? 0);
                const discount = real > offer && real > 0
                  ? Math.round(((real - offer) / real) * 100)
                  : 0;

                return {
                  id: String(p?.id ?? ""),
                  name: String(p?.name ?? "Product"),
                  image: Array.isArray(p?.images)
                    ? p.images[0]?.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400"
                    : "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400",
                  price: offer || real,
                  originalPrice: real > offer ? real : undefined,
                  discount: discount > 0 ? discount : undefined,
                  rating: Number(p?.rating ?? 0),
                  storeId: String(store?.id ?? ""),
                  storeName: String(store?.store_name ?? "Store"),
                  distance: String(store?.distance ?? "0 km"),
                  isSubscription: true,
                  category: String(p?.type ?? "general").toLowerCase(),
                } as DashboardProduct;
              });
            }),
          ),
          Promise.all(
            storeSlice.map(async (store) => {
              const res = await storeApi.getStoreServices(String(store.id));
              const services = Array.isArray(res?.services)
                ? (res.services as any[])
                : [];

              return services.map((s) => ({
                id: String(s?.id ?? ""),
                name: String(s?.name ?? "Service"),
                image:
                  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=400",
                price: 0,
                discount: undefined,
                rating: Number(s?.rating ?? 0),
                storeId: String(store?.id ?? ""),
                storeName: String(store?.store_name ?? "Store"),
                distance: String(store?.distance ?? "0 km"),
                duration: String(s?.timings ?? ""),
              })) as DashboardService[];
            }),
          ),
        ]);

        const products = productBuckets
          .flat()
          .filter((p) => !SERVICE_CATEGORY_IDS.includes(p.category))
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 10);

        const services = serviceBuckets
          .flat()
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10);

        setFlashDealProducts(products);
        setFlashDealServices(services);
      } catch {
        setFlashDealProducts([]);
        setFlashDealServices([]);
      } finally {
        setIsDealsLoading(false);
      }
    })();
  }, []);

  const trendingStores = useMemo(() => {
    return [...allStores]
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        const aF = parseFloat(a.followers.replace("k", "000"));
        const bF = parseFloat(b.followers.replace("k", "000"));
        return bF - aF;
      })
      .slice(0, 8);
  }, [allStores]);

  useEffect(() => {
    if (TOP_OFFERS.length <= 1) return;
    const interval = setInterval(() => {
      bannerIndexRef.current = (bannerIndexRef.current + 1) % TOP_OFFERS.length;
      bannerScrollRef.current?.scrollToIndex({
        index: bannerIndexRef.current,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (trendingStores.length <= 1) return;
    const interval = setInterval(() => {
      trendingIndexRef.current =
        (trendingIndexRef.current + 1) % trendingStores.length;
      trendingScrollRef.current?.scrollToIndex({
        index: trendingIndexRef.current,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [trendingStores.length]);

  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}` as any);
  };

  const navigateToCategory = (categoryId: string) => {
    router.push({
      pathname: "/(drawer)/(tabs)/mybusz",
      params: { category: categoryId },
    } as any);
  };

  const navigateToProduct = (productId: string) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: productId },
    } as any);
  };

  const navigateToService = (serviceId: string) => {
    router.push({
      pathname: "/service/[id]",
      params: { id: serviceId },
    } as any);
  };

  const QuickPickItem = ({ item }: { item: (typeof QUICK_PICKS)[0] }) => (
    <TouchableOpacity
      style={styles.quickPickItem}
      onPress={() => navigateToCategory(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.quickPickIcon, { backgroundColor: item.color + "20" }]}
      >
        <Text style={styles.quickPickEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.quickPickName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const FlashDealCard = ({ item }: { item: DashboardProduct }) => (
    <TouchableOpacity
      style={styles.flashDealCard}
      onPress={() => navigateToProduct(item.id)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.flashDealImage} />
      {item.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
        </View>
      ) : null}
      <View style={styles.subscriptionBadge}>
        <Zap size={8} color={colors.brand.star} />
        <Text style={styles.subscriptionText}>Subscribe</Text>
      </View>
      <View style={styles.flashDealInfo}>
        <Text style={styles.flashDealName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.flashDealStore} numberOfLines={1}>
          {item.storeName} {"\u2022"} {item.distance}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.flashPrice}>
            {"\u20B9"}
            {item.price}
          </Text>
          {item.originalPrice ? (
            <Text style={styles.flashOriginalPrice}>
              {"\u20B9"}
              {item.originalPrice}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const FlashServiceCard = ({ item }: { item: DashboardService }) => (
    <TouchableOpacity
      style={styles.flashDealCard}
      onPress={() => navigateToService(item.id)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.flashDealImage} />
      {item.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
        </View>
      ) : null}
      <View style={styles.serviceBadge}>
        <Scissors size={8} color={colors.brand.primary} />
        <Text style={styles.serviceTagText}>Service</Text>
      </View>
      <View style={styles.flashDealInfo}>
        <Text style={styles.flashDealName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.flashDealStore} numberOfLines={1}>
          {item.storeName} {"\u2022"} {item.distance}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.flashPrice}>
            {"\u20B9"}
            {item.price}
          </Text>
          {item.originalPrice ? (
            <Text style={styles.flashOriginalPrice}>
              {"\u20B9"}
              {item.originalPrice}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleBannerPress = (item: (typeof TOP_OFFERS)[0]) => {
    switch (item.linkType) {
      case "product":
        navigateToProduct(item.linkId);
        break;
      case "store":
        navigateToStore(item.linkId);
        break;
      case "category":
        navigateToCategory(item.linkId);
        break;
    }
  };

  const OfferBanner = ({ item }: { item: (typeof TOP_OFFERS)[0] }) => (
    <TouchableOpacity
      style={styles.offerBanner}
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item)}
    >
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.offerGradient}
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
      </LinearGradient>
    </TouchableOpacity>
  );

  const TrendingStoreCard = ({ store }: { store: any }) => (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={() => navigateToStore(store.id)}
      activeOpacity={0.85}
    >
      <Image
        source={
          typeof store.image === "string" ? { uri: store.image } : store.image
        }
        style={styles.trendingImage}
      />
      <View style={styles.ratingCrown}>
        <Star size={10} color={colors.brand.star} fill={colors.brand.star} />
        <Text style={styles.ratingCrownText}>{store.rating}</Text>
      </View>
      <View style={styles.storeDistanceBadge}>
        <MapPin size={9} color="#fff" />
        <Text style={styles.storeDistance}>{store.distance}</Text>
      </View>
      <View style={styles.trendingBadge}>
        <TrendingUp size={10} color="#fff" />
      </View>
      <View style={styles.trendingContent}>
        <Text style={styles.trendingName} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={styles.trendingType} numberOfLines={1}>
          {store.type}
        </Text>
        <View style={styles.trendingFooter}>
          <View style={styles.followersBox}>
            <Ionicons name="people" size={11} color={colors.text.secondary} />
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
        contentContainerStyle={{ paddingTop: spacing.sm }}
      >
        {/* Deliver To */}
        <TouchableOpacity
          style={styles.addressBar}
          activeOpacity={0.7}
          onPress={() => router.push("/address/saved-addresses" as any)}
        >
          <View style={styles.addressPin}>
            <MapPin size={16} color={colors.brand.primary} />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.deliverLabel}>Deliver to</Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText} numberOfLines={1}>
                {selectedAddress
                  ? `${selectedAddress.address}, ${selectedAddress.city}`
                  : "Select an address"}
              </Text>
              <ChevronDown size={14} color={colors.text.secondary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Picks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>
              What are you looking for?
            </Text>
          </View>
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
            ref={bannerScrollRef}
            horizontal
            data={TOP_OFFERS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OfferBanner item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersList}
            pagingEnabled={false}
            snapToInterval={width - 40 + spacing.md}
            snapToAlignment="start"
            decelerationRate="fast"
            windowSize={2}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            getItemLayout={(_, index) => ({
              length: width - 40 + spacing.md,
              offset: (width - 40 + spacing.md) * index,
              index,
            })}
            onScrollToIndexFailed={() => {}}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / (width - 40 + spacing.md),
              );
              bannerIndexRef.current = idx;
            }}
          />
        </View>

        {/* Flash Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.flashIconContainer}>
                <Zap
                  size={16}
                  color={colors.brand.star}
                  fill={colors.brand.star}
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Flash Deals</Text>
                <Text style={styles.sectionSubLabel}>
                  From subscription stores
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigateToCategory("all")}>
              <Text style={styles.viewAllText}>View All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={flashDealProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FlashDealCard item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashDealsList}
            snapToInterval={156}
            decelerationRate="fast"
            windowSize={3}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
          />
        </View>

        {/* Flash Services */}
        {flashDealServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.serviceIconContainer}>
                  <Scissors size={16} color={colors.brand.primary} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Flash Services</Text>
                  <Text style={styles.sectionSubLabel}>
                    Salon, repair & more
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigateToCategory("salon")}>
                <Text style={styles.viewAllText}>View All </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={flashDealServices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FlashServiceCard item={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashDealsList}
              snapToInterval={156}
              decelerationRate="fast"
              windowSize={3}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
            />
          </View>
        )}

        {/* Trending Stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.trendingIconContainer}>
                <TrendingUp size={16} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Trending Stores</Text>
                <Text style={styles.sectionSubLabel}>
                  Highest rated & most popular
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/bazar" as any)}
            >
              <Text style={styles.viewAllText}>View All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={trendingScrollRef}
            horizontal
            data={trendingStores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TrendingStoreCard store={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesList}
            snapToInterval={186}
            decelerationRate="fast"
            windowSize={3}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            getItemLayout={(_, index) => ({
              length: 186,
              offset: 186 * index,
              index,
            })}
            onScrollToIndexFailed={() => {}}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / 186);
              trendingIndexRef.current = idx;
            }}
          />
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.ui.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 4,
    borderRadius: radius.md,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  addressPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand.primary + "12",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addressContent: { flex: 1 },
  deliverLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressText: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  section: { marginTop: spacing.lg },
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
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text.primary },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  sectionSubLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.secondary,
    marginTop: 1,
  },
  viewAllText: { fontSize: 13, fontWeight: "700", color: colors.brand.primary },
  flashIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.status.warningLight,
    justifyContent: "center",
    alignItems: "center",
  },
  trendingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  quickPicksList: { paddingHorizontal: spacing.sm },
  quickPickItem: {
    alignItems: "center",
    marginHorizontal: spacing.xs + 2,
    width: 68,
  },
  quickPickIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickPickEmoji: { fontSize: 28 },
  quickPickName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  offersList: { paddingHorizontal: spacing.md },
  offerBanner: {
    width: width - 40,
    height: 150,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    overflow: "hidden",
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  offerGradient: { flex: 1, flexDirection: "row" },
  offerContent: { flex: 1, padding: spacing.md, justifyContent: "center" },
  offerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text.primary,
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 14,
    color: colors.text.caption,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  shopNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.ui.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    gap: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shopNowText: { fontSize: 12, fontWeight: "800", color: colors.brand.primary },
  offerImage: {
    width: 130,
    height: "100%",
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  flashDealsList: { paddingHorizontal: spacing.md },
  flashDealCard: {
    width: 148,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    overflow: "hidden",
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  flashDealImage: {
    width: "100%",
    height: 120,
    backgroundColor: colors.ui.backgroundAlt,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.tint.green,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: { fontSize: 10, fontWeight: "800", color: colors.text.inverse },
  subscriptionBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  subscriptionText: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.brand.star,
  },
  serviceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  serviceTagText: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  flashDealInfo: { padding: spacing.sm },
  flashDealName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  flashDealStore: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flashPrice: { fontSize: 16, fontWeight: "800", color: colors.brand.primary },
  flashOriginalPrice: {
    fontSize: 12,
    color: colors.text.secondary,
    textDecorationLine: "line-through",
  },
  storesList: { paddingHorizontal: spacing.md },
  trendingCard: {
    width: 170,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    overflow: "hidden",
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  trendingImage: {
    width: "100%",
    height: 110,
    backgroundColor: colors.ui.backgroundAlt,
  },
  ratingCrown: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingCrownText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.brand.star,
  },
  storeDistanceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  storeDistance: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  trendingBadge: {
    position: "absolute",
    bottom: 60,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.ui.surface,
  },
  trendingContent: { padding: spacing.sm },
  trendingName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  trendingType: { fontSize: 11, color: colors.text.secondary, marginBottom: 6 },
  trendingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  followersBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  followersText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
