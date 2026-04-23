// app/meri_dukaan/inventory/add-product.tsx
import { PRODUCT_CATEGORIES } from "@/src/constants/catalog";
import { QuantityUnit, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, ChevronDown, Search, Trash2 } from "lucide-react-native";
import React, { useRef, useState } from "react";
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

interface QuantityVariant {
  amount: string;
  unit: QuantityUnit;
}

const UNIT_OPTIONS: { value: QuantityUnit; label: string; group: string }[] = [
  { value: "kg", label: "Kilogram (kg)", group: "Weight" },
  { value: "g", label: "Gram (g)", group: "Weight" },
  { value: "l", label: "Litre (l)", group: "Volume" },
  { value: "ml", label: "Millilitre (ml)", group: "Volume" },
  { value: "pcs", label: "Pieces (pcs)", group: "Count" },
];

export default function AddProductScreen() {
  const router = useRouter();
  const { addMyProduct } = useApp();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<QuantityUnit>("pcs");
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Quantity variant tags (e.g. "200 g", "400 g", "1 kg")
  const [variants, setVariants] = useState<QuantityVariant[]>([]);
  const [variantAmt, setVariantAmt] = useState("");
  const [variantUnit, setVariantUnit] = useState<QuantityUnit>("g");
  const variantInputRef = useRef<TextInput>(null);

  const handleAddVariant = () => {
    const trimmed = variantAmt.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      return Alert.alert("Error", "Enter a valid quantity");
    }
    const exists = variants.some(
      (v) => v.amount === trimmed && v.unit === variantUnit,
    );
    if (exists) {
      return Alert.alert("Duplicate", "This variant already exists");
    }
    setVariants((prev) => [...prev, { amount: trimmed, unit: variantUnit }]);
    setVariantAmt("");
    variantInputRef.current?.focus();
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit", "Maximum 5 images");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload product images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;

    const pickedUri = result.assets[0]?.uri;
    if (!pickedUri) return;

    setImages((prev) => [...prev, pickedUri]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter product name");
    if (!price.trim() || isNaN(Number(price)))
      return Alert.alert("Error", "Enter valid price");
    if (!quantity.trim() || isNaN(Number(quantity)))
      return Alert.alert("Error", "Enter valid quantity");
    if (images.length < 1)
      return Alert.alert("Error", "Add at least 1 product image");
    if (!category)
      return Alert.alert("Error", "Select a category");

    try {
      setIsSaving(true);
      await addMyProduct({
        id: `prod_${Date.now()}`,
        name: name.trim(),
        price: Number(price),
        images,
        quantity: Number(quantity),
        unit,
        description: description.trim() || undefined,
        inStock: true,
        category,
      });

      Alert.alert("Success", "Product added!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Add Product Failed",
        err?.message || "Unable to add product right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const VARIANT_UNITS: { value: QuantityUnit; label: string }[] = [
    { value: "g", label: "g" },
    { value: "kg", label: "kg" },
    { value: "ml", label: "ml" },
    { value: "l", label: "l" },
    { value: "pcs", label: "pcs" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images (1-5)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing.sm }}
          >
            {images.map((uri, i) => (
              <View key={i} style={styles.imgWrap}>
                <Image source={{ uri }} style={styles.prodImg} />
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

        {/* Product Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Fresh Tomatoes"
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
            placeholder="e.g., 40"
            placeholderTextColor={colors.ui.muted}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add details about your product (optional)"
            placeholderTextColor={colors.ui.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Quantity + Unit */}
        <View style={styles.section}>
          <Text style={styles.label}>Stock Quantity *</Text>
          <View style={styles.qtyRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="e.g., 50"
              placeholderTextColor={colors.ui.muted}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Unit Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Quantity Unit *</Text>
          <View style={styles.unitGrid}>
            {UNIT_OPTIONS.map((opt) => {
              const active = unit === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.unitChip, active && styles.unitChipActive]}
                  onPress={() => setUnit(opt.value)}
                >
                  <Text
                    style={[
                      styles.unitChipText,
                      active && styles.unitChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.unitGroup}>{opt.group}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quantity Variants */}
        <View style={styles.section}>
          <Text style={styles.label}>Quantity Variants</Text>
          <Text style={styles.hint}>
            Add size options customers can choose from (e.g. 200g, 500g, 1kg)
          </Text>

          {/* Variant Input Row */}
          <View style={styles.variantInputRow}>
            <TextInput
              ref={variantInputRef}
              style={[styles.textInput, styles.variantAmtInput]}
              placeholder="e.g. 200"
              placeholderTextColor={colors.ui.muted}
              value={variantAmt}
              onChangeText={setVariantAmt}
              keyboardType="numeric"
            />

            {/* Unit mini-selector */}
            <View style={styles.variantUnitRow}>
              {VARIANT_UNITS.map((u) => {
                const active = variantUnit === u.value;
                return (
                  <TouchableOpacity
                    key={u.value}
                    style={[
                      styles.variantUnitBtn,
                      active && styles.variantUnitBtnActive,
                    ]}
                    onPress={() => setVariantUnit(u.value)}
                  >
                    <Text
                      style={[
                        styles.variantUnitText,
                        active && styles.variantUnitTextActive,
                      ]}
                    >
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.variantAddBtn}
              onPress={handleAddVariant}
            >
              <Text style={styles.variantAddBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Variant Tags */}
          {variants.length > 0 && (
            <View style={styles.variantTags}>
              {variants.map((v, i) => (
                <View
                  key={`${v.amount}-${v.unit}-${i}`}
                  style={styles.variantTag}
                >
                  <Text style={styles.variantTagText}>
                    {v.amount} {v.unit}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveVariant(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.variantTagRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Category Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.categoryPickerBtn}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            {category ? (
              <Text style={styles.categoryEmoji}>
                {PRODUCT_CATEGORIES.find((c) => c.id === category)?.icon}
              </Text>
            ) : null}
            <Text
              style={[
                styles.categoryPickerText,
                !category && { color: colors.ui.muted },
              ]}
            >
              {category
                ? PRODUCT_CATEGORIES.find((c) => c.id === category)?.name
                : "Select category"}
            </Text>
            <ChevronDown
              size={18}
              color={colors.text.secondary}
              style={{
                transform: [
                  { rotate: showCategoryPicker ? "180deg" : "0deg" },
                ],
              }}
            />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.categoryDropdown}>
              <View style={styles.categorySearchBox}>
                <Search size={16} color={colors.text.tertiary} />
                <TextInput
                  style={styles.categorySearchInput}
                  placeholder="Search category..."
                  placeholderTextColor={colors.ui.muted}
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  autoFocus
                />
              </View>
              <ScrollView
                style={{ maxHeight: 200 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                {PRODUCT_CATEGORIES.filter(
                  (c) =>
                    c.id !== "all" &&
                    c.name.toLowerCase().includes(categorySearch.toLowerCase()),
                ).map(
                  (cat) => {
                    const isActive = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryItem,
                          isActive && styles.categoryItemActive,
                        ]}
                        onPress={() => {
                          setCategory(cat.id);
                          setShowCategoryPicker(false);
                          setCategorySearch("");
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                        <Text
                          style={[
                            styles.categoryItemText,
                            isActive && { color: colors.brand.primary, fontWeight: "700" },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={() => void handleSave()}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? "Saving..." : "Add Product"}
          </Text>
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
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: Platform.OS === "ios" ? 14 : 10,
  },
  qtyRow: { flexDirection: "row", gap: 12 },

  /* Images */
  imgWrap: { position: "relative", marginRight: 12 },
  prodImg: {
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

  /* Unit chips */
  unitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
    alignItems: "center",
  },
  unitChipActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "0A",
  },
  unitChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  unitChipTextActive: { color: colors.brand.primary },
  unitGroup: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 1,
  },

  /* Quantity Variants */
  hint: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  variantInputRow: {
    gap: 10,
  },
  variantAmtInput: {
    flex: undefined,
  },
  variantUnitRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  variantUnitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  variantUnitBtnActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "0F",
  },
  variantUnitText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  variantUnitTextActive: {
    color: colors.brand.primary,
  },
  variantAddBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 8,
  },
  variantAddBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  variantTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacing.sm,
  },
  variantTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary + "12",
    borderWidth: 1,
    borderColor: colors.brand.primary + "30",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  variantTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  variantTagRemove: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.error,
  },

  /* Category Picker */
  categoryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryPickerText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  categoryDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    backgroundColor: colors.ui.surface,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border + "40",
  },
  categoryItemActive: {
    backgroundColor: colors.brand.primary + "10",
  },
  categoryItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  categorySearchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    gap: 8,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 4,
  },

  /* Save */
  saveBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
