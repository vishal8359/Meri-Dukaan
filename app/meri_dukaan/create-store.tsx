// app/meri_dukaan/create-store.tsx
import { BUSINESS_TYPES, STORE_CATEGORIES } from "@/src/assets/storeCategories";
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Camera,
    MapPin,
    Store,
    Tag,
    Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400",
  "https://images.unsplash.com/photo-1556740758-90de940a013d?w=400",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
  "https://images.unsplash.com/photo-1556767576-5ec41e3239ea?w=400",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
];

export default function CreateStoreScreen() {
  const router = useRouter();
  const { createMyStore } = useApp();

  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [businessType, setBusinessType] = useState<
    "products" | "services" | "both" | ""
  >("");
  const [images, setImages] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleAddImage = () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed");
      return;
    }
    // Simulated image pick — in production use expo-image-picker
    const idx = images.length % PLACEHOLDER_IMAGES.length;
    setImages((prev) => [...prev, PLACEHOLDER_IMAGES[idx]]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!storeName.trim()) return Alert.alert("Error", "Enter store name");
    if (!location.trim()) return Alert.alert("Error", "Enter store location");
    if (!category) return Alert.alert("Error", "Select a category");
    if (!businessType) return Alert.alert("Error", "Select business type");
    if (images.length < 3)
      return Alert.alert("Error", "Add at least 3 store images");

    const store = {
      id: `mystore_${Date.now()}`,
      name: storeName.trim(),
      category,
      businessType: businessType as "products" | "services" | "both",
      location: location.trim(),
      images,
      rating: 0,
      followers: 0,
      products: [],
      services: [],
      reels: [],
      createdAt: Date.now(),
    };

    createMyStore(store);
    Alert.alert("Success", "Your Dukaan has been created!", [
      { text: "OK", onPress: () => router.replace("/meri_dukaan/my-dukaan") },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Your Dukaan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Images (3-5) *</Text>
          <Text style={styles.sectionSub}>
            Showcase your store with 3 to 5 photos
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing.sm }}
          >
            {images.map((uri, i) => (
              <View key={i} style={styles.imgWrap}>
                <Image source={{ uri }} style={styles.storeImg} />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => handleRemoveImage(i)}
                >
                  <Trash2 size={12} color="#fff" />
                </TouchableOpacity>
                {i === 0 && (
                  <View style={styles.coverLabel}>
                    <Text style={styles.coverLabelText}>Cover</Text>
                  </View>
                )}
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImgBtn}
                onPress={handleAddImage}
              >
                <Camera size={24} color={colors.brand.primary} />
                <Text style={styles.addImgText}>
                  {images.length === 0 ? "Add Photos" : "Add More"}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Store Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Store Name *</Text>
          <View style={styles.inputRow}>
            <Store size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              placeholderTextColor={colors.ui.muted}
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Store Location *</Text>
          <View style={styles.inputRow}>
            <MapPin size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Rajendra Nagar, Patna"
              placeholderTextColor={colors.ui.muted}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Tag size={18} color={colors.text.secondary} />
            <Text
              style={[styles.input, !category && { color: colors.ui.muted }]}
            >
              {category || "Select category"}
            </Text>
            <Ionicons
              name={showCategoryPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {showCategoryPicker && (
            <ScrollView style={styles.pickerList} nestedScrollEnabled={true}>
              {STORE_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.pickerItem}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                  {category === item && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.brand.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Business Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Business Type *</Text>
          <Text style={styles.sectionSub}>You can change this later</Text>
          <View style={styles.bizTypes}>
            {BUSINESS_TYPES.map((bt) => {
              const active = businessType === bt.id;
              return (
                <TouchableOpacity
                  key={bt.id}
                  style={[styles.bizCard, active && styles.bizCardActive]}
                  onPress={() => setBusinessType(bt.id as any)}
                >
                  <View style={styles.bizCardHeader}>
                    <Text
                      style={[
                        styles.bizCardLabel,
                        active && styles.bizCardLabelActive,
                      ]}
                    >
                      {bt.label}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.brand.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.bizCardDesc}>{bt.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.status.info}
          />
          <Text style={styles.infoText}>
            You can add products, services and reels after creating your store
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Create My Dukaan</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ui.background },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  scroll: { padding: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: colors.text.primary,
  },

  /* Images */
  imgWrap: {
    position: "relative",
    marginRight: 12,
  },
  storeImg: {
    width: 110,
    height: 110,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
  },
  removeImgBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.status.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 3,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    alignItems: "center",
  },
  coverLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  addImgBtn: {
    width: 110,
    height: 110,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.brand.primary + "08",
  },
  addImgText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.brand.primary,
    marginTop: 4,
  },

  /* Category picker */
  pickerList: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.border,
    maxHeight: 220,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  pickerItemText: { fontSize: 15, color: colors.text.primary },

  /* Business type cards */
  bizTypes: { gap: 12, marginTop: spacing.sm },
  bizCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  bizCardActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "06",
  },
  bizCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  bizCardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  bizCardLabelActive: { color: colors.brand.primary },
  bizCardDesc: { fontSize: 13, color: colors.text.secondary },

  /* Info box */
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.infoLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.status.infoDark,
    fontWeight: "600",
  },

  /* Create button */
  createBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
