import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  displayPrice: string;
  stock: string;
  image: string;
  status: "active" | "out-of-stock";
  description?: string;
  images?: string[];
  storeId?: string;
  storeName?: string;
  rating?: number;
  reviews?: number;
  delivery?: string;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart, cart, addToWishlist, removeFromWishlist, isInWishlist } =
    useApp();
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  // Mock product data - in production, fetch from API based on ID
  const product: Product = {
    id: id as string,
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price: 40,
    displayPrice: "₹40/kg",
    stock: "50 kg",
    image:
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=500",
    status: "active",
    rating: 4.5,
    reviews: 128,
    description:
      "Fresh, organic tomatoes sourced directly from local farmers. Rich in lycopene and vitamin C. Perfect for salads, cooking, or making juices. Hand-picked to ensure quality and freshness. These premium vegetables are delivered fresh to your doorstep.",
    images: [
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=500",
      "https://images.unsplash.com/photo-1649620407859-bfa6aba76e4f?q=80&w=500",
      "https://images.unsplash.com/photo-1592063786241-8b7c1fe79f17?q=80&w=500",
    ],
    storeId: "1",
    storeName: "Sharma Kirana",
  };

  // Expanded related products mock data with 5+ products
  const relatedProducts: Product[] = useMemo(
    () => [
      {
        id: "2",
        name: "Fresh Onions",
        category: "Vegetables",
        price: 30,
        displayPrice: "₹30/kg",
        stock: "80 kg",
        image:
          "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=300",
        status: "active",
        rating: 4.3,
        reviews: 95,
        delivery: "10-15 min",
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
        status: "out-of-stock",
        rating: 4.6,
        reviews: 67,
        delivery: "8-12 min",
      },
      {
        id: "4",
        name: "Fresh Potatoes",
        category: "Vegetables",
        price: 25,
        displayPrice: "₹25/kg",
        stock: "100 kg",
        image:
          "https://images.unsplash.com/photo-1590841795199-c70b8abb5166?q=80&w=300",
        status: "active",
        rating: 4.4,
        reviews: 112,
        delivery: "12-18 min",
      },
      {
        id: "5",
        name: "Garlic",
        category: "Vegetables",
        price: 80,
        displayPrice: "₹80/kg",
        stock: "45 kg",
        image:
          "https://images.unsplash.com/photo-1599599810694-8eb95bbf08b5?q=80&w=300",
        status: "active",
        rating: 4.7,
        reviews: 143,
        delivery: "10-15 min",
      },
      {
        id: "6",
        name: "Bell Peppers",
        category: "Vegetables",
        price: 50,
        displayPrice: "₹50/kg",
        stock: "60 kg",
        image:
          "https://images.unsplash.com/photo-1599599810962-4b706327c735?q=80&w=300",
        status: "active",
        rating: 4.5,
        reviews: 88,
        delivery: "9-14 min",
      },
      {
        id: "7",
        name: "Cucumber",
        category: "Vegetables",
        price: 20,
        displayPrice: "₹20/kg",
        stock: "75 kg",
        image:
          "https://images.unsplash.com/photo-1607623488248-da4e0c51c2e4?q=80&w=300",
        status: "active",
        rating: 4.2,
        reviews: 72,
        delivery: "11-16 min",
      },
    ],
    [],
  );

  // Check if item is already in cart
  const cartItem = useMemo(
    () => cart.find((item: any) => item.id === product.id),
    [cart, product.id],
  );

  // Parse description into bullet points
  const descriptionBullets = useMemo(() => {
    if (!product.description) return [];
    const sentences = product.description.split(". ");
    return sentences.slice(0, 4).map((s) => s.replace(/\.$/, "") + ".");
  }, [product.description]);

  const handleAddToCart = useCallback(() => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        storeName: product.storeName || "Store",
        storeId: product.storeId,
      });
    }
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  }, [quantity, addToCart, product]);

  const handleIncreaseQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const handleDecreaseQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  const toggleWishlist = useCallback(() => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        rating: product.rating,
      });
    }
  }, [
    product.id,
    product.name,
    product.price,
    product.image,
    product.description,
    product.rating,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  ]);

  const handleNavigateToProduct = (productId: string) => {
    // Reset quantity when navigating to a new product
    setQuantity(1);
    router.push({
      pathname: "/product/[id]",
      params: { id: productId },
    } as any);
  };

  // Lazy load only first 5 products
  const visibleRelatedProducts = useMemo(
    () => relatedProducts.slice(0, 5),
    [relatedProducts],
  );

  const RelatedProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => handleNavigateToProduct(item.id)}
      activeOpacity={0.75}
    >
      {/* Image Container with Badge */}
      <View style={styles.relatedImageContainer}>
        <Image source={{ uri: item.image }} style={styles.relatedImage} />

        {/* Category Badge */}
        <View style={styles.categoryBadgeRelated}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>

        {/* Out of Stock Overlay */}
        {item.status === "out-of-stock" && (
          <View style={styles.relatedOutOfStock}>
            <Text style={styles.relatedOutOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Status Indicator */}
        {item.status === "active" && (
          <View style={styles.availableBadge}>
            <Check size={10} color={colors.text.inverse} />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.relatedInfo}>
        {/* Product Name */}
        <Text style={styles.relatedName} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Rating Section */}
        {item.rating && (
          <View style={styles.relatedRatingContainer}>
            <View style={styles.relatedRating}>
              <Star
                size={13}
                color={colors.brand.star}
                fill={colors.brand.star}
              />
              <Text style={styles.relatedRatingText}>{item.rating}</Text>
            </View>
            {item.reviews && (
              <Text style={styles.relatedReviews}>{item.reviews}</Text>
            )}
          </View>
        )}

        {/* Price & Delivery */}
        <View style={styles.priceDeliveryRow}>
          <Text style={styles.relatedPrice}>{item.displayPrice}</Text>
          {item.delivery && (
            <Text style={styles.relatedDelivery}>{item.delivery}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Share2 size={20} color={colors.text.heading} />
        </TouchableOpacity>
      </View>

      {showAddedMessage && (
        <View style={styles.successpMessage}>
          <Check size={18} color={colors.text.inverse} />
          <Text style={styles.successMessageText}>
            {quantity} item{quantity > 1 ? "s" : ""} added to cart!
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Images */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageWrapper}>
            <Image
              source={{
                uri: product.images?.[mainImageIndex] || product.image,
              }}
              style={styles.mainImage}
            />
            {product.status === "out-of-stock" && (
              <View style={styles.outOfStockBanner}>
                <Text style={styles.outOfStockBannerText}>OUT OF STOCK</Text>
              </View>
            )}
            {product.images && product.images.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Text style={styles.imageCountText}>
                  {mainImageIndex + 1}/{product.images.length}
                </Text>
              </View>
            )}
          </View>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <FlatList
              horizontal
              data={product.images}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.thumbnail,
                    mainImageIndex === index && styles.activeThumbnail,
                  ]}
                  onPress={() => setMainImageIndex(index)}
                >
                  <Image source={{ uri: item }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.thumbnailContainer}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          {/* Row 1: Product Name + Wishlist Heart */}
          <View style={styles.nameAndWishlistRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.productName}>{product.name}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.wishlistButton,
                isInWishlist(product.id) && styles.wishlistButtonActive,
              ]}
              onPress={toggleWishlist}
            >
              <Heart
                size={20}
                color={
                  isInWishlist(product.id)
                    ? colors.status.error
                    : colors.brand.primary
                }
                fill={isInWishlist(product.id) ? colors.status.error : "none"}
              />
            </TouchableOpacity>
          </View>

          {/* Row 2: Stock Availability */}
          <Text style={styles.stockAvailability}>
            {product.status === "active"
              ? `${product.stock} • In Stock`
              : "Out of Stock"}
          </Text>

          {/* Row 3: Ratings (Left) + Category (Right) */}
          <View style={styles.ratingCategoryRow}>
            {product.rating && (
              <View style={styles.ratingSection}>
                <View style={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      color={
                        i < Math.floor(product.rating!)
                          ? colors.brand.star
                          : colors.ui.disabled
                      }
                      fill={
                        i < Math.floor(product.rating!)
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
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </View>

          {/* Row 4: Price (Left) + Store & Delivery (Right) */}
          <View style={styles.priceStoreRow}>
            <View style={styles.priceColumn}>
              <Text style={styles.price}>{product.displayPrice}</Text>
              <Text style={styles.stockInfo}>Stock: {product.stock}</Text>
            </View>
            <View style={styles.storeDeliveryColumn}>
              <View style={styles.storeInfo}>
                <Text style={styles.storeLabel}>Sold by</Text>
                <Text style={styles.storeName}>{product.storeName}</Text>
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Delivery</Text>
                <Text style={styles.deliveryTime}>10-15 min </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {descriptionBullets.length > 0 && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>About This Product</Text>
            {descriptionBullets.map((bullet, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Details */}
        {/* <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Availability:</Text>
            <Text style={styles.detailValue}>{product.stock}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text
              style={[
                styles.detailValue,
                product.status === "active"
                  ? styles.statusSuccess
                  : styles.statusError,
              ]}
            >
              {product.status === "active" ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View> */}

        {/* Related Products */}
        {visibleRelatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Products</Text>
            <Text style={styles.relatedSubtitle}>
              More from {product.category}
            </Text>
            <FlatList
              horizontal
              data={visibleRelatedProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RelatedProductCard item={item} />}
              contentContainerStyle={styles.relatedList}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              decelerationRate="fast"
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add to Cart Section */}
      <View style={styles.bottomCard}>
        {product.status === "active" ? (
          <>
            {/* Quantity Control */}
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleDecreaseQuantity}
                >
                  <Minus size={18} color={colors.brand.primary} />
                </TouchableOpacity>

                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleIncreaseQuantity}
                >
                  <Plus size={18} color={colors.brand.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.85}
            >
              <ShoppingCart size={20} color={colors.text.inverse} />
              <Text style={styles.addToCartText}>Add {quantity}x to Cart</Text>
              <Text style={styles.addToCartPrice}>
                ₹{(product.price * quantity).toLocaleString()}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
            <Text style={styles.outOfStockSubtext}>
              Notify me when available
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.heading,
  },
  successpMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.success,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  successMessageText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  mainImageWrapper: {
    position: "relative",
    marginBottom: spacing.md,
  },
  mainImage: {
    width: "100%",
    height: 360,
    borderRadius: radius.lg,
    backgroundColor: colors.ui.backgroundAlt,
  },
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
    bottom: spacing.md,
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
  thumbnailContainer: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ui.border,
    overflow: "hidden",
    marginRight: spacing.sm,
  },
  activeThumbnail: {
    borderColor: colors.brand.primary,
    borderWidth: 3,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
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
  nameContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.heading,
    lineHeight: 28,
  },
  stockAvailability: {
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
  ratingStars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
  },
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
  priceColumn: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.brand.primary,
    marginBottom: spacing.xs,
  },
  stockInfo: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  storeDeliveryColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  storeInfo: {
    gap: spacing.xs,
  },
  storeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  storeName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  deliveryInfo: {
    gap: spacing.xs,
  },
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
  wishlistButton: {
    width: 40,
    height: 40,
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
  relatedSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
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
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statusSuccess: {
    color: colors.status.successDark,
  },
  statusError: {
    color: colors.status.errorDark,
  },
  relatedSection: {
    marginBottom: spacing.lg,
  },
  relatedList: {
    paddingRight: spacing.sm,
    gap: spacing.md,
  },
  relatedCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    width: 155,
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
  relatedInfo: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.heading,
    lineHeight: 15,
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
  relatedRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
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
    fontSize: 14,
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
  bottomCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    ...shadows.large,
  },
  quantitySection: {
    marginBottom: spacing.md,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: spacing.sm,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.background,
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  quantityDisplay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.heading,
  },
  cartSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.tint.purpleLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  cartSummaryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  cartSummaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  addToCartButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
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
