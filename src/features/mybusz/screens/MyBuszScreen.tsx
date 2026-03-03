// src/features/mybusz/screens/MyBuszScreen.tsx
import {
    mockProducts,
    Product,
    PRODUCT_CATEGORIES,
} from "@/src/assets/mockData";
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Grid2x2,
    Heart,
    List,
    MapPin,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    SortAsc,
    Star,
    X,
} from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type SortOption =
  | "relevance"
  | "price_low"
  | "price_high"
  | "rating"
  | "distance";

// ── Memoized sub-components (outside parent to avoid re-creation) ──

const CategoryChipItem = memo(
  ({
    item,
    isSelected,
    onPress,
  }: {
    item: (typeof PRODUCT_CATEGORIES)[0];
    isSelected: boolean;
    onPress: (id: string) => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        isSelected && {
          backgroundColor: item.color,
          borderColor: item.color,
        },
      ]}
      onPress={() => onPress(item.id)}
    >
      <Text style={styles.categoryChipEmoji}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryChipText,
          isSelected && { color: "#fff", fontWeight: "800" },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ),
);

const ProductGridCardItem = memo(
  ({
    item,
    wishlisted,
    cartQty,
    onPress,
    onToggleWishlist,
    onAddToCart,
    onIncrease,
    onDecrease,
  }: {
    item: Product;
    wishlisted: boolean;
    cartQty: number;
    onPress: (item: Product) => void;
    onToggleWishlist: (item: Product) => void;
    onAddToCart: (item: Product) => void;
    onIncrease: (item: Product) => void;
    onDecrease: (item: Product) => void;
  }) => {
    const isInCart = cartQty > 0;
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.gridImageContainer}>
          <Image source={{ uri: item.image }} style={styles.gridImage} />
          {item.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => onToggleWishlist(item)}
          >
            <Heart
              size={18}
              color={wishlisted ? "#ef4444" : "#94a3b8"}
              fill={wishlisted ? "#ef4444" : "none"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.gridCardContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.storeRow}>
            <MapPin size={10} color={colors.text.secondary} />
            <Text style={styles.storeText} numberOfLines={1}>
              {item.storeName} • {item.distance}
            </Text>
          </View>
          <View style={styles.ratingStoreRow}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <View style={styles.priceCartRow}>
            <View>
              <Text style={styles.price}>₹{item.price}</Text>
              {item.originalPrice ? (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              ) : null}
            </View>
            {isInCart ? (
              <View style={styles.qtyBar}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => onDecrease(item)}
                >
                  <Minus size={12} color={colors.brand.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{cartQty}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => onIncrease(item)}
                >
                  <Plus size={12} color={colors.brand.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addCartBtn}
                onPress={() => onAddToCart(item)}
              >
                <ShoppingCart size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const ProductListCardItem = memo(
  ({
    item,
    wishlisted,
    cartQty,
    onPress,
    onToggleWishlist,
    onAddToCart,
    onIncrease,
    onDecrease,
  }: {
    item: Product;
    wishlisted: boolean;
    cartQty: number;
    onPress: (item: Product) => void;
    onToggleWishlist: (item: Product) => void;
    onAddToCart: (item: Product) => void;
    onIncrease: (item: Product) => void;
    onDecrease: (item: Product) => void;
  }) => {
    const isInCart = cartQty > 0;
    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.listImage} />
        {item.discount ? (
          <View style={[styles.discountBadge, { top: 8, left: 8 }]}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        ) : null}
        <View style={styles.listCardContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.storeRow}>
            <MapPin size={10} color={colors.text.secondary} />
            <Text style={styles.storeText} numberOfLines={1}>
              {item.storeName} • {item.distance}
            </Text>
          </View>
          <View style={styles.ratingStoreRow}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <View style={styles.priceCartRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.price}>₹{item.price}</Text>
              {item.originalPrice ? (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={styles.wishlistBtn}
                onPress={() => onToggleWishlist(item)}
              >
                <Heart
                  size={16}
                  color={wishlisted ? "#ef4444" : "#94a3b8"}
                  fill={wishlisted ? "#ef4444" : "none"}
                />
              </TouchableOpacity>
              {isInCart ? (
                <View style={styles.qtyBar}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onDecrease(item)}
                  >
                    <Minus size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{cartQty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onIncrease(item)}
                  >
                    <Plus size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addCartBtn}
                  onPress={() => onAddToCart(item)}
                >
                  <ShoppingCart size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function MyBuszScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const {
    addToCart,
    cart,
    updateCartQuantity,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState(
    category && PRODUCT_CATEGORIES.some((c) => c.id === category)
      ? category
      : "all",
  );

  // Sync when navigating from HomeScreen with a new category param
  useEffect(() => {
    if (category && PRODUCT_CATEGORIES.some((c) => c.id === category)) {
      setSelectedCategory(category);
    }
  }, [category]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGrid, setIsGrid] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showSortModal, setShowSortModal] = useState(false);
  const productListRef = useRef<FlatList>(null);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setTimeout(() => {
      productListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  }, []);

  const currentCategoryInfo = PRODUCT_CATEGORIES.find(
    (c) => c.id === selectedCategory,
  );

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (selectedCategory !== "all") {
      products = products.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case "price_low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        products.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
        );
        break;
      default:
        break;
    }

    return products;
  }, [selectedCategory, searchQuery, sortBy]);

  // Build a map of product id → cart quantity for O(1) lookups
  const cartQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item: any) => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [cart]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      Toast.show({
        type: "success",
        text1: "Added to cart",
        text2: `${product.name} added successfully!`,
        visibilityTime: 1500,
        position: "top",
      });
    },
    [addToCart],
  );

  const handleIncreaseQuantity = useCallback(
    (product: Product) => {
      const currentQty = cartQtyMap[product.id] || 0;
      updateCartQuantity(product.id, currentQty + 1);
    },
    [cartQtyMap, updateCartQuantity],
  );

  const handleDecreaseQuantity = useCallback(
    (product: Product) => {
      const currentQty = cartQtyMap[product.id] || 0;
      if (currentQty > 1) {
        updateCartQuantity(product.id, currentQty - 1);
      } else {
        removeFromCart(product.id);
        Toast.show({
          type: "info",
          text1: "Removed from cart",
          text2: `${product.name} removed`,
          visibilityTime: 1500,
          position: "top",
        });
      }
    },
    [cartQtyMap, updateCartQuantity, removeFromCart],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const wishlistId = `product-${product.id}`;
      if (isInWishlist(wishlistId)) {
        removeFromWishlist(wishlistId);
        Toast.show({
          type: "info",
          text1: "Removed from wishlist",
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
          rating: product.rating,
        });
        Toast.show({
          type: "success",
          text1: "Added to wishlist",
          text2: `${product.name} saved!`,
          visibilityTime: 1500,
          position: "top",
        });
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  );

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "relevance", label: "Relevance" },
    { key: "price_low", label: "Price: Low to High" },
    { key: "price_high", label: "Price: High to Low" },
    { key: "rating", label: "Highest Rated" },
    { key: "distance", label: "Nearest First" },
  ];

  const handleProductPress = useCallback(
    (item: Product) => {
      router.push({
        pathname: "/product/[id]",
        params: { id: item.id },
      } as any);
    },
    [router],
  );

  const renderGridItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductGridCardItem
        item={item}
        wishlisted={isInWishlist(`product-${item.id}`)}
        cartQty={cartQtyMap[item.id] || 0}
        onPress={handleProductPress}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onIncrease={handleIncreaseQuantity}
        onDecrease={handleDecreaseQuantity}
      />
    ),
    [
      cartQtyMap,
      isInWishlist,
      handleProductPress,
      toggleWishlist,
      handleAddToCart,
      handleIncreaseQuantity,
      handleDecreaseQuantity,
    ],
  );

  const renderListItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductListCardItem
        item={item}
        wishlisted={isInWishlist(`product-${item.id}`)}
        cartQty={cartQtyMap[item.id] || 0}
        onPress={handleProductPress}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onIncrease={handleIncreaseQuantity}
        onDecrease={handleDecreaseQuantity}
      />
    ),
    [
      cartQtyMap,
      isInWishlist,
      handleProductPress,
      toggleWishlist,
      handleAddToCart,
      handleIncreaseQuantity,
      handleDecreaseQuantity,
    ],
  );

  const renderCategoryChip = useCallback(
    ({ item }: { item: (typeof PRODUCT_CATEGORIES)[0] }) => (
      <CategoryChipItem
        item={item}
        isSelected={selectedCategory === item.id}
        onPress={handleCategoryChange}
      />
    ),
    [selectedCategory, handleCategoryChange],
  );

  return (
    <View style={styles.container}>
      {/* Compact Search + Sort + View Row */}
      <View style={styles.toolbarRow}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowSortModal(!showSortModal)}
        >
          <SortAsc size={14} color={colors.brand.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsGrid(!isGrid)}
        >
          {isGrid ? (
            <List size={18} color={colors.brand.primary} />
          ) : (
            <Grid2x2 size={18} color={colors.brand.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        data={PRODUCT_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryChip}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsList}
        style={styles.categoryChipsContainer}
      />

      {/* Sort Modal */}
      {showSortModal && (
        <>
          <Pressable
            style={styles.sortOverlay}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.sortModal}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortBy === option.key && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different category or search term
          </Text>
        </View>
      ) : isGrid ? (
        <FlatList
          ref={productListRef}
          key="grid"
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderGridItem}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
          extraData={cartQtyMap}
        />
      ) : (
        <FlatList
          ref={productListRef}
          key="list"
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
          extraData={cartQtyMap}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  // Toolbar Row (search + sort + view)
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: "#fff",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: radius.md,
    paddingHorizontal: 10,
    gap: 6,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "500",
    paddingVertical: 0,
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.brand.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  viewToggle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.brand.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  // Category Chips
  categoryChipsContainer: {
    minHeight: 40,
    maxHeight: 42,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  categoryChipsList: {
    paddingHorizontal: spacing.sm,
    gap: 6,
    alignItems: "center",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    gap: 3,
  },
  categoryChipEmoji: {
    fontSize: 12,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  // Sort Modal
  sortOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  sortModal: {
    position: "absolute",
    top: 130,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: spacing.sm,
    zIndex: 100,
    ...shadows.large,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: colors.brand.primary + "15",
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  sortOptionTextActive: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  // Product Grid
  productList: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.small,
  },
  gridImageContainer: {
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    backgroundColor: "#f1f5f9",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridCardContent: {
    padding: spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  storeText: {
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
  },
  ratingStoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  reviewsText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  priceCartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.text.secondary,
    textDecorationLine: "line-through",
  },
  addCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary + "12",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand.primary + "30",
    height: 32,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 28,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.brand.primary,
    minWidth: 20,
    textAlign: "center",
  },
  wishlistBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  // List View
  listCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.small,
    position: "relative",
  },
  listImage: {
    width: 120,
    height: 120,
    backgroundColor: "#f1f5f9",
  },
  listCardContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: "space-between",
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
