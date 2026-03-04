import { EnhancedReel } from "@/src/assets/mockData";
import { useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { ProductsSection } from "@/src/features/dukaan/components/ProductsSection";
import { ServicesSection } from "@/src/features/dukaan/components/ServiceSection";
import { colors, radius, shadows } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ChevronRight,
    Clock,
    MapPin,
    MessageCircle,
    Phone,
    Play,
    Search,
    Share2,
    Star,
    UserCheck,
    UserPlus,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Scroll threshold for search bar appearance (300% of screen height)
const SEARCH_SCROLL_THRESHOLD = 3 * SCREEN_HEIGHT;

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useSettings();
  const { getStoreById, reels, isFollowingStore, toggleFollowStore } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;
  const imageCarouselRef = useRef<FlatList>(null);

  // Bounce animation for search bar
  const searchBounceAnim = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const store = getStoreById(id as string);
  const isFollowing = store ? isFollowingStore(store.id) : false;
  const storeImages =
    store?.images && store.images.length > 0
      ? store.images
      : [store?.image || ""];

  // Get reels count for this store
  const storeReelsCount = useMemo(
    () => reels.filter((r: EnhancedReel) => r.store.id === id).length,
    [reels, id],
  );

  // Trigger bounce animation when search becomes visible
  useEffect(() => {
    if (isSearchVisible) {
      searchBounceAnim.setValue(-50);
      Animated.spring(searchBounceAnim, {
        toValue: 0,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isSearchVisible]);

  // Mock data preserved
  const products = [
    {
      id: "1",
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: 40,
      displayPrice: "₹40/kg",
      stock: "50 kg",
      image:
        "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=300",
      status: "active" as const,
    },
    {
      id: "2",
      name: "Onions",
      category: "Vegetables",
      price: 30,
      displayPrice: "₹30/kg",
      stock: "80 kg",
      image:
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=300",
      status: "active" as const,
    },
    {
      id: "3",
      name: "Green Chilies",
      category: "Vegetables",
      price: 60,
      displayPrice: "₹60/kg",
      stock: "0 kg",
      image:
        "https://images.unsplash.com/photo-1583846499862-bf1c00b4c7ed?q=80&w=300",
      status: "out-of-stock" as const,
    },
  ];

  const services = [
    {
      id: "1",
      name: "Home Delivery",
      description: "Free over ₹500",
      active: true,
      price: 0,
      duration: "24-48 hrs",
      image:
        "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=300",
      rating: 4.8,
    },
    {
      id: "2",
      name: "Same Day Delivery",
      description: "Order before 5 PM",
      active: true,
      price: 50,
      duration: "4-6 hrs",
      image:
        "https://images.unsplash.com/photo-1565033595900-6ad46f6f8217?q=80&w=300",
      rating: 4.7,
    },
    {
      id: "3",
      name: "Bulk Orders",
      description: "Special pricing for bulk",
      active: false,
      price: 0,
      duration: "1-3 days",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=300",
      rating: 4.5,
    },
    {
      id: "4",
      name: "Hair Cutting (Saloon)",
      description: "Professional hair styling",
      active: true,
      price: 200,
      duration: "30-45 min",
      image:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=300",
      rating: 4.9,
    },
    {
      id: "5",
      name: "Welding Services",
      description: "Metal repairs & fabrication",
      active: true,
      price: 500,
      duration: "1-2 hrs",
      image:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=300",
      rating: 4.6,
    },
    {
      id: "6",
      name: "Clothes Stitching",
      description: "Custom tailoring & alterations",
      active: true,
      price: 300,
      duration: "2-3 days",
      image:
        "https://images.unsplash.com/photo-1558171813-4c088753af8f?q=80&w=300",
      rating: 4.7,
    },
    {
      id: "7",
      name: "Vehicle Rental",
      description: "Bikes, scooters & cars",
      active: true,
      price: 150,
      duration: "Per hour",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300",
      rating: 4.4,
    },
    {
      id: "8",
      name: "Equipment Rental",
      description: "Tools & machinery",
      active: true,
      price: 100,
      duration: "Per day",
      image:
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300",
      rating: 4.3,
    },
    {
      id: "9",
      name: "Plumbing Services",
      description: "Repairs & installations",
      active: true,
      price: 400,
      duration: "1-2 hrs",
      image:
        "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=300",
      rating: 4.5,
    },
    {
      id: "10",
      name: "Electrical Repairs",
      description: "Wiring & appliance repair",
      active: true,
      price: 350,
      duration: "1-3 hrs",
      image:
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=300",
      rating: 4.6,
    },
    {
      id: "11",
      name: "Beauty Services",
      description: "Makeup & skincare",
      active: true,
      price: 500,
      duration: "1-2 hrs",
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300",
      rating: 4.8,
    },
    {
      id: "12",
      name: "Laundry & Dry Clean",
      description: "Professional cleaning",
      active: true,
      price: 80,
      duration: "24 hrs",
      image:
        "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=300",
      rating: 4.4,
    },
  ];

  const handleBookService = (service: any) => {
    console.log("Booking service:", service.name);
  };

  const handleReelsPress = () => {
    router.push(`/dukaan/reels/${id}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleFollow = () => {
    if (!store) return;
    toggleFollowStore(store.id);
    const nowFollowing = !isFollowing;
    Toast.show({
      type: nowFollowing ? "success" : "info",
      text1: nowFollowing ? "Followed" : "Unfollowed",
      text2: `${store.name}`,
      visibilityTime: 1500,
      position: "top",
    });
  };

  const handleShare = async () => {
    // Implement share functionality
  };

  const handleCall = () => {
    // Mock phone number since Store doesn't have phone property
    Linking.openURL(`tel:+919876543210`);
  };

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.ui.muted}
          />
          <Text style={styles.errorText}>{t("store.notFound")}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>{t("store.goBack")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Header Component
  const renderHeader = () => (
    <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
      {/* Hero Image Section with Carousel */}
      <View style={styles.heroSection}>
        <FlatList
          ref={imageCarouselRef}
          data={storeImages}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="start"
          onScroll={(e) => {
            const contentOffsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(contentOffsetX / SCREEN_WIDTH);
            setCurrentImageIndex(Math.min(index, storeImages.length - 1));
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          keyExtractor={(_, idx) => `hero-${idx}`}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={storeImages.length > 1}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
          locations={[0, 0.4, 1]}
          style={styles.heroGradient}
        />

        {/* Top Navigation Bar */}
        <View style={styles.heroTopBar}>
          <View style={styles.heroTopRight}>
            {/* Reels Button - Always visible */}
            <TouchableOpacity
              onPress={handleReelsPress}
              style={[
                styles.reelsBtnContainer,
                storeReelsCount === 0 && { opacity: 0.6 },
              ]}
            >
              <View style={styles.reelsBtnRow}>
                <Play
                  size={14}
                  color={colors.text.inverse}
                  fill={colors.text.inverse}
                />
                <Text style={styles.reelsBtnText}>{storeReelsCount}</Text>
              </View>
            </TouchableOpacity>

            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <Star
                size={14}
                color={colors.brand.star}
                fill={colors.brand.star}
              />
              <Text style={styles.ratingText}>{store?.rating}</Text>
            </View>
          </View>
        </View>

        {/* Pagination Dots */}
        {storeImages.length > 1 && (
          <View style={styles.paginationContainer}>
            {storeImages.map((_: string, idx: number) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.paginationDot,
                  idx === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Store Name Overlay on Hero */}
        <View style={styles.heroBottomInfo}>
          <Text style={styles.heroStoreName}>{store?.name}</Text>
          <View style={styles.heroTags}>
            <View style={styles.storeTypeBadge}>
              <Text style={styles.storeTypeText}>{store?.type}</Text>
            </View>
            <View style={styles.openBadge}>
              <Clock size={10} color={colors.status.successDark} />
              <Text style={styles.openText}>{t("store.openNow")}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Store Info Card */}
      <View style={styles.storeCard}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{store?.followers || "2.5K"}</Text>
            <Text style={styles.statLabel}>{t("store.followers")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>{t("store.products")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{store?.distance || "1.2 km"}</Text>
            <Text style={styles.statLabel}>{t("store.away")}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, isFollowing && styles.actionBtnFollowing]}
            onPress={handleFollow}
          >
            {isFollowing ? (
              <UserCheck size={18} color={colors.text.inverse} />
            ) : (
              <UserPlus size={18} color={colors.brand.primary} />
            )}
            <Text
              style={[
                styles.actionBtnText,
                isFollowing && styles.actionBtnTextFollowing,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Share2 size={18} color={colors.status.info} />
            <Text style={styles.actionBtnText}>{t("store.share")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={handleCall}
          >
            <Phone size={18} color={colors.text.inverse} />
            <Text style={styles.actionBtnTextPrimary}>
              {t("store.callStore")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        <TouchableOpacity style={styles.locationRow}>
          <MapPin size={16} color={colors.text.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            123 Market Street, City Center
          </Text>
          <ChevronRight size={16} color={colors.ui.muted} />
        </TouchableOpacity>
      </View>

      {/* Quick Contact Row */}
      <View style={styles.quickContactRow}>
        <TouchableOpacity style={styles.quickContactBtn}>
          <MessageCircle size={18} color={colors.status.info} />
          <Text style={styles.quickContactText}>{t("store.chat")}</Text>
        </TouchableOpacity>
        <View style={styles.quickContactDivider} />
        <TouchableOpacity style={styles.quickContactBtn}>
          <Clock size={18} color={colors.brand.star} />
          <Text style={styles.quickContactText}>9 AM - 9 PM</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "products" && styles.tabBtnActive,
          ]}
          onPress={() => {
            setActiveTab("products");
            setSearchQuery("");
          }}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "products" && styles.tabBtnTextActive,
            ]}
          >
            {t("store.products")}
          </Text>
          {activeTab === "products" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "services" && styles.tabBtnActive,
          ]}
          onPress={() => {
            setActiveTab("services");
            setSearchQuery("");
          }}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "services" && styles.tabBtnTextActive,
            ]}
          >
            {t("store.services")}
          </Text>
          {activeTab === "services" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Animated Sticky Search Bar - Appears at 300% scroll with bounce */}
      {activeTab === "products" && (
        <Animated.View
          pointerEvents={isSearchVisible ? "auto" : "none"}
          style={[
            styles.stickySearch,
            {
              opacity: scrollY.interpolate({
                inputRange: [
                  SEARCH_SCROLL_THRESHOLD - 50,
                  SEARCH_SCROLL_THRESHOLD,
                ],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
              transform: [{ translateY: searchBounceAnim }],
            },
          ]}
        >
          <SafeAreaView edges={["top"]} style={styles.stickySearchSafe}>
            <View style={styles.searchInputContainer}>
              <Search size={18} color={colors.text.secondary} />
              <TextInput
                placeholder={t("store.searchProducts")}
                style={styles.searchInput}
                placeholderTextColor={colors.ui.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* Main Scroll Content */}
      <Animated.FlatList
        data={[1]}
        renderItem={() => (
          <View style={styles.contentContainer}>
            {activeTab === "products" ? (
              <ProductsSection
                storeId={id as string}
                products={products}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                storeImage={storeImages[0] || ""}
                storeName={store?.name}
              />
            ) : (
              <ServicesSection
                services={services}
                onBookService={handleBookService}
                storeImage={storeImages[0] || ""}
                storeName={store?.name}
                storeId={id as string}
              />
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              setIsSearchVisible(offsetY >= SEARCH_SCROLL_THRESHOLD);
            },
          },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={() => "main-content"}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.surfaceHover,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },

  // Hero Section
  heroSection: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 35,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  heroTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reelsBtnContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reelsBtnRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  reelsBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reelsBtnEmpty: {
    opacity: 0.6,
  },
  reelsBtnText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: "700" as const,
    marginLeft: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    ...shadows.small,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  heroBottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 5,
  },
  heroStoreName: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text.inverse,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroTags: {
    flexDirection: "row",
    gap: 8,
  },
  storeTypeBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  storeTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.heading,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  openText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.successDark,
  },

  // Store Card
  storeCard: {
    backgroundColor: colors.ui.surface,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    ...shadows.medium,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.ui.border,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    borderRadius: 12,
    gap: 6,
    backgroundColor: colors.ui.surface,
  },
  actionBtnFollowing: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.caption,
  },
  actionBtnTextFollowing: {
    color: colors.text.inverse,
  },
  actionBtnPrimary: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: colors.status.success,
  },
  actionBtnTextPrimary: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surfaceHover,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 10,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.caption,
  },

  // Quick Contact
  quickContactRow: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    ...shadows.small,
  },
  quickContactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 4,
  },
  quickContactText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.caption,
  },
  quickContactDivider: {
    width: 1,
    backgroundColor: colors.ui.border,
    marginVertical: 4,
  },

  // Tab Container
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: colors.ui.surface,
    borderRadius: 16,
    padding: 6,
    ...shadows.small,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    position: "relative",
  },
  tabBtnActive: {
    backgroundColor: colors.ui.background,
  },
  tabBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  tabBtnTextActive: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 6,
    left: "30%",
    right: "30%",
    height: 3,
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
  },

  // Content
  contentContainer: {
    marginHorizontal: 16,
    minHeight: 400,
  },

  // Sticky Search
  stickySearch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    ...shadows.small,
  },
  stickySearchSafe: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.heading,
  },
});
