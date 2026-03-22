import ProductsTab from "@/app/meri_dukaan/inventory/products";
import ServicesTab from "@/app/meri_dukaan/inventory/services";
import { BUSINESS_TYPES, STORE_CATEGORIES } from "@/src/assets/storeCategories";
import { MyStore, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Clock,
    Film,
    Package,
    Plus,
    Settings,
    Star,
    Store,
    Wrench,
    X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

type DashboardTab = "products" | "services";

// ========== NO STORE STATE ==========
function NoStoreView({ onCreateStore }: { onCreateStore: () => void }) {
  return (
    <View style={styles.noStoreWrap}>
      <View style={styles.noStoreIcon}>
        <Store size={48} color={colors.brand.primary} />
      </View>
      <Text style={styles.noStoreTitle}>You don't have a store yet</Text>
      <Text style={styles.noStoreSubtitle}>
        Create your dukaan and start selling your products & services to the
        community
      </Text>
      <TouchableOpacity style={styles.createStoreBtn} onPress={onCreateStore}>
        <Plus size={18} color={colors.text.inverse} />
        <Text style={styles.createStoreBtnText}>Create Your Dukaan</Text>
      </TouchableOpacity>
    </View>
  );
}

// ========== TIME SETTINGS MODAL ==========
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function buildDefaultSchedule(openingTime?: string, closingTime?: string) {
  return DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day,
    openingTime: day === "Sunday" ? undefined : openingTime || "09:00",
    closingTime: day === "Sunday" ? undefined : closingTime || "21:00",
    isClosed: day === "Sunday",
  }));
}

function normalizeTimeInput(value?: string): string | undefined {
  if (!value) return undefined;

  const raw = value.trim().toUpperCase();
  if (!raw) return undefined;

  const match = raw.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return undefined;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "00");
  const period = match[3];

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;
  if (minutes < 0 || minutes > 59) return undefined;

  if (period) {
    if (hours < 1 || hours > 12) return undefined;
    if (period === "AM") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  } else if (hours < 0 || hours > 23) {
    return undefined;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function TimeSettingsModal({
  visible,
  store,
  onClose,
  onSave,
}: {
  visible: boolean;
  store: MyStore;
  onClose: () => void;
  onSave: (
    schedule: Array<{
      dayOfWeek: string;
      openingTime?: string;
      closingTime?: string;
      isClosed?: boolean;
    }>,
  ) => Promise<void>;
}) {
  const [schedule, setSchedule] = useState(
    buildDefaultSchedule(store.openingTime, store.closingTime),
  );
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setSchedule(buildDefaultSchedule(store.openingTime, store.closingTime));
  }, [visible, store.openingTime, store.closingTime]);

  const handleDayToggle = (dayIndex: number) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[dayIndex].isClosed = !updated[dayIndex].isClosed;
      if (!updated[dayIndex].isClosed && !updated[dayIndex].openingTime) {
        updated[dayIndex].openingTime = "09:00";
        updated[dayIndex].closingTime = "21:00";
      }
      return updated;
    });
  };

  const handleTimeChange = (
    dayIndex: number,
    field: "opening" | "closing",
    value: string,
  ) => {
    setSchedule((prev) => {
      const updated = [...prev];
      if (field === "opening") {
        updated[dayIndex].openingTime = value;
      } else {
        updated[dayIndex].closingTime = value;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const normalizedSchedule = schedule.map((day) => {
        if (day.isClosed) {
          return {
            ...day,
            openingTime: undefined,
            closingTime: undefined,
          };
        }

        const openingTime = normalizeTimeInput(day.openingTime);
        const closingTime = normalizeTimeInput(day.closingTime);

        if (!openingTime || !closingTime) {
          throw new Error(
            `${day.dayOfWeek}: enter valid time in HH:MM (e.g. 09:00 or 9:00 PM)`,
          );
        }

        return {
          ...day,
          openingTime,
          closingTime,
        };
      });

      await onSave(normalizedSchedule);
      Alert.alert("Success", "Store hours updated successfully.");
      onClose();
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error", err?.message || "Failed to update store hours");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Store Hours</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Day-by-day schedule */}
          {schedule.map((day, idx) => (
            <View key={day.dayOfWeek} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{day.dayOfWeek}</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    day.isClosed && styles.toggleButtonClosed,
                  ]}
                  onPress={() => handleDayToggle(idx)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      day.isClosed && styles.toggleButtonTextClosed,
                    ]}
                  >
                    {day.isClosed ? "Closed" : "Open"}
                  </Text>
                </TouchableOpacity>
              </View>

              {!day.isClosed && (
                <View style={styles.timeRow}>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeFieldLabel}>Opens</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="09:00"
                      value={day.openingTime || ""}
                      onChangeText={(val) =>
                        handleTimeChange(idx, "opening", val)
                      }
                      placeholderTextColor={colors.ui.muted}
                      keyboardType="numbers-and-punctuation"
                      maxLength={8}
                    />
                  </View>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeFieldLabel}>Closes</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="21:00"
                      value={day.closingTime || ""}
                      onChangeText={(val) =>
                        handleTimeChange(idx, "closing", val)
                      }
                      placeholderTextColor={colors.ui.muted}
                      keyboardType="numbers-and-punctuation"
                      maxLength={8}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ========== EDIT STORE DETAILS MODAL ==========
function EditStoreDetailsModal({
  visible,
  store,
  onClose,
  onSave,
}: {
  visible: boolean;
  store: MyStore;
  onClose: () => void;
  onSave: (updates: Partial<MyStore>) => Promise<void>;
}) {
  const [storeName, setStoreName] = useState(store.name);
  const [location, setLocation] = useState(store.location);
  const [category, setCategory] = useState(store.category);
  const [businessType, setBusinessType] = useState<MyStore["businessType"]>(
    store.businessType,
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setStoreName(store.name);
    setLocation(store.location);
    setCategory(store.category);
    setBusinessType(store.businessType);
    setShowCategoryPicker(false);
  }, [visible, store]);

  const handleSave = async () => {
    if (!storeName.trim()) {
      Alert.alert("Error", "Enter store name");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Enter store location");
      return;
    }
    if (!category.trim()) {
      Alert.alert("Error", "Select a category");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        name: storeName.trim(),
        location: location.trim(),
        category,
        businessType,
      });
      Alert.alert("Success", "Store details updated successfully.");
      onClose();
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error", err?.message || "Failed to update store details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Store Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.editFieldWrap}>
            <Text style={styles.editFieldLabel}>Store Name</Text>
            <TextInput
              style={styles.editInput}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Enter store name"
              placeholderTextColor={colors.ui.muted}
            />
          </View>

          <View style={styles.editFieldWrap}>
            <Text style={styles.editFieldLabel}>Location</Text>
            <TextInput
              style={styles.editInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter store location"
              placeholderTextColor={colors.ui.muted}
            />
          </View>

          <View style={styles.editFieldWrap}>
            <Text style={styles.editFieldLabel}>Category</Text>
            <TouchableOpacity
              style={styles.editInput}
              onPress={() => setShowCategoryPicker((prev) => !prev)}
            >
              <Text style={styles.editCategoryText}>{category || "Select category"}</Text>
              <Ionicons
                name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
            {showCategoryPicker && (
              <ScrollView style={styles.editPickerList} nestedScrollEnabled={true}>
                {STORE_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.editPickerItem}
                    onPress={() => {
                      setCategory(item);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.editPickerItemText}>{item}</Text>
                    {category === item && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.brand.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.editFieldWrap}>
            <Text style={styles.editFieldLabel}>Business Type</Text>
            <View style={styles.editBusinessTypeWrap}>
              {BUSINESS_TYPES.map((type) => {
                const selected = businessType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.editBusinessTypeCard,
                      selected && styles.editBusinessTypeCardActive,
                    ]}
                    onPress={() =>
                      setBusinessType(type.id as MyStore["businessType"])
                    }
                  >
                    <Text
                      style={[
                        styles.editBusinessTypeLabel,
                        selected && styles.editBusinessTypeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text style={styles.editBusinessTypeDesc}>{type.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ========== STORE PROFILE HEADER ==========
function StoreHeader({
  store,
  onReelDashboard,
  onEditHours,
}: {
  store: MyStore;
  onReelDashboard: () => void;
  onEditHours: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  const displayHours = `${store.openingTime || "09:00"} - ${store.closingTime || "21:00"}`;

  return (
    <View style={styles.profileCard}>
      {/* Images carousel */}
      {store.images.length > 0 && (
        <View>
          <FlatList
            data={store.images}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH,
              offset: CARD_WIDTH * index,
              index,
            })}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.coverImage} />
            )}
          />
          {store.images.length > 1 && (
            <View style={styles.dotsRow}>
              {store.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
      )}
      <View style={styles.profileInfo}>
        <View style={styles.profileInfoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeCategory}>
              {store.category} •{" "}
              {store.businessType === "both"
                ? "Products & Services"
                : store.businessType === "products"
                  ? "Products"
                  : "Services"}
            </Text>
            <Text style={styles.storeLocation}>📍 {store.location}</Text>
          </View>
          {/* Reel Dashboard Icon */}
          <TouchableOpacity
            style={styles.reelDashboardBtn}
            onPress={onReelDashboard}
            activeOpacity={0.7}
          >
            <Film size={20} color={colors.brand.primary} />
            {store.reels.length > 0 && (
              <View style={styles.reelBadge}>
                <Text style={styles.reelBadgeText}>{store.reels.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Star
              size={13}
              color={colors.brand.star}
              fill={colors.brand.star}
            />
            <Text style={styles.statText}>{store.rating.toFixed(1)}</Text>
          </View>
          <View
            style={[
              styles.statBadge,
              { backgroundColor: colors.tint.blueLight },
            ]}
          >
            <Ionicons name="people" size={13} color={colors.status.info} />
            <Text style={[styles.statText, { color: colors.status.info }]}>
              {store.followers.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statBadge,
              { backgroundColor: colors.tint.greenLight },
            ]}
          >
            <Package size={13} color={colors.status.success} />
            <Text style={[styles.statText, { color: colors.status.success }]}>
              {store.products.length} items
            </Text>
          </View>
        </View>

        {/* Store Hours Section */}
        <TouchableOpacity
          style={styles.hoursSection}
          onPress={onEditHours}
          activeOpacity={0.7}
        >
          <View style={styles.hoursContent}>
            <Clock size={16} color={colors.brand.primary} />
            <View style={styles.hoursText}>
              <Text style={styles.hoursLabel}>Store Hours</Text>
              <Text style={styles.hoursValue}>{displayHours}</Text>
            </View>
          </View>
          <Text style={styles.editHint}>Tap to edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========== TAB BAR ==========
function TabBar({
  activeTab,
  onTabChange,
  businessType,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  businessType: MyStore["businessType"];
}) {
  const tabs: { key: DashboardTab; label: string; icon: any; show: boolean }[] =
    [
      {
        key: "products",
        label: "Products",
        icon: Package,
        show: businessType === "products" || businessType === "both",
      },
      {
        key: "services",
        label: "Services",
        icon: Wrench,
        show: businessType === "services" || businessType === "both",
      },
    ];

  return (
    <View style={styles.tabBar}>
      {tabs
        .filter((t) => t.show)
        .map((tab) => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
            >
              <Icon
                size={16}
                color={active ? colors.brand.primary : colors.text.tertiary}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

// ========== MAIN DASHBOARD ==========
export default function MyDukaanScreen() {
  const router = useRouter();
  const {
    myStore,
    updateMyStore,
    updateMyProduct,
    removeMyProduct,
    updateMyService,
    removeMyService,
    updateStoreHours,
  } = useApp();

  const defaultTab: DashboardTab =
    myStore?.businessType === "services" ? "services" : "products";
  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);

  const openSettingsOptions = () => {
    Alert.alert("Store Settings", "Choose an option", [
      {
        text: "Edit Store Details",
        onPress: () => setShowEditStoreModal(true),
      },
      {
        text: "Edit Store Hours",
        onPress: () => setShowTimeModal(true),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Product stock toggle
  const handleToggleStock = (id: string) => {
    const prod = myStore?.products.find((p) => p.id === id);
    if (prod) updateMyProduct(id, { inStock: !prod.inStock });
  };

  // Update product stock quantity
  const handleUpdateStock = (id: string, quantity: number) => {
    updateMyProduct(id, { quantity });
  };

  // Remove product
  const handleRemoveProduct = (id: string) => {
    Alert.alert("Remove Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMyProduct(id),
      },
    ]);
  };

  // Service available toggle
  const handleToggleAvailable = (id: string) => {
    const svc = myStore?.services.find((s) => s.id === id);
    if (svc) updateMyService(id, { available: !svc.available });
  };

  // Remove service
  const handleRemoveService = (id: string) => {
    Alert.alert("Remove Service", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMyService(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.ui.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dukaan</Text>
        {myStore ? (
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={openSettingsOptions}
          >
            <Settings size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Main Content */}
      {!myStore ? (
        <NoStoreView
          onCreateStore={() => router.push("/meri_dukaan/create-store" as any)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Store Profile */}
          <StoreHeader
            store={myStore}
            onReelDashboard={() =>
              router.push("/meri_dukaan/reels/dashboard" as any)
            }
            onEditHours={() => setShowTimeModal(true)}
          />

          {/* Tab Bar */}
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            businessType={myStore.businessType}
          />

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "products" && (
              <ProductsTab
                products={myStore.products}
                onToggleStock={handleToggleStock}
                onRemove={handleRemoveProduct}
                onAdd={() =>
                  router.push("/meri_dukaan/inventory/add-product" as any)
                }
                onUpdateStock={handleUpdateStock}
              />
            )}
            {activeTab === "services" && (
              <ServicesTab
                services={myStore.services}
                onToggleAvailable={handleToggleAvailable}
                onRemove={handleRemoveService}
                onAdd={() =>
                  router.push("/meri_dukaan/inventory/add-service" as any)
                }
              />
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Time Settings Modal */}
      {myStore && (
        <>
          <TimeSettingsModal
            visible={showTimeModal}
            store={myStore}
            onClose={() => setShowTimeModal(false)}
            onSave={updateStoreHours}
          />
          <EditStoreDetailsModal
            visible={showEditStoreModal}
            store={myStore}
            onClose={() => setShowEditStoreModal(false)}
            onSave={updateMyStore}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    ...shadows.small,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  settingsBtn: { padding: 8 },

  scroll: { padding: spacing.md },

  /* No Store */
  noStoreWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  noStoreIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand.primary + "0F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  noStoreTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  noStoreSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  createStoreBtn: {
    flexDirection: "row",
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.lg,
    alignItems: "center",
    gap: 8,
    ...shadows.medium,
  },
  createStoreBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.small,
  },
  coverImage: {
    width: CARD_WIDTH,
    height: 160,
    backgroundColor: colors.ui.backgroundAlt,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  profileInfo: { padding: spacing.md },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  storeName: { fontSize: 20, fontWeight: "800", color: colors.text.primary },
  storeCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  storeLocation: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 4,
  },

  /* Reel Dashboard Button on Card */
  reelDashboardBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  reelBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.brand.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  reelBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  statsRow: { flexDirection: "row", gap: 10, marginTop: spacing.sm },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.warningDark,
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 5,
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.brand.primary + "10" },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.text.tertiary },
  tabTextActive: { color: colors.brand.primary },

  /* Tab Content */
  tabContent: { minHeight: 200 },

  /* Hours Section */
  hoursSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary + "08",
    borderWidth: 1,
    borderColor: colors.brand.primary + "20",
  },
  hoursContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hoursText: {
    flex: 1,
  },
  hoursLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  hoursValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand.primary,
    marginTop: 2,
  },
  editHint: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.ui.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },

  editFieldWrap: {
    marginBottom: spacing.md,
  },
  editFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  editInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.ui.background,
  },
  editCategoryText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
  },
  editPickerList: {
    maxHeight: 180,
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  editPickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  editPickerItemText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  editBusinessTypeWrap: {
    gap: spacing.sm,
  },
  editBusinessTypeCard: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.background,
  },
  editBusinessTypeCardActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "10",
  },
  editBusinessTypeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  editBusinessTypeLabelActive: {
    color: colors.brand.primary,
  },
  editBusinessTypeDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  dayCard: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.ui.background,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.status.successLight,
  },
  toggleButtonClosed: {
    backgroundColor: colors.status.errorLight,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  toggleButtonTextClosed: {
    color: colors.status.errorDark,
  },
  timeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    backgroundColor: colors.ui.background,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.inverse,
  },
});
