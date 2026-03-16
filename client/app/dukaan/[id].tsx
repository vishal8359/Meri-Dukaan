import { Reel, useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { ProductsSection } from "@/src/features/dukaan/components/ProductsSection";
import { ServicesSection } from "@/src/features/dukaan/components/ServiceSection";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Play,
  Search,
  Share2,
  ShoppingBag,
  Star,
  UserCheck,
  UserPlus,
  Wrench,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");
const HERO_HEIGHT = 380;
const AVATAR_SIZE = 72;
const SEARCH_SCROLL_THRESHOLD = 3 * SCREEN_HEIGHT;

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useSettings();
  const { getStoreById, reels, isFollowingStore, toggleFollowStore } =
    useApp();
  const scrollY = useRef(new Animated.Value(0)).current;
  const imageCarouselRef = useRef<FlatList>(null);
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

  const storeReelsCount = useMemo(
    () => reels.filter((r: Reel) => r.store.id === id).length,
    [reels, id],
  );

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

  // ─── Mock data ──────────────────────────────────────────────────────────────
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

  // ─── Handlers ───────────────────────────────────────────────────────────────
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

  const handleShare = async () => {};

  const handleCall = () => {
    Linking.openURL(`tel:+919876543210`);
  };

  // ─── Not-found state ────────────────────────────────────────────────────────
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

  // ─── Header ─────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
      {/* ══════ HERO IMAGE CAROUSEL ══════ */}
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
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.round(x / SCREEN_WIDTH);
            setCurrentImageIndex(Math.min(idx, storeImages.length - 1));
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

        {/* Dark gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.45)",
            "transparent",
            "rgba(15,23,42,0.85)",
          ]}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top bar: back + actions */}
        <View style={styles.heroTopBar}>
          <TouchableOpacity style={styles.glassBtn} onPress={handleBack}>
            <ChevronLeft size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroTopRight}>
            <TouchableOpacity
              style={styles.glassBtn}
              onPress={handleReelsPress}
            >
              <Play size={14} color="#fff" fill="#fff" />
              <Text style={styles.glassBtnText}>{storeReelsCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassBtn} onPress={handleShare}>
              <Share2 size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Distance badge */}
        <View style={styles.distanceBadge}>
          <Navigation size={11} color="#fff" />
          <Text style={styles.distanceText}>{store.distance}</Text>
        </View>

        {/* Pagination dots */}
        {storeImages.length > 1 && (
          <View style={styles.paginationRow}>
            {storeImages.map((_: string, idx: number) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  idx === currentImageIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}

      </View>

      {/* ══════ STORE PROFILE CARD ══════ */}
      <View style={styles.profileCard}>
        {/* Avatar bridge */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: storeImages[0] || store.image }}
            style={styles.avatar}
          />
          <View style={styles.avatarRing} />
        </View>

        <Text style={styles.storeName}>{store.name}</Text>

        {/* Type / Open / Rating pills */}
        <View style={styles.metaRow}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{store.type}</Text>
          </View>
          <View style={styles.openPill}>
            <Clock size={10} color={colors.status.successDark} />
            <Text style={styles.openPillText}>{t("store.openNow")}</Text>
          </View>
          <View style={styles.ratingPill}>
            <Star
              size={12}
              color={colors.brand.star}
              fill={colors.brand.star}
            />
            <Text style={styles.ratingPillText}>{store.rating}</Text>
          </View>
        </View>

        {/* Location */}
        <TouchableOpacity style={styles.locationChip}>
          <MapPin size={12} color={colors.text.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            123 Market Street, City Center
          </Text>
          <Clock size={12} color={colors.brand.star} style={{ marginLeft: 8 }} />
          <Text style={styles.hoursText}>9:00 AM – 9:00 PM</Text>
          <Navigation size={12} color={colors.brand.primary} />
        </TouchableOpacity>

        {/* ── Stats strip ── */}
        <View style={styles.statsStrip}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>
              {store.followers || "2.5K"}
            </Text>
            <Text style={styles.statLabel}>{t("store.followers")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>{t("store.products")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>{t("store.services")}</Text>
          </View>
        </View>

        {/* ── Primary actions ── */}
        <View style={styles.primaryActions}>
          <TouchableOpacity
            style={[
              styles.followBtn,
              isFollowing && styles.followBtnActive,
            ]}
            onPress={handleFollow}
            activeOpacity={0.8}
          >
            {isFollowing ? (
              <UserCheck size={16} color="#fff" />
            ) : (
              <UserPlus size={16} color="#fff" />
            )}
            <Text style={styles.followBtnText}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Phone size={16} color="#fff" />
            <Text style={styles.callBtnText}>{t("store.callStore")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ══════ TAB SELECTOR ══════ */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "products" && styles.tabBtnActive,
          ]}
          onPress={() => {
            setActiveTab("products");
            setSearchQuery("");
          }}
          activeOpacity={0.7}
        >
          <ShoppingBag
            size={16}
            color={
              activeTab === "products"
                ? colors.brand.primary
                : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.tabTextActive,
            ]}
          >
            {t("store.products")}
          </Text>
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
          activeOpacity={0.7}
        >
          <Wrench
            size={16}
            color={
              activeTab === "services"
                ? colors.brand.primary
                : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "services" && styles.tabTextActive,
            ]}
          >
            {t("store.services")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Sticky search – appears on deep scroll */}
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
          <SafeAreaView edges={["top"]} style={styles.stickySearchInner}>
            <View style={styles.searchBox}>
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

      <Animated.FlatList
        data={[1]}
        renderItem={() => (
          <View style={styles.contentWrap}>
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

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  scrollContent: { paddingBottom: 60 },

  // ── Error state ─────────────────────────────────────────
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

  // ══════════════════════════════════════════════════════════
  // HERO
  // ══════════════════════════════════════════════════════════
  heroSection: {
    height: HERO_HEIGHT,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },

  // Top navigation
  heroTopBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 38,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  heroTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  glassBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  glassBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Pagination
  paginationRow: {
    position: "absolute",
    bottom: AVATAR_SIZE / 2 + 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    zIndex: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 22,
    borderRadius: 4,
  },

  // Meta row (inside profile card)
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  typePill: {
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brand.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  openPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  openPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.status.successDark,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
  },

  // ══════════════════════════════════════════════════════════
  // PROFILE CARD
  // ══════════════════════════════════════════════════════════
  profileCard: {
    backgroundColor: colors.ui.surface,
    marginHorizontal: spacing.md,
    marginTop: -AVATAR_SIZE / 2,
    borderRadius: 20,
    paddingTop: AVATAR_SIZE / 2 + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    ...shadows.medium,
    zIndex: 10,
  },
  avatarWrapper: {
    position: "absolute",
    top: -AVATAR_SIZE / 2,
    alignSelf: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.ui.surface,
  },
  avatarRing: {
    position: "absolute",
    top: -2,
    left: -2,
    width: AVATAR_SIZE + 4,
    height: AVATAR_SIZE + 4,
    borderRadius: (AVATAR_SIZE + 4) / 2,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    opacity: 0.3,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  distanceBadge: {
    position: "absolute",
    bottom: AVATAR_SIZE / 2 + 12,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 5,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.ui.backgroundAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 18,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
  },

  // Stats strip
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 14,
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 14,
    marginBottom: 16,
  },
  statCell: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.ui.border,
  },

  // Primary action buttons
  primaryActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  followBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
  },
  followBtnActive: {
    backgroundColor: colors.brand.primaryLight,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: colors.status.success,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // ══════════════════════════════════════════════════════════
  // TAB BAR
  // ══════════════════════════════════════════════════════════
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginTop: 18,
    marginBottom: spacing.md,
    backgroundColor: colors.ui.surface,
    borderRadius: 16,
    padding: 5,
    ...shadows.small,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: colors.ui.backgroundAlt,
    ...shadows.small,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  tabTextActive: {
    fontWeight: "700",
    color: colors.brand.primary,
  },

  // ══════════════════════════════════════════════════════════
  // CONTENT
  // ══════════════════════════════════════════════════════════
  contentWrap: {
    marginHorizontal: spacing.md,
    minHeight: 400,
  },

  // Sticky search
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
  stickySearchInner: {
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.heading,
  },
  hoursText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
    marginLeft: 4,
  },
});
