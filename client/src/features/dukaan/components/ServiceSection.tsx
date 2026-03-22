import { BookedService, useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    Calendar,
    Check,
    Clock,
    Edit2,
    Heart,
    Plus,
    Star,
    Store,
    X,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

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
  storeId?: string;
}

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

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onBookService,
  storeImage,
  storeName = "Store",
  storeId = "1",
}) => {
  const router = useRouter();
  const { t } = useSettings();
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

  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState(getNextDays()[0].date);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [isEditing, setIsEditing] = useState(false);
  const availableDays = getNextDays();

  const handleServicePress = useCallback(
    (service: Service) => {
      router.push({
        pathname: "/service/[id]",
        params: {
          id: service.id,
          fallbackData: JSON.stringify({
            id: service.id,
            name: service.name,
            category: "general",
            price: service.price,
            image: service.image || "",
            description: service.description,
            active: service.active,
            duration: service.duration || "",
            rating: service.rating || 4.5,
            reviewsCount: 0,
            storeId: storeId,
            storeName: storeName,
          }),
        },
      } as any);
    },
    [router, storeId, storeName],
  );

  const openBookingModal = useCallback(
    (service: Service, editing: boolean = false) => {
      setSelectedService(service);
      setIsEditing(editing);

      // If editing, load existing booking data
      if (editing) {
        const booking = getBookingByServiceId(service.id);
        if (booking) {
          setSelectedDate(booking.bookingDate);
          setSelectedTime(booking.bookingTime);
        }
      } else {
        // Reset to default values
        setSelectedDate(getNextDays()[0].date);
        setSelectedTime("10:00 AM");
      }

      setBookingModalVisible(true);
    },
    [getBookingByServiceId],
  );

  const handleConfirmBooking = useCallback(() => {
    if (!selectedService) return;

    const existingBooking = getBookingByServiceId(selectedService.id);

    if (isEditing && existingBooking) {
      // Update existing booking
      updateBooking(existingBooking.id, {
        bookingDate: selectedDate,
        bookingTime: selectedTime,
      });
    } else {
      // Create new booking
      const newBooking: BookedService = {
        id: `booking-${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        storeName: storeName,
        storeId: storeId,
        price: selectedService.price,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        duration: selectedService.duration,
        image: selectedService.image,
        status: "confirmed",
      };
      bookService(newBooking);
    }

    setBookingModalVisible(false);
    Toast.show({
      type: "success",
      text1: isEditing
        ? t("svcSection.bookingUpdated")
        : t("svcSection.serviceBooked"),
      text2: `${selectedService.name} ${isEditing ? t("svcSection.updated") : t("svcSection.booked")} successfully!`,
      visibilityTime: 3000,
      position: "top",
    });

    onBookService?.(selectedService);
  }, [
    selectedService,
    selectedDate,
    selectedTime,
    isEditing,
    getBookingByServiceId,
    updateBooking,
    bookService,
    storeName,
    storeId,
    onBookService,
  ]);

  const handleCancelBooking = useCallback(
    (service: Service) => {
      const booking = getBookingByServiceId(service.id);
      if (booking) {
        cancelBooking(booking.id);
      }
    },
    [getBookingByServiceId, cancelBooking],
  );

  const handleWishlistToggle = useCallback(
    (service: Service, e: any) => {
      e.stopPropagation();

      const wishlistId = `service-${service.id}`;
      if (isInWishlist(wishlistId)) {
        removeFromWishlist(wishlistId);
        Toast.show({
          type: "info",
          text1: t("svcSection.removedFromWishlist"),
          text2: `${service.name} ${t("svcSection.removed")}`,
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
          storeName: storeName,
          storeId: storeId,
          duration: service.duration,
        });
        Toast.show({
          type: "success",
          text1: t("svcSection.addedToWishlist"),
          text2: `${service.name} ${t("svcSection.saved")}`,
          visibilityTime: 1500,
          position: "top",
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

  const ServiceCard = ({ item }: { item: Service }) => {
    const isBooked = isServiceBooked(item.id);
    const booking = getBookingByServiceId(item.id);

    return (
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
                    isInWishlist(`service-${item.id}`)
                      ? colors.status.error
                      : colors.ui.muted
                  }
                  fill={
                    isInWishlist(`service-${item.id}`)
                      ? colors.status.error
                      : "none"
                  }
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.statusBadge,
                  isBooked
                    ? styles.badgeBooked
                    : item.active
                      ? styles.badgeActive
                      : styles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isBooked && styles.bookedStatusText,
                  ]}
                >
                  {isBooked
                    ? t("svcSection.bookedStatus")
                    : item.active
                      ? t("svcSection.available")
                      : t("svcSection.unavailable")}
                </Text>
              </View>
            </View>
          </View>

          {/* Show booking details if booked */}
          {isBooked && booking && (
            <View style={styles.bookingDetails}>
              <View style={styles.bookingDateRow}>
                <Calendar size={14} color={colors.brand.primary} />
                <Text style={styles.bookingDateText}>
                  {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Clock size={14} color={colors.brand.primary} />
                <Text style={styles.bookingTimeText}>
                  {booking.bookingTime}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.serviceFooter}>
            <View style={styles.priceAndRating}>
              {item.price > 0 && (
                <Text style={styles.servicePrice}>₹{item.price}</Text>
              )}
              {typeof item.rating === "number" && item.rating > 0 && (
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

            {item.active &&
              (isBooked ? (
                <View style={styles.bookedActionsContainer}>
                  <TouchableOpacity
                    style={styles.editBookingBtn}
                    onPress={() => openBookingModal(item, true)}
                  >
                    <Edit2 size={14} color={colors.brand.primary} />
                    <Text style={styles.editBookingText}>
                      {t("svcSection.change")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBookingBtn}
                    onPress={() => handleCancelBooking(item)}
                  >
                    <X size={14} color={colors.status.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => openBookingModal(item, false)}
                >
                  <Plus size={14} color={colors.text.inverse} />
                  <Text style={styles.bookText}>{t("svcSection.book")}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
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
          {t("svcSection.browseServices")}
        </Text>
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
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("svcSection.noServices")}</Text>
          </View>
        }
      />

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
                {isEditing
                  ? t("svcSection.changeBooking")
                  : t("svcSection.bookService")}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setBookingModalVisible(false)}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Service Info */}
            {selectedService && (
              <View style={styles.modalServiceInfo}>
                <Text style={styles.modalServiceName}>
                  {selectedService.name}
                </Text>
                <Text style={styles.modalServicePrice}>
                  {selectedService.price > 0
                    ? `₹${selectedService.price}`
                    : "FREE"}
                </Text>
              </View>
            )}

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Selection */}
              <Text style={styles.modalSectionTitle}>
                {t("svcSection.selectDate")}
              </Text>
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
              <Text style={styles.modalSectionTitle}>
                {t("svcSection.selectTime")}
              </Text>
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
                {isEditing
                  ? t("svcSection.updateBooking")
                  : t("svcSection.confirmBooking")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  bookedActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.tint.blueLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  editBookingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  cancelBookingBtn: {
    padding: 8,
    backgroundColor: colors.status.errorLight,
    borderRadius: 8,
  },
  badgeBooked: {
    backgroundColor: colors.status.successLight,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  bookedStatusText: {
    color: colors.status.successDark,
    fontWeight: "700",
  },
  bookingDetails: {
    backgroundColor: colors.tint.blueLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookingDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
    marginRight: 8,
  },
  bookingTimeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
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
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
