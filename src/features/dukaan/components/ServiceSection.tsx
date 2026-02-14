import { colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { Clock, Plus, Star, Store } from "lucide-react-native";
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
              <Store size={16} color="#6366f1" />
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.serviceDescription} numberOfLines={1}>
              {item.description}
            </Text>

            {item.duration && (
              <View style={styles.durationBadge}>
                <Clock size={12} color="#8b5cf6" />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            )}
          </View>

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

        <View style={styles.serviceFooter}>
          <View style={styles.priceAndRating}>
            {item.price > 0 && (
              <Text style={styles.servicePrice}>₹{item.price}</Text>
            )}
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Star size={12} color="#FFB800" fill="#FFB800" />
                <Text style={styles.serviceRating}>{item.rating}</Text>
              </View>
            )}
          </View>

          {item.active && (
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleBookService(item)}
            >
              <Plus size={14} color="#FFF" />
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
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    color: "#fff",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8ecf1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 1,
  },
  serviceImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f1f5f9",
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
    color: "#1e293b",
    flex: 1,
  },
  serviceDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  durationText: {
    fontSize: 11,
    color: "#7c3aed",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: "#dcfce7",
  },
  badgeInactive: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusText: {
    fontSize: 10,
    color: "#334155",
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
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceRating: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b45309",
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
    color: "#FFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
