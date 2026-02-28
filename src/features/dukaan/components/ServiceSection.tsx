import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { Clock, Heart, Plus, Star, Store } from "lucide-react-native";
import React, { useCallback } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Service {
  id: string;
  name: string;
  description: string;
  active: boolean;
  price: number;
  image?: string;
  duration?: string;
  rating?: number;
}

interface ServicesSectionProps {
  services: Service[];
  onBookService?: (service: Service) => void;
  storeImage?: string;
  storeName?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onBookService,
  storeImage,
  storeName = "Store",
}) => {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  const handleServicePress = useCallback(
    (service: Service) => {
      router.push({
        pathname: "/service/[id]",
        params: { id: service.id },
      } as any);
    },
    [router],
  );

  const handleBookService = useCallback(
    (service: Service) => {
      onBookService?.(service);
    },
    [onBookService],
  );

  const handleWishlistToggle = useCallback(
    (service: Service, e: any) => {
      e.stopPropagation();

      if (isInWishlist(service.id)) {
        removeFromWishlist(service.id);
      } else {
        addToWishlist({
          id: service.id,
          name: service.name,
          price: service.price,
          description: service.description,
          image: service.image,
          rating: service.rating,
        });
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  );

  const getItemLayout = useCallback(
    (data: ArrayLike<Service> | null | undefined, index: number) => ({
      length: 160,
      offset: 160 * index,
      index,
    }),
    [],
  );
  const ServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.serviceImage}
          progressiveRenderingEnabled
          resizeMode="cover"
        />
      )}

      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceNameRow}>
              <Store size={16} color={colors.tint.purple} />
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.serviceDescription} numberOfLines={1}>
              {item.description}
            </Text>

            {item.duration && (
              <View style={styles.durationBadge}>
                <Clock size={12} color={colors.tint.purple} />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.wishlistBtn}
              onPress={(e) => handleWishlistToggle(item, e)}
            >
              <Heart
                size={20}
                color={
                  isInWishlist(item.id) ? colors.status.error : colors.ui.muted
                }
                fill={isInWishlist(item.id) ? colors.status.error : "none"}
              />
            </TouchableOpacity>
            <View
              style={[
                styles.statusBadge,
                item.active ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <Text style={styles.statusText}>
                {item.active ? "Available" : "Unavailable"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.serviceFooter}>
          <View style={styles.priceAndRating}>
            {item.price > 0 && (
              <Text style={styles.servicePrice}>₹{item.price}</Text>
            )}
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Star
                  size={12}
                  color={colors.brand.star}
                  fill={colors.brand.star}
                />
                <Text style={styles.serviceRating}>{item.rating}</Text>
              </View>
            )}
          </View>

          {item.active && (
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleBookService(item)}
            >
              <Plus size={14} color={colors.text.inverse} />
              <Text style={styles.bookText}>Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
        <Text style={styles.bannerSubtitle}>Book our premium services</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard item={item} />}
        contentContainerStyle={styles.servicesList}
        ListHeaderComponent={<StoreBanner />}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        // Performance optimizations
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services available</Text>
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
  servicesList: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  serviceCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
    marginHorizontal: 1,
  },
  serviceImage: {
    width: "100%",
    height: 120,
    backgroundColor: colors.ui.backgroundAlt,
  },
  serviceContent: {
    padding: 14,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  wishlistBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.heading,
    flex: 1,
  },
  serviceDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.tint.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  durationText: {
    fontSize: 11,
    color: colors.tint.purple,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: colors.status.successLight,
  },
  badgeInactive: {
    backgroundColor: colors.ui.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  statusText: {
    fontSize: 10,
    color: colors.text.caption,
    fontWeight: "600",
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceAndRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.tint.orangeLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceRating: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.status.warningDark,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.brand.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bookText: {
    fontSize: 12,
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
