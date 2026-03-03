import { mockServices, ServiceItem } from "@/src/assets/mockData";
import { BookedService, useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Edit2,
  Heart,
  MapPin,
  Package,
  Star,
  Users,
  X,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 340;
const RELATED_CARD_WIDTH = 165;
const RELATED_BATCH_SIZE = 4;

// Available time slots
const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];

// Get next 7 days for date selection
const getNextDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return days;
};

// ─── Skeleton Shimmer Component ─────────────────────────────────────────────
const SkeletonBlock = ({
  width,
  height,
  borderRadius = radius.md,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.ui.disabled,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─── Skeleton Loading Screen ─────────────────────────────────────────────────
const ServiceSkeleton = () => (
  <ScrollView
    style={{ flex: 1, backgroundColor: colors.ui.background }}
    contentContainerStyle={{ padding: spacing.md }}
    showsVerticalScrollIndicator={false}
  >
    <SkeletonBlock
      width="100%"
      height={IMAGE_HEIGHT}
      borderRadius={radius.lg}
    />
    <View
      style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}
    >
      {[1, 2, 3].map((i) => (
        <SkeletonBlock
          key={i}
          width={70}
          height={70}
          borderRadius={radius.md}
        />
      ))}
    </View>
    <View
      style={{
        backgroundColor: colors.ui.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginTop: spacing.lg,
        ...shadows.medium,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SkeletonBlock width="65%" height={24} />
        <SkeletonBlock width={40} height={40} borderRadius={radius.md} />
      </View>
      <SkeletonBlock
        width="35%"
        height={12}
        style={{ marginTop: spacing.sm }}
      />
      <View
        style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}
      >
        <SkeletonBlock width="30%" height={16} />
        <SkeletonBlock width="25%" height={26} borderRadius={radius.full} />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: spacing.md,
        }}
      >
        <SkeletonBlock width="35%" height={28} />
        <SkeletonBlock width="40%" height={20} />
      </View>
    </View>
    <View
      style={{
        backgroundColor: colors.ui.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.md,
        ...shadows.medium,
      }}
    >
      <SkeletonBlock width="50%" height={20} />
      {[1, 2, 3].map((i) => (
        <SkeletonBlock
          key={i}
          width="90%"
          height={14}
          style={{ marginTop: spacing.sm }}
        />
      ))}
    </View>
    <View
      style={{
        backgroundColor: colors.ui.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.md,
        ...shadows.medium,
      }}
    >
      <SkeletonBlock width="45%" height={20} />
      {[1, 2].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: spacing.md,
            marginTop: spacing.md,
          }}
        >
          <SkeletonBlock width={20} height={20} borderRadius={10} />
          <View style={{ flex: 1 }}>
            <SkeletonBlock width="40%" height={12} />
            <SkeletonBlock width="60%" height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
    <SkeletonBlock width="45%" height={20} style={{ marginTop: spacing.lg }} />
    <View
      style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}
    >
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ width: RELATED_CARD_WIDTH }}>
          <SkeletonBlock
            width={RELATED_CARD_WIDTH}
            height={130}
            borderRadius={radius.lg}
          />
          <SkeletonBlock
            width="80%"
            height={14}
            style={{ marginTop: spacing.sm }}
          />
          <SkeletonBlock
            width="50%"
            height={14}
            style={{ marginTop: spacing.xs }}
          />
        </View>
      ))}
    </View>
  </ScrollView>
);

// ─── Service Not Found ──────────────────────────────────────────────────────
const ServiceNotFound = ({ onBack }: { onBack: () => void }) => {
  const { t } = useSettings();
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <ChevronLeft size={24} color={colors.text.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("service.details")}</Text>
        <View style={styles.headerButton} />
      </View>
      <View style={styles.notFoundContainer}>
        <Package size={64} color={colors.ui.disabled} />
        <Text style={styles.notFoundTitle}>{t("service.notFound")}</Text>
        <Text style={styles.notFoundSubtitle}>{t("service.notFoundDesc")}</Text>
        <TouchableOpacity style={styles.notFoundButton} onPress={onBack}>
          <Text style={styles.notFoundButtonText}>{t("service.goBack")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ServiceDetailScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { id, fallbackData } = useLocalSearchParams<{
    id: string;
    fallbackData?: string;
  }>();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    bookService,
    isServiceBooked,
    getBookingByServiceId,
    updateBooking,
    cancelBooking,
  } = useApp();

  // Image gallery state
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const imageScrollRef = useRef<FlatList>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Related services state
  const [visibleRelated, setVisibleRelated] = useState(RELATED_BATCH_SIZE);

  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getNextDays()[0].date);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const availableDays = getNextDays();

  // ─── Dynamic service lookup (with store fallback) ────────────────────────
  const service = useMemo(() => {
    const found = mockServices.find((s) => s.id === id);
    if (found) return found;
    // Fallback: item from store's local data passed via params
    if (fallbackData) {
      try {
        const parsed = JSON.parse(fallbackData);
        return {
          ...parsed,
          images: parsed.image ? [parsed.image] : [],
          originalPrice: parsed.originalPrice || Math.round(parsed.price * 1.2),
          discount: parsed.discount || 20,
          description: parsed.description || `${parsed.name} service`,
          features: parsed.features || [],
          reviewsCount: parsed.reviewsCount || 0,
          rating: parsed.rating || 4.5,
          delivery: parsed.delivery || "Walk-in",
          distance: parsed.distance || "Nearby",
        } as ServiceItem;
      } catch {
        /* ignore parse error */
      }
    }
    return null;
  }, [id, fallbackData]);

  const serviceImages = useMemo(() => {
    if (!service) return [];
    const imgs =
      service.images && service.images.length > 0
        ? service.images
        : [service.image];
    return imgs.slice(0, 5);
  }, [service]);

  const relatedServices = useMemo(() => {
    if (!service) return [];
    return mockServices
      .filter((s) => s.id !== service.id && s.category === service.category)
      .concat(
        mockServices.filter(
          (s) => s.id !== service.id && s.category !== service.category,
        ),
      )
      .slice(0, 12);
  }, [service]);

  const paginatedRelated = useMemo(
    () => relatedServices.slice(0, visibleRelated),
    [relatedServices, visibleRelated],
  );

  // ─── Load content after navigation transition ────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    fadeAnim.setValue(0);
    const task = InteractionManager.runAfterInteractions(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    return () => task.cancel();
  }, [id]);

  // ─── Gallery helpers ──────────────────────────────────────────────────────
  const scrollToImage = useCallback((index: number) => {
    imageScrollRef.current?.scrollToIndex({ index, animated: true });
    setMainImageIndex(index);
  }, []);

  const onImageScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / (SCREEN_WIDTH - spacing.md * 2));
      if (idx >= 0 && idx < serviceImages.length) setMainImageIndex(idx);
    },
    [serviceImages.length],
  );

  // ─── Booking state ───────────────────────────────────────────────────────
  const isBooked = service ? isServiceBooked(service.id) : false;
  const currentBooking = service
    ? getBookingByServiceId(service.id)
    : undefined;

  const openBookingModal = useCallback(
    (editing: boolean = false) => {
      setIsEditing(editing);
      if (editing && currentBooking) {
        setSelectedDate(currentBooking.bookingDate);
        setSelectedTime(currentBooking.bookingTime);
      } else {
        setSelectedDate(getNextDays()[0].date);
        setSelectedTime("10:00 AM");
      }
      setBookingModalVisible(true);
    },
    [currentBooking],
  );

  const handleConfirmBooking = useCallback(() => {
    if (!service) return;
    if (isEditing && currentBooking) {
      updateBooking(currentBooking.id, {
        bookingDate: selectedDate,
        bookingTime: selectedTime,
      });
      setBookingModalVisible(false);
      Toast.show({
        type: "success",
        text1: t("service.bookingUpdated"),
        text2: t("service.bookingRescheduled"),
        visibilityTime: 2000,
        position: "top",
      });
    } else {
      const LOCK_DURATION = 3 * 60 * 1000; // 3 minutes
      const newBooking: BookedService = {
        id: "booking-" + Date.now(),
        serviceId: service.id,
        serviceName: service.name,
        storeName: service.storeName || "Store",
        storeId: service.storeId || "1",
        price: service.price,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        duration: service.duration,
        image: service.image,
        status: "pending",
        expiresAt: Date.now() + LOCK_DURATION,
      };
      bookService(newBooking);
      setBookingModalVisible(false);
      Toast.show({
        type: "info",
        text1: t("service.slotLockedToast"),
        text2: t("service.completePayment"),
        visibilityTime: 3000,
        position: "top",
      });
      // Navigate to cart services tab
      router.push("/cart/cart" as any);
    }
  }, [service, isEditing, currentBooking, selectedDate, selectedTime, router]);

  const handleCancelBooking = useCallback(() => {
    if (currentBooking) cancelBooking(currentBooking.id);
  }, [currentBooking]);

  // ─── Wishlist handler ─────────────────────────────────────────────────────
  const toggleWishlist = useCallback(() => {
    if (!service) return;
    const wishlistId = "service-" + service.id;
    if (isInWishlist(wishlistId)) {
      removeFromWishlist(wishlistId);
      Toast.show({
        type: "info",
        text1: t("product.removedFromWishlist"),
        text2: service.name + " removed",
        visibilityTime: 1500,
        position: "top",
      });
    } else {
      addToWishlist({
        id: wishlistId,
        name: service.name,
        price: service.price,
        type: "service",
        description: service.description,
        image: service.image,
        rating: service.rating,
      });
      Toast.show({
        type: "success",
        text1: t("product.addedToWishlist"),
        text2: service.name + " saved!",
        visibilityTime: 1500,
        position: "top",
      });
    }
  }, [service, isInWishlist, addToWishlist, removeFromWishlist]);

  // ─── Navigate to related service ──────────────────────────────────────────
  const handleNavigateToService = useCallback(
    (serviceId: string) => {
      router.push({
        pathname: "/service/[id]",
        params: { id: serviceId },
      } as any);
    },
    [router],
  );

  const loadMoreRelated = useCallback(() => {
    setVisibleRelated((prev) =>
      Math.min(prev + RELATED_BATCH_SIZE, relatedServices.length),
    );
  }, [relatedServices.length]);

  // ─── Early returns ────────────────────────────────────────────────────────
  if (isLoading) return <ServiceSkeleton />;
  if (!service) return <ServiceNotFound onBack={() => router.back()} />;

  // ─── Description bullets ──────────────────────────────────────────────────
  const descriptionBullets = service.description
    ? service.description.split(/\.\s+|\n/).filter(Boolean)
    : [];

  // ─── Related Service Card renderer ────────────────────────────────────────
  const renderRelatedCard = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => handleNavigateToService(item.id)}
      activeOpacity={0.75}
    >
      <View style={styles.relatedImageContainer}>
        <Image source={{ uri: item.image }} style={styles.relatedImage} />
        {item.category && (
          <View style={styles.categoryBadgeRelated}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
        {item.active && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{"\u25CF"}</Text>
          </View>
        )}
        {item.discount && (
          <View style={styles.relatedDiscountBadge}>
            <Text style={styles.relatedDiscountText}>-{item.discount}%</Text>
          </View>
        )}
        {!item.active && (
          <View style={styles.relatedUnavailable}>
            <Text style={styles.relatedUnavailableText}>UNAVAILABLE</Text>
          </View>
        )}
      </View>
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.rating > 0 && (
          <View style={styles.relatedRatingContainer}>
            <View style={styles.relatedRating}>
              <Star
                size={13}
                color={colors.brand.star}
                fill={colors.brand.star}
              />
              <Text style={styles.relatedRatingText}>{item.rating}</Text>
            </View>
            {item.reviewsCount > 0 && (
              <Text style={styles.relatedReviews}>{item.reviewsCount}</Text>
            )}
          </View>
        )}
        <View style={styles.priceDeliveryRow}>
          <Text style={styles.relatedPrice}>
            {item.price > 0 ? "\u20B9" + item.price : "FREE"}
          </Text>
          {item.delivery && (
            <Text style={styles.relatedDelivery}>{item.delivery}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadMoreFooter = () => {
    if (visibleRelated >= relatedServices.length) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreContainer}
        onPress={loadMoreRelated}
      >
        <View style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>More</Text>
          <Text style={styles.loadMoreText}>
            ({relatedServices.length - visibleRelated})
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ui.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("service.details")}</Text>
        <View style={styles.headerButton} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── Image Gallery ──────────────────────────────────────────── */}
          <View style={styles.galleryCard}>
            <FlatList
              ref={imageScrollRef}
              horizontal
              pagingEnabled
              data={serviceImages}
              keyExtractor={(_, i) => "img-" + i}
              renderItem={({ item, index }) => (
                <View style={styles.galleryImageWrapper}>
                  {!imageLoaded[index] && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator
                        size="large"
                        color={colors.brand.primary}
                      />
                    </View>
                  )}
                  <Image
                    source={{ uri: item }}
                    style={styles.mainImage}
                    onLoad={() =>
                      setImageLoaded((prev) => ({ ...prev, [index]: true }))
                    }
                  />
                  {!!service.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{service.discount}%
                      </Text>
                    </View>
                  )}
                  {!service.active && (
                    <View style={styles.unavailableBanner}>
                      <Text style={styles.unavailableBannerText}>
                        UNAVAILABLE
                      </Text>
                    </View>
                  )}
                </View>
              )}
              onMomentumScrollEnd={onImageScroll}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH - spacing.md * 2,
                offset: (SCREEN_WIDTH - spacing.md * 2) * index,
                index,
              })}
              snapToAlignment="start"
            />

            {/* Image counter badge */}
            {serviceImages.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Text style={styles.imageCountText}>
                  {mainImageIndex + 1}/{serviceImages.length}
                </Text>
              </View>
            )}

            {/* Dot indicators */}
            {serviceImages.length > 1 && (
              <View style={styles.dotContainer}>
                {serviceImages.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      mainImageIndex === i && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Thumbnails row */}
            {serviceImages.length > 1 && (
              <FlatList
                horizontal
                data={serviceImages}
                keyExtractor={(_, i) => "thumb-" + i}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.thumbnail,
                      mainImageIndex === index && styles.activeThumbnail,
                    ]}
                    onPress={() => scrollToImage(index)}
                  >
                    <Image
                      source={{ uri: item }}
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.thumbnailContainer}
                showsHorizontalScrollIndicator={false}
              />
            )}

            {/* Photo count label */}
            <Text style={styles.photoCountLabel}>
              {serviceImages.length}{" "}
              {serviceImages.length > 1
                ? t("service.photos")
                : t("service.photo")}{" "}
              {"\u2022"}{" "}
              {serviceImages.length < 5
                ? "up to " +
                  (5 - serviceImages.length) +
                  " " +
                  t("service.moreAllowed")
                : t("service.maxPhotos")}
            </Text>
          </View>

          {/* ─── Service Info Card ──────────────────────────────────────── */}
          <View style={styles.infoCard}>
            <View style={styles.nameAndWishlistRow}>
              <View style={styles.nameContainer}>
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.wishlistButton,
                  isInWishlist("service-" + service.id) &&
                    styles.wishlistButtonActive,
                ]}
                onPress={toggleWishlist}
              >
                <Heart
                  size={20}
                  color={
                    isInWishlist("service-" + service.id)
                      ? colors.status.error
                      : colors.brand.primary
                  }
                  fill={
                    isInWishlist("service-" + service.id)
                      ? colors.status.error
                      : "none"
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Status */}
            <Text
              style={[
                styles.statusAvailability,
                !service.active && { color: colors.status.error },
              ]}
            >
              {service.active
                ? `${t("service.active")} \u2022 ${t("service.available")}`
                : t("service.unavailable")}
            </Text>

            {/* Rating + Category row */}
            <View style={styles.ratingCategoryRow}>
              {service.rating > 0 && (
                <View style={styles.ratingSection}>
                  <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={
                          i < Math.floor(service.rating)
                            ? colors.brand.star
                            : colors.ui.disabled
                        }
                        fill={
                          i < Math.floor(service.rating)
                            ? colors.brand.star
                            : "none"
                        }
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>
                    {service.rating} {"\u2022"} {service.reviewsCount} reviews
                  </Text>
                </View>
              )}
              {service.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{service.category}</Text>
                </View>
              )}
            </View>

            {/* Price + Duration + Provider row */}
            <View style={styles.priceStoreRow}>
              <View style={styles.priceColumn}>
                <Text style={styles.price}>
                  {service.price > 0 ? "\u20B9" + service.price : "FREE"}
                </Text>
                {!!service.originalPrice &&
                  service.originalPrice > service.price && (
                    <Text style={styles.originalPrice}>
                      {"\u20B9"}
                      {service.originalPrice}
                    </Text>
                  )}
                <Text style={styles.stockInfo}>
                  {service.price > 0
                    ? t("service.price")
                    : t("service.complimentary")}
                </Text>
              </View>
              <View style={styles.storeDeliveryColumn}>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeLabel}>
                    {t("service.offeredBy")}
                  </Text>
                  <Text style={styles.storeName}>{service.storeName}</Text>
                </View>
                {service.duration && (
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryLabel}>
                      {t("service.duration")}
                    </Text>
                    <Text style={styles.deliveryTime}>{service.duration}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ─── Description Card ──────────────────────────────────────── */}
          {service.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>
                {t("service.aboutService")}
              </Text>
              {descriptionBullets.length > 1 ? (
                descriptionBullets.map((bullet, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.descriptionText}>{bullet.trim()}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.descriptionText}>
                  {service.description}
                </Text>
              )}
            </View>
          )}

          {/* ─── Service Details Card ─────────────────────────────────── */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>
              {t("service.serviceDetails")}
            </Text>
            {service.duration && (
              <View style={styles.detailRow}>
                <Clock size={16} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>
                    {t("service.duration")}
                  </Text>
                  <Text style={styles.detailValue}>{service.duration}</Text>
                </View>
              </View>
            )}
            <View style={styles.detailRow}>
              <MapPin size={16} color={colors.brand.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>
                  {t("service.serviceProvider")}
                </Text>
                <Text style={styles.detailValue}>
                  {service.storeName} {"\u2022"} {service.distance}
                </Text>
              </View>
            </View>
            {service.reviewsCount > 0 && (
              <View style={styles.detailRow}>
                <Users size={16} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>
                    {t("service.totalReviews")}
                  </Text>
                  <Text style={styles.detailValue}>{service.reviewsCount}</Text>
                </View>
              </View>
            )}
            {service.delivery && (
              <View style={styles.detailRow}>
                <Calendar size={16} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>
                    {t("service.serviceType")}
                  </Text>
                  <Text style={styles.detailValue}>{service.delivery}</Text>
                </View>
              </View>
            )}
          </View>

          {/* ─── Features Card ─────────────────────────────────────────── */}
          {service.features && service.features.length > 0 && (
            <View style={styles.featuresCard}>
              <Text style={styles.sectionTitle}>
                {t("service.keyFeatures")}
              </Text>
              {service.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Check size={14} color={colors.status.successDark} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ─── Related Services ──────────────────────────────────────── */}
          {relatedServices.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>
                {t("service.relatedServices")}
              </Text>
              <FlatList
                horizontal
                data={paginatedRelated}
                keyExtractor={(item) => item.id}
                renderItem={renderRelatedCard}
                contentContainerStyle={styles.relatedList}
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={renderLoadMoreFooter}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews
                getItemLayout={(_, index) => ({
                  length: RELATED_CARD_WIDTH + spacing.md,
                  offset: (RELATED_CARD_WIDTH + spacing.md) * index,
                  index,
                })}
              />
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Success Message */}
      {showSuccessMessage && (
        <View style={styles.successMessage}>
          <Check size={16} color={colors.status.successDark} />
          <Text style={styles.successMessageText}>
            Service {isEditing ? "updated" : "booked"} successfully!
          </Text>
        </View>
      )}

      {/* ─── Bottom Booking Section ──────────────────────────────────── */}
      <View style={styles.bottomCard}>
        {service.active ? (
          isBooked && currentBooking ? (
            currentBooking.status === "pending" ? (
              /* ── Pending: slot locked, awaiting payment ── */
              <View style={styles.bookedContainer}>
                <View style={styles.bookingInfoCard}>
                  <View style={styles.bookingStatusRow}>
                    <Clock size={16} color={colors.status.warningDark} />
                    <Text
                      style={[
                        styles.bookedLabel,
                        { color: colors.status.warningDark },
                      ]}
                    >
                      {t("service.pendingPayment")}
                    </Text>
                  </View>
                  <View style={styles.bookingDateTimeRow}>
                    <Calendar size={14} color={colors.brand.primary} />
                    <Text style={styles.bookingDateText}>
                      {new Date(currentBooking.bookingDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" },
                      )}
                    </Text>
                    <Clock size={14} color={colors.brand.primary} />
                    <Text style={styles.bookingTimeText}>
                      {currentBooking.bookingTime}
                    </Text>
                  </View>
                  <Text style={styles.expiryHint}>
                    {t("service.slotLocked")}
                  </Text>
                </View>
                <View style={styles.bookedActionsRow}>
                  <TouchableOpacity
                    style={styles.payNowButton}
                    onPress={() =>
                      router.push({
                        pathname: "/cart/cart",
                        params: { tab: "services" },
                      } as any)
                    }
                  >
                    <Text style={styles.payNowText}>{t("service.payNow")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBookingButton}
                    onPress={handleCancelBooking}
                  >
                    <X size={16} color={colors.status.error} />
                    <Text style={styles.cancelBookingText}>
                      {t("service.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ── Confirmed booking ── */
              <View style={styles.bookedContainer}>
                <View style={styles.bookingInfoCard}>
                  <View style={styles.bookingStatusRow}>
                    <Check size={16} color={colors.status.successDark} />
                    <Text style={styles.bookedLabel}>
                      {t("service.booked")}
                    </Text>
                  </View>
                  <View style={styles.bookingDateTimeRow}>
                    <Calendar size={14} color={colors.brand.primary} />
                    <Text style={styles.bookingDateText}>
                      {new Date(currentBooking.bookingDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" },
                      )}
                    </Text>
                    <Clock size={14} color={colors.brand.primary} />
                    <Text style={styles.bookingTimeText}>
                      {currentBooking.bookingTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookedActionsRow}>
                  <TouchableOpacity
                    style={styles.changeBookingButton}
                    onPress={() => openBookingModal(true)}
                  >
                    <Edit2 size={16} color={colors.brand.primary} />
                    <Text style={styles.changeBookingText}>
                      {t("service.change")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBookingButton}
                    onPress={handleCancelBooking}
                  >
                    <X size={16} color={colors.status.error} />
                    <Text style={styles.cancelBookingText}>
                      {t("service.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => openBookingModal(false)}
            >
              <Text style={styles.bookButtonText}>
                {t("service.bookService")}
              </Text>
              {service.price > 0 && (
                <Text style={styles.bookButtonPrice}>
                  {"\u20B9"}
                  {service.price}
                </Text>
              )}
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.unavailableButtonBottom}>
            <Text style={styles.unavailableTextBottom}>
              {t("service.serviceUnavailable")}
            </Text>
            <Text style={styles.unavailableSubtext}>
              {t("service.checkBackLater")}
            </Text>
          </View>
        )}
      </View>

      {/* ─── Booking Modal ────────────────────────────────────────────── */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing
                  ? t("service.changeBooking")
                  : t("service.bookService")}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBookingModalVisible(false)}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalServiceInfo}>
              <Text style={styles.modalServiceName}>{service.name}</Text>
              <Text style={styles.modalServicePrice}>
                {service.price > 0 ? "\u20B9" + service.price : "FREE"}
              </Text>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalSectionTitle}>
                {t("service.selectDate")}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScrollView}
              >
                {availableDays.map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.dateCard,
                      selectedDate === day.date && styles.dateCardSelected,
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text
                      style={[
                        styles.dateDayText,
                        selectedDate === day.date && styles.dateTextSelected,
                      ]}
                    >
                      {day.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumText,
                        selectedDate === day.date && styles.dateTextSelected,
                      ]}
                    >
                      {day.dayNum}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonthText,
                        selectedDate === day.date && styles.dateTextSelected,
                      ]}
                    >
                      {day.month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalSectionTitle}>
                {t("service.selectTime")}
              </Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime === time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmBookingBtn}
              onPress={handleConfirmBooking}
            >
              <Check size={20} color={colors.text.inverse} />
              <Text style={styles.confirmBookingText}>
                {isEditing
                  ? t("service.updateBooking")
                  : t("service.confirmBooking")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    ...shadows.small,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors.ui.background,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text.heading },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Not found
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.heading,
  },
  notFoundSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
  },
  notFoundButton: {
    marginTop: spacing.md,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  notFoundButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  // Gallery
  galleryCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.medium,
  },
  galleryImageWrapper: {
    width: SCREEN_WIDTH - spacing.md * 2,
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.ui.backgroundAlt,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    zIndex: 1,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.tint.green,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  discountText: { fontSize: 12, fontWeight: "800", color: colors.text.inverse },
  unavailableBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  unavailableBannerText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text.inverse,
    letterSpacing: 2,
  },
  imageCountBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  imageCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ui.disabled,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  thumbnailContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  activeThumbnail: { borderColor: colors.brand.primary },
  thumbnailImage: { width: "100%", height: "100%" },
  photoCountLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
    textAlign: "center",
    paddingBottom: spacing.sm,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  nameAndWishlistRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  nameContainer: { flex: 1 },
  serviceName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.heading,
    lineHeight: 28,
  },
  wishlistButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  wishlistButtonActive: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.errorLight,
  },
  statusAvailability: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.successDark,
    marginBottom: spacing.md,
  },
  ratingCategoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  ratingStars: { flexDirection: "row", gap: 2 },
  ratingText: { fontSize: 11, fontWeight: "600", color: colors.text.secondary },
  categoryBadge: {
    backgroundColor: colors.tint.purpleLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  priceStoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  priceColumn: { flex: 1 },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.brand.primary,
    marginBottom: spacing.xs,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.tertiary,
    textDecorationLine: "line-through",
    marginBottom: spacing.xs,
  },
  stockInfo: { fontSize: 11, fontWeight: "600", color: colors.text.secondary },
  storeDeliveryColumn: { flex: 1, gap: spacing.sm },
  storeInfo: { gap: spacing.xs },
  storeLabel: { fontSize: 10, fontWeight: "600", color: colors.text.secondary },
  storeName: { fontSize: 12, fontWeight: "700", color: colors.brand.primary },
  deliveryInfo: { gap: spacing.xs },
  deliveryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  deliveryTime: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.successDark,
  },

  // Description
  descriptionCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
    marginTop: 7,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.caption,
    lineHeight: 21,
    flex: 1,
  },

  // Details
  detailsCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: 12,
  },

  // Features
  featuresCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text.caption,
    flex: 1,
    lineHeight: 20,
  },

  // Related services
  relatedSection: { marginTop: spacing.md, marginBottom: spacing.md },
  relatedList: { paddingRight: spacing.sm },
  relatedCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    width: RELATED_CARD_WIDTH,
    marginRight: spacing.md,
    ...shadows.medium,
  },
  relatedImageContainer: {
    position: "relative",
    width: "100%",
    height: 130,
    overflow: "hidden",
    backgroundColor: colors.ui.backgroundAlt,
  },
  relatedImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.ui.backgroundAlt,
  },
  categoryBadgeRelated: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.text.inverse,
    textTransform: "uppercase",
  },
  activeBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.status.successDark,
    justifyContent: "center",
    alignItems: "center",
  },
  activeBadgeText: { fontSize: 16, color: colors.text.inverse },
  relatedDiscountBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  relatedDiscountText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  relatedUnavailable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  relatedUnavailableText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.inverse,
    textAlign: "center",
  },
  relatedInfo: { padding: spacing.md, gap: spacing.sm },
  relatedName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.heading,
    lineHeight: 16,
  },
  relatedRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  relatedRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  relatedRatingText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.warningDark,
  },
  relatedReviews: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.status.warningDark,
  },
  relatedPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  priceDeliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.xs,
  },
  relatedDelivery: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.status.successDark,
    backgroundColor: colors.tint.greenLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    textAlign: "center",
  },
  loadMoreContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  loadMoreButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 130,
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderStyle: "dashed",
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },

  // Bottom section
  bottomCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    ...shadows.large,
  },
  bookButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.medium,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  bookButtonPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  unavailableButtonBottom: {
    backgroundColor: colors.ui.disabled,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableTextBottom: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  unavailableSubtext: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Success message
  successMessage: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.status.successLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 100,
    ...shadows.medium,
  },
  successMessageText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.status.successDark,
  },

  // Booked container
  bookedContainer: { gap: 12 },
  bookingInfoCard: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  bookingStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  bookedLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.status.successDark,
  },
  bookingDateTimeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bookingDateText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
    marginRight: 8,
  },
  bookingTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  bookedActionsRow: { flexDirection: "row", gap: 12 },
  changeBookingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.tint.blueLight,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  changeBookingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  cancelBookingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.status.errorLight,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  cancelBookingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.status.error,
  },
  expiryHint: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.warningDark,
    marginTop: spacing.xs,
  },
  payNowButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  payNowText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.text.heading },
  modalCloseBtn: { padding: 4 },
  modalServiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.ui.backgroundAlt,
  },
  modalServiceName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  modalServicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: 12,
    marginTop: 8,
  },
  dateScrollView: { marginBottom: 16 },
  dateCard: {
    width: 70,
    height: 80,
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  dateCardSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  dateDayText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  dateNumText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginVertical: 2,
  },
  dateMonthText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  dateTextSelected: { color: colors.text.inverse },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  timeSlot: {
    width: "30%",
    paddingVertical: 12,
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  timeSlotSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  timeSlotText: { fontSize: 13, fontWeight: "600", color: colors.text.primary },
  timeSlotTextSelected: { color: colors.text.inverse },
  confirmBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand.primary,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBookingText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
