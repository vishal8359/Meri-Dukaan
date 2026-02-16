// app/wishlist.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react-native";
import React from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WishlistScreen() {
  const router = useRouter();
  const { addToCart, wishlist, removeFromWishlist } = useApp();

  const handleAddToCart = (item: any) => {
    if (item.inStock !== false) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
      });
      // Show success feedback (you can add toast/snackbar here)
    }
  };

  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}`);
  };

  const WishlistCard = ({ item }: { item: any }) => {
    const discount = item.originalPrice
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : 0;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => item.storeId && navigateToStore(item.storeId)}
          activeOpacity={0.7}
        >
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.image} />
            )}
            {!item.inStock && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>

            {item.storeName && (
              <TouchableOpacity
                onPress={() => item.storeId && navigateToStore(item.storeId)}
              >
                <Text style={styles.storeName}>{item.storeName}</Text>
              </TouchableOpacity>
            )}

            {item.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#E9C46A" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                {item.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.price}>₹{item.price}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.cartButton,
              item.inStock === false && styles.disabledButton,
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={item.inStock === false}
          >
            <ShoppingCart size={16} color="#FFF" />
            <Text style={styles.cartButtonText}>
              {item.inStock !== false ? "Add to Cart" : "Out of Stock"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeFromWishlist(item.id)}
          >
            <Trash2 size={18} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Heart
            size={20}
            color={colors.status.error}
            fill={colors.status.error}
          />
          <Text style={styles.headerTitle}>My Wishlist</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </Text>
        {wishlist.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WishlistCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>
              Save items you love to buy them later
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push("/(drawer)/(tabs)/bazar")}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFF",
    ...shadows.small,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statsText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.status.error,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: spacing.md,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.status.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  infoSection: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  categoryBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: 0,
  },
  cartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  shopButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});
