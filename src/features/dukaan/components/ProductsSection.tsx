import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { Search, ShoppingCart, Star } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
  const { addToCart } = useApp();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery || localSearchQuery;

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
    },
    [storeId, addToCart, storeName],
  );

  const handleProductPress = useCallback(
    (product: Product) => {
      router.push({
        pathname: "/product/[id]",
        params: { id: product.id, storeId: storeId },
      } as any);
    },
    [router, storeId],
  );

  const getItemLayout = useCallback(
    (data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: 180,
      offset: 180 * index,
      index,
    }),
    [],
  );

  const ProductCard = ({ item }: { item: Product }) => (
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
                {item.status === "active" ? "✓ In Stock" : "Out of Stock"}
              </Text>
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
            <Text style={styles.deliveryBadge}>📦 Free Delivery</Text>
          </View>
        </View>
      </View>

      {item.status === "active" && (
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => handleAddToCart(item)}
        >
          <ShoppingCart size={16} color={colors.text.inverse} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

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
        <Text style={styles.bannerSubtitle}>Browse our amazing products</Text>
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
            placeholder="Search products..."
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
            <Text style={styles.emptyText}>No products found</Text>
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
  addToCartText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.inverse,
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
