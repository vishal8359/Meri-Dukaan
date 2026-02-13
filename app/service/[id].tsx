import { colors, radius } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ChevronLeft,
    Clock,
    Heart,
    MapPin,
    Share2,
    Star,
    Users,
} from "lucide-react-native";
import React, { useState } from "react";
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

interface Service {
  id: string;
  name: string;
  description: string;
  active: boolean;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  duration?: string;
  rating?: number;
  reviewsCount?: number;
  storeName?: string;
  storeId?: string;
  features?: string[];
}

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Mock service data - in production, fetch from API based on ID
  const service: Service = {
    id: id as string,
    name: "Home Delivery",
    description:
      "Fast and reliable home delivery service for all your purchases. We ensure safe packaging and timely delivery to your doorstep.",
    active: true,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1427915591429-7f13a6cc2cc3?q=80&w=500",
    images: [
      "https://images.unsplash.com/photo-1427915591429-7f13a6cc2cc3?q=80&w=500",
      "https://images.unsplash.com/photo-1522202176988-a630cebafebc?q=80&w=500",
      "https://images.unsplash.com/photo-1604507209433-bc10e3c35b08?q=80&w=500",
    ],
    category: "Delivery",
    duration: "24-48 hours",
    rating: 4.8,
    reviewsCount: 1250,
    storeName: "Sharma Kirana",
    storeId: "1",
    features: [
      "Free delivery over ₹500",
      "Real-time tracking",
      "Safe packaging",
      "Professional delivery agents",
      "Insured deliveries",
    ],
  };

  // Related services mock data
  const relatedServices: Service[] = [
    {
      id: "2",
      name: "Same Day Delivery",
      description: "Get your order delivered the same day. Order before 5 PM.",
      active: true,
      price: 50,
      image:
        "https://images.unsplash.com/photo-1565033595900-6ad46f6f8217?q=80&w=300",
      category: "Delivery",
      duration: "Same day",
      rating: 4.7,
      reviewsCount: 892,
    },
    {
      id: "3",
      name: "Bulk Orders",
      description: "Special pricing for bulk and wholesale orders.",
      active: false,
      price: 0,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=300",
      category: "Special",
      duration: "1-3 days",
      rating: 4.6,
      reviewsCount: 456,
    },
    {
      id: "4",
      name: "Express Delivery",
      description: "Ultra-fast delivery for urgent orders.",
      active: true,
      price: 100,
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300",
      category: "Delivery",
      duration: "2-4 hours",
      rating: 4.9,
      reviewsCount: 678,
    },
  ];

  const handleBookService = () => {
    alert(`Booked: ${service.name}`);
  };

  const handleNavigateToService = (serviceId: string) => {
    router.push({
      pathname: "/service/[id]",
      params: { id: serviceId },
    } as any);
  };

  const RelatedServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => handleNavigateToService(item.id)}
    >
      <Image
        source={{ uri: item.image || service.image }}
        style={styles.relatedImage}
      />
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Star size={12} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.rating}>{item.rating?.toFixed(1)}</Text>
        </View>
        {item.price > 0 && (
          <Text style={styles.relatedPrice}>₹{item.price}</Text>
        )}
        <View
          style={[
            styles.relatedStatus,
            item.active ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text style={styles.statusText}>
            {item.active ? "Available" : "Unavailable"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Service Images */}
        <View style={styles.imageSection}>
          <Image
            source={{
              uri: service.images?.[mainImageIndex] || service.image,
            }}
            style={styles.mainImage}
          />

          {/* Image Thumbnails */}
          {service.images && service.images.length > 1 && (
            <FlatList
              horizontal
              data={service.images}
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

        {/* Service Info Card */}
        <View style={styles.infoCard}>
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              service.active ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text style={styles.badgeText}>
              {service.active ? "Active" : "Inactive"}
            </Text>
          </View>

          {/* Service Name */}
          <Text style={styles.serviceName}>{service.name}</Text>

          {/* Category */}
          {service.category && (
            <Text style={styles.category}>{service.category}</Text>
          )}

          {/* Price and Rating Section */}
          <View style={styles.priceRatingSection}>
            <View>
              {service.price > 0 ? (
                <>
                  <Text style={styles.price}>₹{service.price}</Text>
                  <Text style={styles.priceLabel}>Price</Text>
                </>
              ) : (
                <>
                  <Text style={styles.price}>FREE</Text>
                  <Text style={styles.priceLabel}>Complimentary</Text>
                </>
              )}
            </View>
            {service.rating && (
              <View style={styles.ratingCard}>
                <View style={styles.ratingStars}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingValue}>{service.rating}</Text>
                </View>
                <Text style={styles.reviewsCount}>
                  ({service.reviewsCount} reviews)
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Heart size={20} color={colors.brand.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Share2 size={20} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About Service</Text>
          <Text style={styles.descriptionText}>{service.description}</Text>
        </View>

        {/* Service Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.detailRow}>
            <Clock size={16} color={colors.brand.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Delivery Time</Text>
              <Text style={styles.detailValue}>{service.duration}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.brand.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Service Provider</Text>
              <Text style={styles.detailValue}>{service.storeName}</Text>
            </View>
          </View>
          {service.reviewsCount && (
            <View style={styles.detailRow}>
              <Users size={16} color={colors.brand.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Total Reviews</Text>
                <Text style={styles.detailValue}>{service.reviewsCount}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <View style={styles.featuresCard}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            {service.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Related Services */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Services</Text>
          <FlatList
            horizontal
            data={relatedServices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RelatedServiceCard item={item} />}
            contentContainerStyle={styles.relatedList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Service Button */}
      <View style={styles.bottomButton}>
        {service.active ? (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookService}
          >
            <Text style={styles.bookButtonText}>Book Service</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.unavailableButton}>
            <Text style={styles.unavailableText}>Service Unavailable</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  imageSection: {
    marginBottom: 16,
  },
  mainImage: {
    width: "100%",
    height: 300,
    borderRadius: radius.md,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  thumbnailContainer: {
    paddingBottom: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  activeThumbnail: {
    borderColor: colors.brand.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeActive: {
    backgroundColor: "#dcfce7",
  },
  badgeInactive: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  serviceName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  priceRatingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.brand.primary,
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  ratingCard: {
    alignItems: "flex-end",
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  reviewsCount: {
    fontSize: 12,
    color: "#94a3b8",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 21,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 2,
  },
  featuresCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
    marginTop: 6,
  },
  featureText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
    lineHeight: 20,
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedList: {
    paddingRight: 8,
  },
  relatedCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    width: 140,
    marginRight: 12,
    overflow: "hidden",
  },
  relatedImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f1f5f9",
  },
  relatedInfo: {
    padding: 12,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  rating: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0f172a",
  },
  relatedPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primary,
    marginBottom: 6,
  },
  relatedStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#166534",
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  bookButton: {
    backgroundColor: colors.brand.primaryLight,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  unavailableButton: {
    backgroundColor: "#cbd5e1",
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
