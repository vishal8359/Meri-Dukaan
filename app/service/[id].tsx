import { BookedService, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Calendar,
    Check,
    ChevronLeft,
    Clock,
    Edit2,
    Heart,
    MapPin,
    Star,
    Users,
    X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Available time slots
const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];

// Get next 7 days for date selection
const getNextDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return days;
};

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
  delivery?: string;
  features?: string[];
}

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    bookService,
    isServiceBooked,
    getBookingByServiceId,
    updateBooking,
    cancelBooking,
  } = useApp();
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getNextDays()[0].date);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const availableDays = getNextDays();

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
    delivery: "24-48 hrs",
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
      delivery: "4-6 hrs",
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
      delivery: "1-3 days",
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
      delivery: "2-4 hrs",
      rating: 4.9,
      reviewsCount: 678,
    },
  ];

  // Check if current service is booked
  const isBooked = isServiceBooked(service.id);
  const currentBooking = getBookingByServiceId(service.id);

  const openBookingModal = (editing: boolean = false) => {
    setIsEditing(editing);

    // If editing, load existing booking data
    if (editing && currentBooking) {
      setSelectedDate(currentBooking.bookingDate);
      setSelectedTime(currentBooking.bookingTime);
    } else {
      // Reset to default values
      setSelectedDate(getNextDays()[0].date);
      setSelectedTime("10:00 AM");
    }

    setBookingModalVisible(true);
  };

  const handleConfirmBooking = () => {
    if (isEditing && currentBooking) {
      // Update existing booking
      updateBooking(currentBooking.id, {
        bookingDate: selectedDate,
        bookingTime: selectedTime,
      });
    } else {
      // Create new booking
      const newBooking: BookedService = {
        id: `booking-${Date.now()}`,
        serviceId: service.id,
        serviceName: service.name,
        storeName: service.storeName || "Store",
        storeId: service.storeId || "1",
        price: service.price,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        duration: service.duration,
        image: service.image,
        status: "confirmed",
      };
      bookService(newBooking);
    }

    setBookingModalVisible(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCancelBooking = () => {
    if (currentBooking) {
      cancelBooking(currentBooking.id);
    }
  };

  const handleWishlistToggle = () => {
    const wishlistId = `service-${service.id}`;
    if (isInWishlist(wishlistId)) {
      removeFromWishlist(wishlistId);
      Toast.show({
        type: "info",
        text1: "Removed from wishlist",
        text2: `${service.name} removed`,
        visibilityTime: 1500,
        position: "top",
      });
    } else {
      addToWishlist({
        id: wishlistId,
        name: service.name,
        price: service.price,
        type: "service",
        description: service.description,
        image: service.image,
        rating: service.rating,
      });
      Toast.show({
        type: "success",
        text1: "Added to wishlist",
        text2: `${service.name} saved!`,
        visibilityTime: 1500,
        position: "top",
      });
    }
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
      activeOpacity={0.75}
    >
      {/* Image Container with Badge */}
      <View style={styles.relatedImageContainer}>
        <Image
          source={{ uri: item.image || service.image }}
          style={styles.relatedImage}
        />

        {/* Category Badge */}
        <View style={styles.categoryBadgeRelated}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>

        {/* Status Indicator */}
        {item.active && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>●</Text>
          </View>
        )}
      </View>

      {/* Service Info */}
      <View style={styles.relatedInfo}>
        {/* Service Name */}
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
            {item.reviewsCount && (
              <Text style={styles.relatedReviews}>{item.reviewsCount}</Text>
            )}
          </View>
        )}

        {/* Price & Duration */}
        <View style={styles.priceDeliveryRow}>
          <Text style={styles.relatedPrice}>
            {item.price > 0 ? `₹${item.price}` : "FREE"}
          </Text>
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
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.heading} />
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
          {/* Row 1: Service Name + Wishlist Heart */}
          <View style={styles.nameAndWishlistRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.serviceName}>{service.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleWishlistToggle}
            >
              <Heart
                size={20}
                color={
                  isInWishlist(`service-${service.id}`)
                    ? colors.status.error
                    : colors.brand.primary
                }
                fill={
                  isInWishlist(`service-${service.id}`)
                    ? colors.status.error
                    : "none"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Row 2: Status */}
          <Text style={styles.statusAvailability}>
            {service.active ? "Active • Available" : "Inactive"}
          </Text>

          {/* Row 3: Ratings (Left) + Category (Right) */}
          <View style={styles.ratingCategoryRow}>
            {service.rating && (
              <View style={styles.ratingSection}>
                <View style={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      color={
                        i < Math.floor(service.rating!)
                          ? colors.brand.star
                          : colors.ui.disabled
                      }
                      fill={
                        i < Math.floor(service.rating!)
                          ? colors.brand.star
                          : "none"
                      }
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  {service.rating} • {service.reviewsCount} reviews
                </Text>
              </View>
            )}
            {service.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{service.category}</Text>
              </View>
            )}
          </View>

          {/* Row 4: Price (Left) + Duration & Provider (Right) */}
          <View style={styles.priceStoreRow}>
            <View style={styles.priceColumn}>
              <Text style={styles.price}>
                {service.price > 0 ? `₹${service.price}` : "FREE"}
              </Text>
              <Text style={styles.stockInfo}>
                {service.price > 0 ? "Price" : "Complimentary"}
              </Text>
            </View>
            <View style={styles.storeDeliveryColumn}>
              <View style={styles.storeInfo}>
                <Text style={styles.storeLabel}>Offered by</Text>
                <Text style={styles.storeName}>{service.storeName}</Text>
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Duration</Text>
                <Text style={styles.deliveryTime}>{service.duration}</Text>
              </View>
            </View>
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

      {/* Success Message */}
      {showSuccessMessage && (
        <View style={styles.successMessage}>
          <Check size={16} color={colors.status.successDark} />
          <Text style={styles.successMessageText}>
            Service {isEditing ? "updated" : "booked"} successfully!
          </Text>
        </View>
      )}

      {/* Book Service Button */}
      <View style={styles.bottomButton}>
        {service.active ? (
          isBooked ? (
            <View style={styles.bookedContainer}>
              {/* Booking Info */}
              <View style={styles.bookingInfoCard}>
                <View style={styles.bookingStatusRow}>
                  <Check size={16} color={colors.status.successDark} />
                  <Text style={styles.bookedLabel}>Booked</Text>
                </View>
                {currentBooking && (
                  <View style={styles.bookingDateTimeRow}>
                    <Calendar size={14} color={colors.brand.primary} />
                    <Text style={styles.bookingDateText}>
                      {new Date(currentBooking.bookingDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </Text>
                    <Clock size={14} color={colors.brand.primary} />
                    <Text style={styles.bookingTimeText}>
                      {currentBooking.bookingTime}
                    </Text>
                  </View>
                )}
              </View>
              {/* Action Buttons */}
              <View style={styles.bookedActionsRow}>
                <TouchableOpacity
                  style={styles.changeBookingButton}
                  onPress={() => openBookingModal(true)}
                >
                  <Edit2 size={16} color={colors.brand.primary} />
                  <Text style={styles.changeBookingText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBookingButton}
                  onPress={handleCancelBooking}
                >
                  <X size={16} color={colors.status.error} />
                  <Text style={styles.cancelBookingText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => openBookingModal(false)}
            >
              <Text style={styles.bookButtonText}>Book Service</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.unavailableButton}>
            <Text style={styles.unavailableText}>Service Unavailable</Text>
          </View>
        )}
      </View>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Change Booking" : "Book Service"}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBookingModalVisible(false)}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Service Info */}
            <View style={styles.modalServiceInfo}>
              <Text style={styles.modalServiceName}>{service.name}</Text>
              <Text style={styles.modalServicePrice}>
                {service.price > 0 ? `₹${service.price}` : "FREE"}
              </Text>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Selection */}
              <Text style={styles.modalSectionTitle}>Select Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScrollView}
              >
                {availableDays.map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.dateCard,
                      selectedDate === day.date && styles.dateCardSelected,
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text
                      style={[
                        styles.dateDayText,
                        selectedDate === day.date && styles.dateTextSelected,
                      ]}
                    >
                      {day.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumText,
                        selectedDate === day.date && styles.dateTextSelected,
                      ]}
                    >
                      {day.dayNum}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonthText,
                        selectedDate === day.date && styles.dateTextSelected,
                      ]}
                    >
                      {day.month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Time Selection */}
              <Text style={styles.modalSectionTitle}>Select Time</Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime === time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmBookingBtn}
              onPress={handleConfirmBooking}
            >
              <Check size={20} color={colors.text.inverse} />
              <Text style={styles.confirmBookingText}>
                {isEditing ? "Update Booking" : "Confirm Booking"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.heading,
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
    backgroundColor: colors.ui.backgroundAlt,
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
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
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
  serviceName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.heading,
    lineHeight: 28,
  },
  statusAvailability: {
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
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeActive: {
    backgroundColor: colors.status.successLight,
  },
  badgeInactive: {
    backgroundColor: colors.status.errorLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  descriptionCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.caption,
    lineHeight: 21,
  },
  detailsCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 2,
  },
  featuresCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
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
    color: colors.text.caption,
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
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    width: 155,
    marginRight: 12,
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
    top: 8,
    left: 8,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.text.inverse,
    textTransform: "uppercase",
  },
  activeBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.status.successDark,
    justifyContent: "center",
    alignItems: "center",
  },
  activeBadgeText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  relatedInfo: {
    padding: 12,
    gap: 6,
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
    gap: 6,
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: 8,
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
    fontSize: 13,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  priceDeliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  relatedDelivery: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.status.successDark,
    backgroundColor: colors.tint.greenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    textAlign: "center",
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
    color: colors.text.primary,
  },
  relatedStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: colors.status.successLight,
  },
  statusInactive: {
    backgroundColor: colors.status.errorLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
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
    color: colors.text.inverse,
  },
  unavailableButton: {
    backgroundColor: colors.ui.disabled,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  // Success Message
  successMessage: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.status.successLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 100,
    ...shadows.medium,
  },
  successMessageText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  // Booked Container
  bookedContainer: {
    gap: 12,
  },
  bookingInfoCard: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  bookingStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  bookedLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.status.successDark,
  },
  bookingDateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingDateText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
    marginRight: 8,
  },
  bookingTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  bookedActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  changeBookingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.tint.blueLight,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  changeBookingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  cancelBookingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.status.errorLight,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  cancelBookingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.status.error,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.heading,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalServiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.ui.backgroundAlt,
  },
  modalServiceName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  modalServicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: 12,
    marginTop: 8,
  },
  dateScrollView: {
    marginBottom: 16,
  },
  dateCard: {
    width: 70,
    height: 80,
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  dateCardSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  dateDayText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  dateNumText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginVertical: 2,
  },
  dateMonthText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  dateTextSelected: {
    color: colors.text.inverse,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  timeSlot: {
    width: "30%",
    paddingVertical: 12,
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  timeSlotSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
  },
  timeSlotTextSelected: {
    color: colors.text.inverse,
  },
  confirmBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand.primary,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBookingText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
