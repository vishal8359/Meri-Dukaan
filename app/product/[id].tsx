import { mockProducts, Product } from "@/src/assets/mockData";
import { useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Store,
  Truck,
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
const IMAGE_HEIGHT = 380;
const RELATED_CARD_WIDTH = 165;
const RELATED_BATCH_SIZE = 4;

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
const ProductSkeleton = () => (
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
      {[1, 2, 3, 4].map((i) => (
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
        width="40%"
        height={14}
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

// ─── Related Product Skeleton Card ───────────────────────────────────────────
const RelatedProductSkeleton = () => (
  <View style={[styles.relatedCard, { width: RELATED_CARD_WIDTH }]}>
    <SkeletonBlock width={RELATED_CARD_WIDTH} height={130} borderRadius={0} />
    <View style={{ padding: spacing.md, gap: spacing.sm }}>
      <SkeletonBlock width="85%" height={13} />
      <SkeletonBlock width="50%" height={12} />
      <SkeletonBlock width="60%" height={16} />
    </View>
  </View>
);

// ─── Product Not Found ──────────────────────────────────────────────────────
const ProductNotFound = ({ onBack }: { onBack: () => void }) => {
  const { t } = useSettings();
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <ChevronLeft size={24} color={colors.text.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("product.details")}</Text>
        <View style={styles.headerButton} />
      </View>
      <View style={styles.notFoundContainer}>
        <Package size={64} color={colors.ui.disabled} />
        <Text style={styles.notFoundTitle}>{t("product.notFound")}</Text>
        <Text style={styles.notFoundSubtitle}>{t("product.notFoundDesc")}</Text>
        <TouchableOpacity style={styles.notFoundButton} onPress={onBack}>
          <Text style={styles.notFoundButtonText}>{t("product.goBack")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { id, fallbackData } = useLocalSearchParams<{
    id: string;
    fallbackData?: string;
  }>();
  const {
    addToCart,
    cart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useApp();

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedBatchCount, setRelatedBatchCount] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const imageScrollRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ─── Look up the actual product by ID (with store fallback) ──────────────
  const product = useMemo(() => {
    const found = mockProducts.find((p) => p.id === id);
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
          description:
            parsed.description ||
            `${parsed.name} from ${parsed.storeName || "Store"}`,
          distance: parsed.distance || "Nearby",
          unit: parsed.unit || "1 pc",
          delivery: parsed.delivery || "30-45 min",
          reviews: parsed.reviews || 0,
          rating: parsed.rating || 4.5,
        } as Product;
      } catch {
        /* ignore parse error */
      }
    }
    return null;
  }, [id, fallbackData]);

  // ─── Product images (1 to 5 photos) ─────────────────────────────────────
  const productImages = useMemo(() => {
    if (!product) return [];
    const imgs = product.images?.length
      ? product.images.slice(0, 5) // Max 5 photos
      : [product.image]; // Min 1 photo (fallback to main image)
    return imgs;
  }, [product]);

  // ─── Related products: same category, excluding current ──────────────────
  const allRelatedProducts = useMemo(() => {
    if (!product) return [];
    return mockProducts.filter(
      (p) => p.category === product.category && p.id !== product.id,
    );
  }, [product]);

  // ─── Virtualized batch loading for related products ──────────────────────
  const visibleRelatedProducts = useMemo(
    () => allRelatedProducts.slice(0, relatedBatchCount * RELATED_BATCH_SIZE),
    [allRelatedProducts, relatedBatchCount],
  );

  const hasMoreRelated = useMemo(
    () => visibleRelatedProducts.length < allRelatedProducts.length,
    [visibleRelatedProducts, allRelatedProducts],
  );

  // ─── Load content after navigation transition ───────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setMainImageIndex(0);
    setRelatedBatchCount(1);
    setImageLoaded({});
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

  // ─── Cart check ──────────────────────────────────────────────────────────
  const cartItem = useMemo(
    () => cart.find((item: any) => item.id === product?.id),
    [cart, product?.id],
  );

  // ─── Description bullets ─────────────────────────────────────────────────
  const descriptionBullets = useMemo(() => {
    if (!product?.description) return [];
    const sentences = product.description.split(". ");
    return sentences.slice(0, 5).map((s) => s.replace(/\.$/, "") + ".");
  }, [product?.description]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeName: product.storeName || "Store",
      storeId: product.storeId,
    });
    Toast.show({
      type: "success",
      text1: t("product.addedToCart"),
      text2: `${product.name} added to your cart`,
      visibilityTime: 1500,
      position: "top",
    });
  }, [addToCart, product]);

  const handleIncreaseQuantity = useCallback(() => {
    if (!product || !cartItem) return;
    updateCartQuantity(product.id, cartItem.quantity + 1);
  }, [product, cartItem, updateCartQuantity]);

  const handleDecreaseQuantity = useCallback(() => {
    if (!product || !cartItem) return;
    if (cartItem.quantity <= 1) {
      removeFromCart(product.id);
      Toast.show({
        type: "info",
        text1: t("product.removedFromCart"),
        text2: `${product.name} removed`,
        visibilityTime: 1500,
        position: "top",
      });
    } else {
      updateCartQuantity(product.id, cartItem.quantity - 1);
    }
  }, [product, cartItem, removeFromCart, updateCartQuantity]);

  const toggleWishlist = useCallback(() => {
    if (!product) return;
    const wishlistId = `product-${product.id}`;
    if (isInWishlist(wishlistId)) {
      removeFromWishlist(wishlistId);
      Toast.show({
        type: "info",
        text1: t("product.removedFromWishlist"),
        text2: `${product.name} removed`,
        visibilityTime: 1500,
        position: "top",
      });
    } else {
      addToWishlist({
        id: wishlistId,
        name: product.name,
        price: product.price,
        type: "product",
        image: product.image,
        description: product.description,
        rating: product.rating,
      });
      Toast.show({
        type: "success",
        text1: t("product.addedToWishlist"),
        text2: `${product.name} saved!`,
        visibilityTime: 1500,
        position: "top",
      });
    }
  }, [product, isInWishlist, addToWishlist, removeFromWishlist]);

  const handleNavigateToProduct = useCallback(
    (productId: string) => {
      router.push({
        pathname: "/product/[id]",
        params: { id: productId },
      } as any);
    },
    [router],
  );

  const handleOrderNow = useCallback(() => {
    if (!product) return;
    // Add to cart if not already in it
    if (!cartItem) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        storeName: product.storeName || "Store",
        storeId: product.storeId,
      });
    }
    router.push({
      pathname: "/payments/checkout",
      params: { mode: "product", productId: product.id },
    } as any);
  }, [product, cartItem, addToCart, router]);

  const handleLoadMoreRelated = useCallback(() => {
    if (!hasMoreRelated || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setRelatedBatchCount((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 400);
  }, [hasMoreRelated, isLoadingMore]);

  const onImageScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing.md * 2),
      );
      if (
        index !== mainImageIndex &&
        index >= 0 &&
        index < productImages.length
      ) {
        setMainImageIndex(index);
      }
    },
    [mainImageIndex, productImages.length],
  );

  const scrollToImage = useCallback((index: number) => {
    setMainImageIndex(index);
    imageScrollRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["bottom", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.ui.surface}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text.heading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("product.details")}</Text>
          <View style={styles.headerButton} />
        </View>
        <ProductSkeleton />
      </SafeAreaView>
    );
  }

  // ─── Not Found ────────────────────────────────────────────────────────────
  if (!product) {
    return <ProductNotFound onBack={() => router.back()} />;
  }

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
        <Text style={styles.headerTitle}>{t("product.details")}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Share2 size={20} color={colors.text.heading} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
      >
        {/* Image Gallery (swipeable, 1-5 photos) */}
        <View style={styles.imageSection}>
          <FlatList
            ref={imageScrollRef}
            horizontal
            pagingEnabled
            data={productImages}
            keyExtractor={(_, i) => `img-${i}`}
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
                {!!product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{product.discount}%
                    </Text>
                  </View>
                )}
                {!product.inStock && (
                  <View style={styles.outOfStockBanner}>
                    <Text style={styles.outOfStockBannerText}>
                      OUT OF STOCK
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
          {productImages.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>
                {mainImageIndex + 1}/{productImages.length}
              </Text>
            </View>
          )}

          {/* Dot indicators */}
          {productImages.length > 1 && (
            <View style={styles.dotContainer}>
              {productImages.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, mainImageIndex === i && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Thumbnails row */}
          {productImages.length > 1 && (
            <FlatList
              horizontal
              data={productImages}
              keyExtractor={(_, i) => `thumb-${i}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.thumbnail,
                    mainImageIndex === index && styles.activeThumbnail,
                  ]}
                  onPress={() => scrollToImage(index)}
                >
                  <Image source={{ uri: item }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.thumbnailContainer}
              showsHorizontalScrollIndicator={false}
            />
          )}

          {/* Photo count label */}
          <Text style={styles.photoCountLabel}>
            {productImages.length}{" "}
            {productImages.length > 1
              ? t("product.photos")
              : t("product.photo")}{" "}
            •{" "}
            {productImages.length < 5
              ? `up to ${5 - productImages.length} ${t("product.moreAllowed")}`
              : t("product.maxPhotos")}
          </Text>
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.nameAndWishlistRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.unit && (
                <Text style={styles.unitText}>{product.unit}</Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.wishlistButton,
                isInWishlist(`product-${product.id}`) &&
                  styles.wishlistButtonActive,
              ]}
              onPress={toggleWishlist}
            >
              <Heart
                size={20}
                color={
                  isInWishlist(`product-${product.id}`)
                    ? colors.status.error
                    : colors.brand.primary
                }
                fill={
                  isInWishlist(`product-${product.id}`)
                    ? colors.status.error
                    : "none"
                }
              />
            </TouchableOpacity>
          </View>

          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockBadge,
                product.inStock ? styles.stockInBadge : styles.stockOutBadge,
              ]}
            >
              <View
                style={[
                  styles.stockDot,
                  {
                    backgroundColor: product.inStock
                      ? colors.status.successDark
                      : colors.status.errorDark,
                  },
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  {
                    color: product.inStock
                      ? colors.status.successDark
                      : colors.status.errorDark,
                  },
                ]}
              >
                {product.inStock
                  ? t("product.inStock")
                  : t("product.outOfStock")}
              </Text>
            </View>
            {product.distance && (
              <View style={styles.distanceTag}>
                <MapPin size={11} color={colors.text.secondary} />
                <Text style={styles.distanceText}>{product.distance}</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingCategoryRow}>
            <View style={styles.ratingSection}>
              <View style={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    color={
                      i < Math.floor(product.rating)
                        ? colors.brand.star
                        : colors.ui.disabled
                    }
                    fill={
                      i < Math.floor(product.rating)
                        ? colors.brand.star
                        : "none"
                    }
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {product.rating} • {product.reviews} reviews
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceStoreRow}>
            <View style={styles.priceColumn}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  gap: spacing.sm,
                }}
              >
                <Text style={styles.price}>₹{product.price}</Text>
                {!!product.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{product.originalPrice}
                  </Text>
                )}
              </View>
              {!!product.discount && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>
                    Save ₹{product.originalPrice! - product.price}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.storeDeliveryColumn}>
              <View style={styles.storeInfo}>
                <View style={styles.storeIconRow}>
                  <Store size={12} color={colors.brand.primary} />
                  <Text style={styles.storeLabel}>{t("product.soldBy")}</Text>
                </View>
                <Text style={styles.storeName}>{product.storeName}</Text>
              </View>
              {product.delivery && (
                <View style={styles.deliveryInfo}>
                  <View style={styles.storeIconRow}>
                    <Truck size={12} color={colors.status.successDark} />
                    <Text style={styles.deliveryLabel}>
                      {t("product.delivery")}
                    </Text>
                  </View>
                  <Text style={styles.deliveryTime}>{product.delivery}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Description */}
        {descriptionBullets.length > 0 && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>{t("product.aboutProduct")}</Text>
            {descriptionBullets.map((bullet, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Details Table */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{t("product.productDetails")}</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Package size={16} color={colors.brand.primary} />
              <View>
                <Text style={styles.detailLabel}>{t("product.category")}</Text>
                <Text style={styles.detailValue}>
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}
                </Text>
              </View>
            </View>
            {product.unit && (
              <View style={styles.detailItem}>
                <Clock size={16} color={colors.brand.primary} />
                <View>
                  <Text style={styles.detailLabel}>{t("product.unit")}</Text>
                  <Text style={styles.detailValue}>{product.unit}</Text>
                </View>
              </View>
            )}
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.brand.primary} />
              <View>
                <Text style={styles.detailLabel}>{t("product.distance")}</Text>
                <Text style={styles.detailValue}>{product.distance}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Star size={16} color={colors.brand.star} />
              <View>
                <Text style={styles.detailLabel}>{t("product.rating")}</Text>
                <Text style={styles.detailValue}>
                  {product.rating}/5 ({product.reviews})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Related Products (Virtualized) */}
        {allRelatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {t("product.relatedProducts")}
                </Text>
                <Text style={styles.relatedSubtitle}>
                  More from{" "}
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}{" "}
                  • {allRelatedProducts.length} items
                </Text>
              </View>
            </View>
            <FlatList
              horizontal
              data={visibleRelatedProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedCard}
                  onPress={() => handleNavigateToProduct(item.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.relatedImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.relatedImage}
                    />
                    <View style={styles.categoryBadgeRelated}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category.toUpperCase()}
                      </Text>
                    </View>
                    {!item.inStock && (
                      <View style={styles.relatedOutOfStock}>
                        <Text style={styles.relatedOutOfStockText}>
                          Out of Stock
                        </Text>
                      </View>
                    )}
                    {item.inStock && (
                      <View style={styles.availableBadge}>
                        <Check size={10} color={colors.text.inverse} />
                      </View>
                    )}
                    {item.discount && (
                      <View style={styles.relatedDiscountBadge}>
                        <Text style={styles.relatedDiscountText}>
                          -{item.discount}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.relatedRatingContainer}>
                      <View style={styles.relatedRating}>
                        <Star
                          size={12}
                          color={colors.brand.star}
                          fill={colors.brand.star}
                        />
                        <Text style={styles.relatedRatingText}>
                          {item.rating}
                        </Text>
                      </View>
                      <Text style={styles.relatedReviews}>
                        ({item.reviews})
                      </Text>
                    </View>
                    <View style={styles.priceDeliveryRow}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text style={styles.relatedPrice}>₹{item.price}</Text>
                        {item.originalPrice && (
                          <Text style={styles.relatedOriginalPrice}>
                            ₹{item.originalPrice}
                          </Text>
                        )}
                      </View>
                      {item.delivery && (
                        <Text style={styles.relatedDelivery}>
                          {item.delivery}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.relatedList}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              decelerationRate="fast"
              onEndReached={handleLoadMoreRelated}
              onEndReachedThreshold={0.3}
              ListFooterComponent={() => {
                if (isLoadingMore) {
                  return (
                    <View style={styles.loadMoreContainer}>
                      <RelatedProductSkeleton />
                    </View>
                  );
                }
                if (hasMoreRelated) {
                  return (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={handleLoadMoreRelated}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.loadMoreText}>
                        {t("product.loadMore")}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              }}
              initialNumToRender={3}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={true}
              getItemLayout={(_, index) => ({
                length: RELATED_CARD_WIDTH + spacing.md,
                offset: (RELATED_CARD_WIDTH + spacing.md) * index,
                index,
              })}
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Bottom Cart Section */}
      <View style={styles.bottomCard}>
        {product.inStock ? (
          cartItem && cartItem.quantity > 0 ? (
            /* ── Quantity Control (shown after adding to cart) ── */
            <>
              <View style={styles.cartQuantityRow}>
                <View style={styles.cartQuantityInfo}>
                  <ShoppingCart size={18} color={colors.brand.primary} />
                  <Text style={styles.cartQuantityTotal}>
                    ₹{(product.price * cartItem.quantity).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.cartQuantityControl}>
                  <TouchableOpacity
                    style={styles.cartQtyButton}
                    onPress={handleDecreaseQuantity}
                    activeOpacity={0.7}
                  >
                    <Minus size={20} color={colors.text.inverse} />
                  </TouchableOpacity>
                  <View style={styles.cartQtyDisplay}>
                    <Text style={styles.cartQtyValue}>{cartItem.quantity}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cartQtyButton}
                    onPress={handleIncreaseQuantity}
                    activeOpacity={0.7}
                  >
                    <Plus size={20} color={colors.text.inverse} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.orderNowButton}
                onPress={handleOrderNow}
                activeOpacity={0.85}
              >
                <Text style={styles.orderNowText}>{t("product.orderNow")}</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── Add to Cart & Order Now Buttons (initial state) ── */
            <>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                activeOpacity={0.85}
              >
                <ShoppingCart size={20} color={colors.text.inverse} />
                <Text style={styles.addToCartText}>
                  {t("product.addToCart")}
                </Text>
                <Text style={styles.addToCartPrice}>
                  ₹{product.price.toLocaleString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.orderNowButton}
                onPress={handleOrderNow}
                activeOpacity={0.85}
              >
                <Text style={styles.orderNowText}>{t("product.orderNow")}</Text>
              </TouchableOpacity>
            </>
          )
        ) : (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>{t("product.outOfStock")}</Text>
            <Text style={styles.outOfStockSubtext}>
              {t("product.notifyMe")}
            </Text>
          </View>
        )}
      </View>
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
    paddingTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    ...shadows.small,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text.heading },

  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
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
    marginTop: spacing.md,
  },
  notFoundSubtitle: {
    fontSize: 14,
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
  imageSection: { marginBottom: spacing.lg },
  galleryImageWrapper: {
    width: SCREEN_WIDTH - spacing.md * 2,
    height: IMAGE_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.ui.backgroundAlt,
  },
  mainImage: { width: "100%", height: "100%" },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    zIndex: 1,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  discountText: { fontSize: 12, fontWeight: "800", color: colors.text.inverse },
  outOfStockBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.lg,
  },
  outOfStockBannerText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.inverse,
    letterSpacing: 2,
  },
  imageCountBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  imageCountText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: "700",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ui.border,
    overflow: "hidden",
    marginRight: spacing.sm,
  },
  activeThumbnail: { borderColor: colors.brand.primary, borderWidth: 3 },
  thumbnailImage: { width: "100%", height: "100%" },
  photoCountLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
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
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.heading,
    lineHeight: 28,
  },
  unitText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: 2,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  stockInBadge: { backgroundColor: colors.status.successLight },
  stockOutBadge: { backgroundColor: colors.status.errorLight },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: 12, fontWeight: "700" },
  distanceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.ui.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
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
  divider: {
    height: 1,
    backgroundColor: colors.ui.borderLight,
    marginBottom: spacing.md,
  },
  priceStoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  priceColumn: { flex: 1 },
  price: { fontSize: 26, fontWeight: "800", color: colors.brand.primary },
  originalPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  saveBadge: {
    backgroundColor: colors.tint.greenLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  saveText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.successDark,
  },
  storeDeliveryColumn: { flex: 1, gap: spacing.sm },
  storeInfo: { gap: 2 },
  storeIconRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  storeLabel: { fontSize: 10, fontWeight: "600", color: colors.text.secondary },
  storeName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primary,
    marginLeft: 16,
  },
  deliveryInfo: { gap: 2 },
  deliveryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  deliveryTime: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.status.successDark,
    marginLeft: 16,
  },
  wishlistButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  wishlistButtonActive: {
    borderColor: colors.status.errorBorder,
    backgroundColor: colors.status.errorLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: spacing.md,
  },
  descriptionCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    alignItems: "flex-start",
  },
  bulletDot: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.caption,
    lineHeight: 20,
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "47%",
    backgroundColor: colors.ui.backgroundAlt,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  detailValue: { fontSize: 13, fontWeight: "700", color: colors.text.heading },
  relatedSection: { marginBottom: spacing.lg },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  relatedSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  relatedList: { paddingRight: spacing.sm, gap: spacing.md },
  relatedCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    width: RELATED_CARD_WIDTH,
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
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.text.inverse,
    textTransform: "uppercase",
  },
  availableBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.status.successDark,
    justifyContent: "center",
    alignItems: "center",
  },
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
  relatedOutOfStock: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  relatedOutOfStockText: {
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
  relatedOriginalPrice: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
    textDecorationLine: "line-through",
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
  bottomCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    ...shadows.large,
  },
  cartQuantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartQuantityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cartQuantityTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  cartQuantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cartQtyButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  cartQtyDisplay: {
    minWidth: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  cartQtyValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  addToCartButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    ...shadows.medium,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  addToCartPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  orderNowButton: {
    marginTop: spacing.xs,
    backgroundColor: colors.ui.surface,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  orderNowText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  outOfStockButton: {
    backgroundColor: colors.ui.disabled,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  outOfStockSubtext: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
});
