import * as storeApi from "@/src/api/stores";
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
    ActivityIndicator,
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
const HERO_HEIGHT = 380;
const AVATAR_SIZE = 72;
const SEARCH_SCROLL_THRESHOLD = 3 * SCREEN_HEIGHT;
let canUseStoreHoursEndpoint: boolean | null = null;
const STORE_META_TTL_MS = 5 * 60 * 1000;
type StoreMetaCacheEntry = {
  openingTime?: string;
  closingTime?: string;
  location?: string;
  images?: string[];
  fetchedAt: number;
};
const storeMetaCache = new Map<string, StoreMetaCacheEntry>();

function extractStoreImages(rawStore: any): string[] {
  const nestedImages = Array.isArray(rawStore?.images)
    ? rawStore.images
        .map((img: any) => {
          if (typeof img === "string") return img;
          if (typeof img?.image_url === "string") return img.image_url;
          if (typeof img?.imageUrl === "string") return img.imageUrl;
          return undefined;
        })
        .filter(
          (url: unknown): url is string =>
            typeof url === "string" && url.trim().length > 0,
        )
    : [];

  if (nestedImages.length > 0) return nestedImages;

  const singleImage =
    typeof rawStore?.image === "string"
      ? rawStore.image
      : typeof rawStore?.image_url === "string"
        ? rawStore.image_url
        : undefined;

  return singleImage ? [singleImage] : [];
}

function formatTime(time?: string): string {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return "--:--";
  const [hh, mm] = time.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, "0")} ${period}`;
}

function normalizeApiTime(time?: unknown): string | undefined {
  if (typeof time !== "string") return undefined;
  const value = time.trim();
  if (!value) return undefined;

  // Accept HH:MM, HH:MM:SS, HH:MM:SS+TZ, and 12-hour strings like 9:00 PM.
  const compact24Hour = value.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?(?:[+-]\d{2}:?\d{2}|Z)?$/i,
  );
  if (compact24Hour) {
    const hours = Number(compact24Hour[1]);
    const minutes = Number(compact24Hour[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  const meridiem = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (meridiem) {
    let hours = Number(meridiem[1]);
    const minutes = Number(meridiem[2] ?? "00");
    const period = meridiem[3].toUpperCase();
    if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59) {
      if (period === "AM") {
        hours = hours === 12 ? 0 : hours;
      } else {
        hours = hours === 12 ? 12 : hours + 12;
      }
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  return undefined;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
}

function isStoreOpenNow(openingTime?: string, closingTime?: string): boolean {
  if (!openingTime || !closingTime) return true;
  if (
    !/^\d{2}:\d{2}$/.test(openingTime) ||
    !/^\d{2}:\d{2}$/.test(closingTime)
  ) {
    return true;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes >= openMinutes) {
    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  }

  return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
}

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const storeId = Array.isArray(id) ? id[0] : id;
  const { t } = useSettings();
  const {
    getStoreById,
    reels,
    isFollowingStore,
    toggleFollowStore,
    catalogProducts,
    catalogServices,
  } = useApp();
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
  const [hoursFromSchedule, setHoursFromSchedule] = useState<{
    openingTime?: string;
    closingTime?: string;
  }>({});
  const [apiStoreImages, setApiStoreImages] = useState<string[]>([]);
  const [locationFromApi, setLocationFromApi] = useState<string | undefined>(
    undefined,
  );
  const [storeServicesFromApi, setStoreServicesFromApi] = useState<any[]>([]);
  const [isMetaLoading, setIsMetaLoading] = useState(true);

  const store = getStoreById(storeId as string);
  const isFollowing = store ? isFollowingStore(store.id) : false;
  const storeImages =
    apiStoreImages.length > 0
      ? apiStoreImages
      : store?.images && store.images.length > 0
        ? store.images
        : [store?.image || ""];

  const storeReelsCount = useMemo(
    () => reels.filter((r: Reel) => r.store.id === storeId).length,
    [reels, storeId],
  );

  useEffect(() => {
    let isMounted = true;

    const loadStoreHours = async () => {
      if (!storeId) {
        if (isMounted) {
          setHoursFromSchedule({});
          setApiStoreImages([]);
          setLocationFromApi(undefined);
          setStoreServicesFromApi([]);
          setIsMetaLoading(false);
        }
        return;
      }

      const cacheKey = String(storeId);
      const cachedMeta = storeMetaCache.get(cacheKey);
      const isCacheFresh =
        !!cachedMeta && Date.now() - cachedMeta.fetchedAt < STORE_META_TTL_MS;

      if (isCacheFresh && cachedMeta) {
        if (isMounted) {
          setHoursFromSchedule({
            openingTime: cachedMeta.openingTime,
            closingTime: cachedMeta.closingTime,
          });
          setApiStoreImages(cachedMeta.images || []);
          setLocationFromApi(cachedMeta.location);
          setIsMetaLoading(false);
        }

        // Cache hit: avoid blocking network calls for this open.
        return;
      }

      if (isMounted) setIsMetaLoading(true);

      try {
        const storeByIdResponse = await storeApi.getStoreById(String(storeId));
        const rawStore = (storeByIdResponse as any)?.store;
        const servicesResponse = await storeApi.getStoreServices(
          String(storeId),
        );
        const rawServices = Array.isArray((servicesResponse as any)?.services)
          ? ((servicesResponse as any).services as any[])
          : [];
        const fallbackImages = extractStoreImages(rawStore);

        const fallbackOpeningTime = normalizeApiTime(
          rawStore?.opening_time ??
            rawStore?.openingTime ??
            rawStore?.open_time ??
            rawStore?.openTime,
        );
        const fallbackClosingTime = normalizeApiTime(
          rawStore?.closing_time ??
            rawStore?.closingTime ??
            rawStore?.close_time ??
            rawStore?.closeTime,
        );
        const fallbackLocation =
          typeof rawStore?.location === "string" && rawStore.location.trim()
            ? rawStore.location
            : undefined;

        if (isMounted) {
          setHoursFromSchedule({
            openingTime: fallbackOpeningTime,
            closingTime: fallbackClosingTime,
          });
          setApiStoreImages(fallbackImages);
          setLocationFromApi(fallbackLocation);
          setStoreServicesFromApi(rawServices);
          setIsMetaLoading(false);
        }

        storeMetaCache.set(cacheKey, {
          openingTime: fallbackOpeningTime,
          closingTime: fallbackClosingTime,
          location: fallbackLocation,
          images: fallbackImages,
          fetchedAt: Date.now(),
        });

        // Fetch normalized weekly hours in background so screen is not blocked.
        if (canUseStoreHoursEndpoint !== false) {
          try {
            const response = await storeApi.getStoreHours(String(storeId));
            canUseStoreHoursEndpoint = true;

            const hours = Array.isArray((response as any)?.hours)
              ? ((response as any).hours as any[])
              : [];

            const firstOpenDay = hours.find(
              (item) => !toBoolean(item?.is_closed ?? item?.isClosed ?? false),
            );

            const scheduleOpeningTime = normalizeApiTime(
              firstOpenDay?.opening_time ?? firstOpenDay?.openingTime,
            );
            const scheduleClosingTime = normalizeApiTime(
              firstOpenDay?.closing_time ?? firstOpenDay?.closingTime,
            );

            if (isMounted && (scheduleOpeningTime || scheduleClosingTime)) {
              setHoursFromSchedule((prev) => ({
                openingTime: scheduleOpeningTime ?? prev.openingTime,
                closingTime: scheduleClosingTime ?? prev.closingTime,
              }));
            }

            if (scheduleOpeningTime || scheduleClosingTime) {
              const previous = storeMetaCache.get(cacheKey);
              storeMetaCache.set(cacheKey, {
                openingTime: scheduleOpeningTime ?? previous?.openingTime,
                closingTime: scheduleClosingTime ?? previous?.closingTime,
                location: previous?.location,
                images: previous?.images,
                fetchedAt: Date.now(),
              });
            }
          } catch (error) {
            const message =
              typeof (error as any)?.message === "string"
                ? (error as any).message
                : "";
            if (
              message.includes("Database schema missing store hours columns") ||
              message.includes("store_hours")
            ) {
              canUseStoreHoursEndpoint = false;
            }
          }
        }
      } catch {
        if (isMounted) {
          setHoursFromSchedule({});
          setApiStoreImages([]);
          setLocationFromApi(undefined);
          setIsMetaLoading(false);
        }
      }
    };

    loadStoreHours();

    return () => {
      isMounted = false;
    };
  }, [storeId]);

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

  // ─── Real data from store ───────────────────────────────────────────────────
  const products = (
    catalogProducts.filter((p) => String(p.storeId) === String(storeId)) || []
  ).map((p) => {
    const stockQuantity = Number(p.stockQuantity ?? 0);
    const active = Boolean(p.available ?? true) && stockQuantity > 0;
    const status: "active" | "out-of-stock" = active
      ? "active"
      : "out-of-stock";
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      displayPrice: `₹${p.price}${p.unit ? `/${p.unit}` : ""}`,
      stock: `${stockQuantity}`,
      image: p.image,
      status,
    };
  });
  const catalogStoreServices =
    catalogServices.filter((s) => String(s.storeId) === String(storeId)) || [];
  const servicesSource =
    storeServicesFromApi.length > 0
      ? storeServicesFromApi
      : catalogStoreServices;
  const services = servicesSource.map((service: any) => {
    const serviceImages: string[] = Array.isArray(service?.images)
      ? service.images
          .map((img: any) => (typeof img === "string" ? img : img?.image_url))
          .filter((url: unknown): url is string => typeof url === "string")
      : [];

    return {
      id: String(service.id),
      name: String(service.name ?? "Service"),
      description: String(service.description ?? ""),
      active: Boolean(service.active ?? service.availability ?? true),
      price: Number(service.price ?? 0),
      image:
        (typeof service.image === "string" && service.image) ||
        serviceImages[0],
      duration: String(service.duration ?? service.timings ?? ""),
      rating: Number(service.rating ?? 0),
    };
  });
  const effectiveOpeningTime =
    hoursFromSchedule.openingTime ?? store?.openingTime;
  const effectiveClosingTime =
    hoursFromSchedule.closingTime ?? store?.closingTime;
  const displayLocation =
    store?.location || locationFromApi || "Location not available";
  const openNow = isStoreOpenNow(effectiveOpeningTime, effectiveClosingTime);
  const displayHours =
    effectiveOpeningTime && effectiveClosingTime
      ? `${formatTime(effectiveOpeningTime)} - ${formatTime(effectiveClosingTime)}`
      : "Hours not set";

  if (isMetaLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading store details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleBookService = (service: any) => {
    console.log("Booking service:", service.name);
  };

  const handleReelsPress = () => {
    router.push(`/dukaan/reels/${storeId}`);
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
    Toast.show({
      type: "info",
      text1: "Not Available",
      text2: "Store phone number is not available yet.",
      visibilityTime: 2000,
      position: "top",
    });
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
          colors={["rgba(0,0,0,0.45)", "transparent", "rgba(15,23,42,0.85)"]}
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
            <Text style={styles.openPillText}>
              {openNow ? t("store.openNow") : "Closed"}
            </Text>
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
            {displayLocation}
          </Text>
          <Clock
            size={12}
            color={colors.brand.star}
            style={{ marginLeft: 8 }}
          />
          <Text style={styles.hoursText}>{displayHours}</Text>
          <Navigation size={12} color={colors.brand.primary} />
        </TouchableOpacity>

        {/* ── Stats strip ── */}
        <View style={styles.statsStrip}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{store.followers || "2.5K"}</Text>
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
            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
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
                storeId={String(storeId || "")}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "600",
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
