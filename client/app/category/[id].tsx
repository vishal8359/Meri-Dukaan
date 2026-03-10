// app/category/[id].tsx
import {
    mockProducts,
    mockStores,
    Product,
    PRODUCT_CATEGORIES,
} from "@/src/assets/mockData";
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Grid2x2,
    Heart,
    List,
    MapPin,
    Search,
    ShoppingCart,
    SortAsc,
    Star,
    X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type SortOption =
  | "relevance"
  | "price_low"
  | "price_high"
  | "rating"
  | "distance";

export default function CategoryProductsScreen() {
  const router = useRouter();
  const { id: categoryId } = useLocalSearchParams<{ id: string }>();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } =
    useApp();

  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGrid, setIsGrid] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showSortModal, setShowSortModal] = useState(false);
  const productListRef = useRef<FlatList>(null);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    // Reset scroll to top when category changes
    setTimeout(() => {
      productListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  }, []);

  const currentCategoryInfo = PRODUCT_CATEGORIES.find(
    (c) => c.id === selectedCategory,
  );

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q),
      );
    }

    // Sort
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
        // Relevance - keep as is
        break;
    }

    return products;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
      });
    },
    [addToCart],
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

  const CategoryChip = ({ item }: { item: (typeof PRODUCT_CATEGORIES)[0] }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isSelected && {
            backgroundColor: item.color,
            borderColor: item.color,
          },
        ]}
        onPress={() => handleCategoryChange(item.id)}
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
    );
  };

  const ProductGridCard = ({ item }: { item: Product }) => {
    const wishlisted = isInWishlist(`product-${item.id}`);
    const itemStore = mockStores.find((s) => s.id === item.storeId);
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.id },
          } as any)
        }
        activeOpacity={0.8}
      >
        <View style={styles.gridImageContainer}>
          <Image source={{ uri: item.image }} style={styles.gridImage} />
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleWishlist(item)}
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
          <TouchableOpacity
            style={styles.storeRow}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/dukaan/${item.storeId}`);
            }}
          >
            {itemStore?.image && (
              <Image
                source={{ uri: itemStore.image }}
                style={styles.storeIcon}
              />
            )}
            {!itemStore?.image && (
              <MapPin size={10} color={colors.text.secondary} />
            )}
            <Text style={styles.storeText} numberOfLines={1}>
              {item.storeName} • {item.distance}
            </Text>
          </TouchableOpacity>
          <View style={styles.ratingStoreRow}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <View style={styles.priceCartRow}>
            <View>
              <Text style={styles.price}>₹{item.price}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.addCartBtn}
              onPress={() => handleAddToCart(item)}
            >
              <ShoppingCart size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ProductListCard = ({ item }: { item: Product }) => {
    const wishlisted = isInWishlist(`product-${item.id}`);
    const itemStore = mockStores.find((s) => s.id === item.storeId);
    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.id },
          } as any)
        }
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.listImage} />
        {item.discount && (
          <View style={[styles.discountBadge, { top: 8, left: 8 }]}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
        <View style={styles.listCardContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.storeRow}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/dukaan/${item.storeId}`);
            }}
          >
            {itemStore?.image && (
              <Image
                source={{ uri: itemStore.image }}
                style={styles.storeIcon}
              />
            )}
            {!itemStore?.image && (
              <MapPin size={10} color={colors.text.secondary} />
            )}
            <Text style={styles.storeText} numberOfLines={1}>
              {item.storeName} • {item.distance}
            </Text>
          </TouchableOpacity>
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
              {item.originalPrice && (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={styles.wishlistBtn}
                onPress={() => toggleWishlist(item)}
              >
                <Heart
                  size={16}
                  color={wishlisted ? "#ef4444" : "#94a3b8"}
                  fill={wishlisted ? "#ef4444" : "none"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addCartBtn}
                onPress={() => handleAddToCart(item)}
              >
                <ShoppingCart size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>
            {currentCategoryInfo?.icon || "🛒"}
          </Text>
          <Text style={styles.headerTitle}>
            {currentCategoryInfo?.name || "All Products"}
          </Text>
        </View>
        <Text style={styles.resultCount}>{filteredProducts.length} items</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, stores..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        data={PRODUCT_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryChip item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsList}
        style={styles.categoryChipsContainer}
      />

      {/* Filter/Sort Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowSortModal(!showSortModal)}
        >
          <SortAsc size={16} color={colors.brand.primary} />
          <Text style={styles.filterBtnText}>
            {sortOptions.find((s) => s.key === sortBy)?.label || "Sort"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsGrid(!isGrid)}
        >
          {isGrid ? (
            <List size={20} color={colors.brand.primary} />
          ) : (
            <Grid2x2 size={20} color={colors.brand.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      {showSortModal && (
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
          renderItem={({ item }) => <ProductGridCard item={item} />}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
        />
      ) : (
        <FlatList
          ref={productListRef}
          key="list"
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductListCard item={item} />}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  resultCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  // Search
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#fff",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  // Category Chips
  categoryChipsContainer: {
    minHeight: 48,
    maxHeight: 52,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  categoryChipsList: {
    paddingHorizontal: spacing.md,
    gap: 8,
    alignItems: "center",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    gap: 4,
  },
  categoryChipEmoji: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  // Filter Bar
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.brand.primary + "10",
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.brand.primary + "10",
  },
  // Sort Modal
  sortModal: {
    position: "absolute",
    top: 200,
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
  storeIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#e2e8f0",
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
