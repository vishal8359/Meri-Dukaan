// app/wishlist/wishlist.tsx
import { WishlistItem, useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Heart,
    MapPin,
    Minus,
    Package,
    Plus,
    ShoppingCart,
    Star,
    Store,
    Trash2,
    Wrench,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

type TabType = "all" | "product" | "service" | "store";

const TABS: { key: TabType; label: string; icon: any }[] = [
  { key: "all", label: "wishlist.all", icon: Heart },
  { key: "product", label: "wishlist.products", icon: Package },
  { key: "service", label: "wishlist.services", icon: Wrench },
  { key: "store", label: "wishlist.stores", icon: Store },
];

export default function WishlistScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const {
    addToCart,
    cart,
    removeFromCart,
    updateCartQuantity,
    wishlist,
    removeFromWishlist,
    clearWishlist,
    getWishlistByType,
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return wishlist;
    return getWishlistByType(activeTab);
  }, [wishlist, activeTab, getWishlistByType]);

  const tabCounts = useMemo(
    () => ({
      all: wishlist.length,
      product: getWishlistByType("product").length,
      service: getWishlistByType("service").length,
      store: getWishlistByType("store").length,
    }),
    [wishlist, getWishlistByType],
  );

  // Strip type prefix from wishlist IDs to get the original item ID
  const getRawId = (item: WishlistItem): string => {
    return item.id.replace(/^(product|service|store)-/, "");
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (item.type === "store") return;
    addToCart({
      id: getRawId(item),
      name: item.name,
      price: item.price,
      image: item.image,
      storeName: item.storeName,
      storeId: item.storeId,
    });
    Toast.show({
      type: "success",
      text1: "Added to cart",
      text2: `${item.name} added successfully!`,
      visibilityTime: 2000,
      position: "top",
    });
  };

  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}`);
  };

  const navigateToProduct = (productId: string) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: productId },
    } as any);
  };

  const navigateToService = (serviceId: string) => {
    router.push({
      pathname: "/service/[id]",
      params: { id: serviceId },
    } as any);
  };

  const handleItemPress = (item: WishlistItem) => {
    if (item.type === "store" && item.storeId) {
      navigateToStore(item.storeId);
    } else if (item.type === "product") {
      navigateToProduct(getRawId(item));
    } else if (item.type === "service") {
      navigateToService(getRawId(item));
    }
  };

  // --- Product Card ---
  const ProductCard = ({ item }: { item: WishlistItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Package size={32} color={colors.ui.muted} />
            </View>
          )}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>Product</Text>
          </View>
        </View>

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

          {item.rating !== undefined && item.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.brand.star} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.price}>₹{item.price}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        {(() => {
          const rawId = getRawId(item);
          const cartItem = cart.find((c: any) => c.id === rawId);
          if (cartItem && cartItem.quantity > 0) {
            return (
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => {
                    if (cartItem.quantity <= 1) {
                      removeFromCart(rawId);
                      Toast.show({
                        type: "info",
                        text1: "Removed from cart",
                        text2: `${item.name} removed`,
                        visibilityTime: 1500,
                        position: "top",
                      });
                    } else {
                      updateCartQuantity(rawId, cartItem.quantity - 1);
                    }
                  }}
                >
                  <Minus size={16} color={colors.text.inverse} />
                </TouchableOpacity>
                <View style={styles.qtyDisplay}>
                  <Text style={styles.qtyValue}>{cartItem.quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() =>
                    updateCartQuantity(rawId, cartItem.quantity + 1)
                  }
                >
                  <Plus size={16} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => handleAddToCart(item)}
            >
              <ShoppingCart size={16} color={colors.text.inverse} />
              <Text style={styles.cartButtonText}>
                {t("wishlist.addToCart")}
              </Text>
            </TouchableOpacity>
          );
        })()}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            removeFromWishlist(item.id);
            Toast.show({
              type: "info",
              text1: "Removed from wishlist",
              text2: `${item.name} removed`,
              visibilityTime: 1500,
              position: "top",
            });
          }}
        >
          <Trash2 size={18} color={colors.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Service Card ---
  const ServiceCard = ({ item }: { item: WishlistItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Wrench size={32} color={colors.ui.muted} />
            </View>
          )}
          <View style={[styles.typeBadge, styles.serviceBadge]}>
            <Text style={styles.typeBadgeText}>Service</Text>
          </View>
        </View>

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

          {item.duration && (
            <View style={styles.durationRow}>
              <Clock size={12} color={colors.text.secondary} />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          )}

          {item.rating !== undefined && item.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.brand.star} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}

          <Text style={styles.price}>₹{item.price}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.cartButton, styles.bookButton]}
          onPress={() => handleItemPress(item)}
        >
          <Calendar size={16} color={colors.text.inverse} />
          <Text style={styles.cartButtonText}>Book Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            removeFromWishlist(item.id);
            Toast.show({
              type: "info",
              text1: "Removed from wishlist",
              text2: `${item.name} removed`,
              visibilityTime: 1500,
              position: "top",
            });
          }}
        >
          <Trash2 size={18} color={colors.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Store Card ---
  const StoreCard = ({ item }: { item: WishlistItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.storeCardContent}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.storeImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.storeImage} />
          ) : (
            <View style={styles.storePlaceholder}>
              <Store size={40} color={colors.ui.muted} />
            </View>
          )}
          <View style={styles.storeOverlay} />
          <View style={styles.storeCardOverlayContent}>
            <Text style={styles.storeCardName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.storeType && (
              <View style={styles.storeTypeBadge}>
                <Text style={styles.storeTypeText}>{item.storeType}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.storeInfoRow}>
          {item.rating !== undefined && item.rating > 0 && (
            <View style={styles.storeInfoItem}>
              <Star
                size={14}
                color={colors.brand.star}
                fill={colors.brand.star}
              />
              <Text style={styles.storeInfoText}>{item.rating}</Text>
            </View>
          )}
          {item.distance && (
            <View style={styles.storeInfoItem}>
              <MapPin size={14} color={colors.text.secondary} />
              <Text style={styles.storeInfoText}>{item.distance}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.cartButton, styles.visitStoreButton]}
          onPress={() => handleItemPress(item)}
        >
          <Store size={16} color={colors.text.inverse} />
          <Text style={styles.cartButtonText}>Visit Store</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            removeFromWishlist(item.id);
            Toast.show({
              type: "info",
              text1: "Removed from wishlist",
              text2: `${item.name} removed`,
              visibilityTime: 1500,
              position: "top",
            });
          }}
        >
          <Trash2 size={18} color={colors.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: WishlistItem }) => {
    switch (item.type) {
      case "store":
        return <StoreCard item={item} />;
      case "service":
        return <ServiceCard item={item} />;
      case "product":
      default:
        return <ProductCard item={item} />;
    }
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
          <Text style={styles.headerTitle}>{t("wishlist.title")}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <TabIcon
                size={16}
                color={isActive ? colors.brand.primary : colors.text.secondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t(tab.label)}
              </Text>
              {tabCounts[tab.key] > 0 && (
                <View
                  style={[styles.tabCount, isActive && styles.tabCountActive]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      isActive && styles.tabCountTextActive,
                    ]}
                  >
                    {tabCounts[tab.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredItems.length} {t("wishlist.items")}
        </Text>
        {wishlist.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              clearWishlist();
              Toast.show({
                type: "info",
                text1: "Wishlist cleared",
                text2: "All items removed from wishlist",
                visibilityTime: 1500,
                position: "top",
              });
            }}
          >
            <Text style={styles.clearAllText}>{t("wishlist.clearAll")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={64} color={colors.ui.disabled} />
            <Text style={styles.emptyText}>{t("wishlist.empty")}</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "store"
                ? "Save stores you love to visit them later"
                : activeTab === "service"
                  ? "Save services you want to book later"
                  : "Save items you love to buy them later"}
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push("/(drawer)/(tabs)/bazar")}
            >
              <Text style={styles.shopButtonText}>Start Exploring</Text>
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
    backgroundColor: colors.ui.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
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

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
  },
  tabActive: {
    backgroundColor: colors.tint.blueLight,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  tabCount: {
    backgroundColor: colors.ui.muted,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountActive: {
    backgroundColor: colors.brand.primary,
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  tabCountTextActive: {
    color: colors.text.inverse,
  },

  // Stats
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
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

  // List
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  // Common Card
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
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
    backgroundColor: colors.ui.backgroundAlt,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceBadge: {
    backgroundColor: colors.tint.purple,
  },
  typeBadgeText: {
    color: colors.text.inverse,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
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
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  categoryBadge: {
    backgroundColor: colors.ui.backgroundAlt,
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
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },

  // Action Row
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
  bookButton: {
    backgroundColor: colors.tint.purple,
  },
  visitStoreButton: {
    backgroundColor: colors.status.info,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
    backgroundColor: colors.status.errorLight,
  },
  qtyRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  qtyButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyDisplay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    height: 40,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.inverse,
  },

  // Store Card
  storeCardContent: {
    overflow: "hidden",
  },
  storeImageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: colors.ui.backgroundAlt,
    position: "relative",
  },
  storeImage: {
    width: "100%",
    height: "100%",
  },
  storePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  storeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  storeCardOverlayContent: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  storeCardName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.inverse,
    marginBottom: 4,
  },
  storeTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  storeTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  storeInfoRow: {
    flexDirection: "row",
    gap: 16,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  storeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeInfoText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },

  // Empty
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
    textAlign: "center",
    paddingHorizontal: spacing.xl,
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
    color: colors.text.inverse,
  },
});
