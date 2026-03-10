import { useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    Heart,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Star,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  displayPrice: string;
  stock: string;
  image: string;
  status: "active" | "out-of-stock";
}

interface ProductsSectionProps {
  storeId: string;
  products: Product[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  storeImage?: string;
  storeName?: string;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  storeId,
  products,
  searchQuery: externalSearchQuery = "",
  onSearchChange,
  storeImage,
  storeName = "Store",
}) => {
  const router = useRouter();
  const { t } = useSettings();
  const {
    addToCart,
    cart,
    updateCartQuantity,
    removeFromCart,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  } = useApp();
  const [localSearchQuery, setLocalSearchQuery] = React.useState("");
  const searchQuery = externalSearchQuery || localSearchQuery;

  // Get cart quantity for a product
  const getCartQuantity = useCallback(
    (productId: string) => {
      const cartItemId = `${storeId}-${productId}`;
      const cartItem = cart.find((item: any) => item.id === cartItemId);
      return cartItem?.quantity || 0;
    },
    [cart, storeId],
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      if (onSearchChange) {
        onSearchChange(text);
      } else {
        setLocalSearchQuery(text);
      }
    },
    [onSearchChange],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({
        id: `${storeId}-${product.id}`,
        name: product.name,
        price: product.price,
        image: product.image,
        storeName: storeName,
        storeId: storeId,
      });
      // Show toast notification
      Toast.show({
        type: "success",
        text1: t("prodSection.addedToCart"),
        text2: `${product.name} ${t("prodSection.addedSuccess")}`,
        visibilityTime: 2000,
        position: "top",
      });
    },
    [storeId, addToCart, storeName],
  );

  const handleWishlistToggle = useCallback(
    (product: Product) => {
      const wishlistId = `product-${product.id}`;
      if (isInWishlist(wishlistId)) {
        removeFromWishlist(wishlistId);
        Toast.show({
          type: "info",
          text1: t("prodSection.removedFromWishlist"),
          text2: `${product.name} ${t("prodSection.removed")}`,
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
          storeName: storeName,
          storeId: storeId,
          category: product.category,
        });
        Toast.show({
          type: "success",
          text1: t("prodSection.addedToWishlist"),
          text2: `${product.name} ${t("prodSection.saved")}`,
          visibilityTime: 1500,
          position: "top",
        });
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist, storeId, storeName],
  );

  const handleIncreaseQuantity = useCallback(
    (product: Product) => {
      const cartItemId = `${storeId}-${product.id}`;
      const currentQty = getCartQuantity(product.id);
      updateCartQuantity(cartItemId, currentQty + 1);
    },
    [storeId, getCartQuantity, updateCartQuantity],
  );

  const handleDecreaseQuantity = useCallback(
    (product: Product) => {
      const cartItemId = `${storeId}-${product.id}`;
      const currentQty = getCartQuantity(product.id);
      if (currentQty > 1) {
        updateCartQuantity(cartItemId, currentQty - 1);
      } else {
        removeFromCart(cartItemId);
        Toast.show({
          type: "info",
          text1: t("prodSection.removedFromCart"),
          text2: `${product.name} ${t("prodSection.removed")}`,
          visibilityTime: 1500,
          position: "top",
        });
      }
    },
    [storeId, getCartQuantity, updateCartQuantity, removeFromCart],
  );

  const handleProductPress = useCallback(
    (product: Product) => {
      router.push({
        pathname: "/product/[id]",
        params: {
          id: product.id,
          storeId: storeId,
          fallbackData: JSON.stringify({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            storeId: storeId,
            storeName: storeName,
            inStock: product.status === "active",
            rating: 4.5,
            reviews: 0,
          }),
        },
      } as any);
    },
    [router, storeId, storeName],
  );

  const getItemLayout = useCallback(
    (data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: 180,
      offset: 180 * index,
      index,
    }),
    [],
  );

  const ProductCard = ({ item }: { item: Product }) => {
    const cartQuantity = getCartQuantity(item.id);
    const isInCart = cartQuantity > 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.productRow}>
          <View style={styles.productImageContainer}>
            {item.image.startsWith("http") ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                progressiveRenderingEnabled
                resizeMode="cover"
                defaultSource={{
                  uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                }}
              />
            ) : (
              <Text style={styles.productEmoji}>{item.image}</Text>
            )}
          </View>

          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.productHeaderRight}>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "active"
                      ? styles.badgeSuccess
                      : styles.badgeError,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === "active"
                        ? styles.textSuccess
                        : styles.textError,
                    ]}
                  >
                    {item.status === "active"
                      ? t("prodSection.inStock")
                      : t("prodSection.outOfStock")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.wishlistBtn}
                  onPress={() => handleWishlistToggle(item)}
                >
                  <Heart
                    size={18}
                    color={
                      isInWishlist(`product-${item.id}`)
                        ? colors.status.error
                        : colors.ui.muted
                    }
                    fill={
                      isInWishlist(`product-${item.id}`)
                        ? colors.status.error
                        : "none"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.categoryRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryTag}>{item.category}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star
                  size={11}
                  color={colors.brand.star}
                  fill={colors.brand.star}
                />
                <Text style={styles.rating}>4.5</Text>
              </View>
            </View>

            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>{item.displayPrice}</Text>
              <Text style={styles.deliveryBadge}>
                {t("prodSection.freeDelivery")}
              </Text>
            </View>
          </View>
        </View>

        {/* Show quantity controls if in cart, otherwise show Add to Cart button */}
        {item.status === "active" &&
          (isInCart ? (
            <View style={styles.quantityControlContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => handleDecreaseQuantity(item)}
              >
                <Minus size={16} color={colors.brand.primary} />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{cartQuantity}</Text>
              </View>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => handleIncreaseQuantity(item)}
              >
                <Plus size={16} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => handleAddToCart(item)}
            >
              <ShoppingCart size={16} color={colors.text.inverse} />
              <Text style={styles.addToCartBtnText}>
                {t("prodSection.addToCart")}
              </Text>
            </TouchableOpacity>
          ))}
      </TouchableOpacity>
    );
  };

  const StoreBanner = () => (
    <View style={styles.storeBannerContainer}>
      {storeImage && (
        <Image
          source={{ uri: storeImage }}
          style={styles.bannerImage}
          progressiveRenderingEnabled
          resizeMode="cover"
        />
      )}
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle} numberOfLines={1}>
          {storeName}
        </Text>
        <Text style={styles.bannerSubtitle}>
          {t("prodSection.browseProducts")}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search bar shown only when NOT controlled by parent */}
      {!onSearchChange && (
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.ui.muted} style={styles.searchIcon} />
          <TextInput
            placeholder={t("prodSection.searchProducts")}
            style={styles.searchInput}
            placeholderTextColor={colors.ui.muted}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.productsList}
        ListHeaderComponent={<StoreBanner />}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        // Performance optimizations
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("prodSection.noProducts")}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  storeBannerContainer: {
    height: 180,
    marginBottom: 20,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.ui.backgroundAlt,
    ...shadows.medium,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  bannerContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.inverse,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  productsList: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  productCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
    marginHorizontal: 1,
  },
  productRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  productImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productEmoji: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.heading,
    flex: 1,
    marginRight: 8,
  },
  productHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  wishlistBtn: {
    padding: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: colors.status.successLight,
  },
  badgeError: {
    backgroundColor: colors.status.errorBorder,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  textSuccess: {
    color: colors.status.successDark,
  },
  textError: {
    color: colors.status.errorDark,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.tint.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
  },
  categoryTag: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.tint.orangeLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.status.warningDark,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  deliveryBadge: {
    fontSize: 11,
    color: colors.status.successDark,
    fontWeight: "600",
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brand.primaryLight,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  quantityControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.ui.backgroundAlt,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ui.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
