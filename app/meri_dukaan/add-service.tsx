// app/meri_dukaan/add-service.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Trash2 } from "lucide-react-native";
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

const PLACEHOLDER_SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1521590832167-7bcb6b906fca?w=400",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
  "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400",
];

const DURATION_PRESETS = [
  { label: "15 min", value: "15 min" },
  { label: "30 min", value: "30 min" },
  { label: "45 min", value: "45 min" },
  { label: "1 hr", value: "1 hr" },
  { label: "1.5 hr", value: "1.5 hr" },
  { label: "2 hr", value: "2 hr" },
  { label: "Custom", value: "" },
];

export default function AddServiceScreen() {
  const router = useRouter();
  const { addMyService } = useApp();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const isCustom = duration === "";

  const handleDurationSelect = (val: string) => {
    setDuration(val);
    if (val !== "") setCustomDuration("");
  };

  const handleAddImage = () => {
    if (images.length >= 5) {
      Alert.alert("Limit", "Maximum 5 images");
      return;
    }
    const idx = images.length % PLACEHOLDER_SERVICE_IMAGES.length;
    setImages((prev) => [...prev, PLACEHOLDER_SERVICE_IMAGES[idx]]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Error", "Enter service name");
    if (!price.trim() || isNaN(Number(price)))
      return Alert.alert("Error", "Enter valid price");
    const finalDuration = duration || customDuration.trim();
    if (!finalDuration) return Alert.alert("Error", "Select or enter duration");
    if (images.length < 1)
      return Alert.alert("Error", "Add at least 1 service image");

    addMyService({
      id: `svc_${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      images,
      duration: finalDuration,
      description: description.trim(),
      available: true,
    });

    Alert.alert("Success", "Service added!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Images (1-5)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing.sm }}
          >
            {images.map((uri, i) => (
              <View key={i} style={styles.imgWrap}>
                <Image source={{ uri }} style={styles.svcImg} />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => handleRemoveImage(i)}
                >
                  <Trash2 size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImgBtn}
                onPress={handleAddImage}
              >
                <Camera size={22} color={colors.brand.primary} />
                <Text style={styles.addImgText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Service Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Hair Cut, Plumbing Repair"
            placeholderTextColor={colors.ui.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 200"
            placeholderTextColor={colors.ui.muted}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>Duration *</Text>
          <View style={styles.durationGrid}>
            {DURATION_PRESETS.map((opt) => {
              const active =
                opt.value === ""
                  ? isCustom && duration === ""
                  : duration === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.durationChip,
                    active && styles.durationChipActive,
                  ]}
                  onPress={() => handleDurationSelect(opt.value)}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      active && styles.durationChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {isCustom && duration === "" && (
            <TextInput
              style={[styles.textInput, { marginTop: spacing.sm }]}
              placeholder="e.g., 2.5 hr"
              placeholderTextColor={colors.ui.muted}
              value={customDuration}
              onChangeText={setCustomDuration}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multiline]}
            placeholder="Describe your service (optional)"
            placeholderTextColor={colors.ui.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Add Service</Text>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: colors.text.primary,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 12,
  },

  /* Images */
  imgWrap: { position: "relative", marginRight: 12 },
  svcImg: {
    width: 100,
    height: 100,
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
  addImgBtn: {
    width: 100,
    height: 100,
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
    marginTop: 2,
  },

  /* Duration chips */
  durationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  durationChipActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "0A",
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  durationChipTextActive: { color: colors.brand.primary },

  /* Save */
  saveBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
