// app/meri_dukaan/inventory/add-service.tsx
import type { ServicePatternOption } from "@/src/constants/catalog";
import { SERVICE_CATEGORIES, SERVICE_PATTERNS } from "@/src/constants/catalog";
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Camera,
    Check,
    ChevronDown,
    ChevronRight,
    Search,
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

// ─── Pattern-specific config field definitions ─────────────────────
type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "chips";
  chips?: string[];
};

const PATTERN_FIELDS: Record<string, FieldDef[]> = {
  subscription: [
    {
      key: "plans",
      label: "Plan Durations",
      placeholder: "",
      type: "chips",
      chips: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"],
    },
    {
      key: "trainerOption",
      label: "Trainer / Guide Available?",
      placeholder: "",
      type: "chips",
      chips: ["Yes", "No"],
    },
  ],
  time_booking: [
    {
      key: "slotDuration",
      label: "Slot Duration",
      placeholder: "",
      type: "chips",
      chips: ["15 min", "30 min", "45 min", "1 hr", "1.5 hr", "2 hr"],
    },
    {
      key: "availableDays",
      label: "Available Days",
      placeholder: "",
      type: "chips",
      chips: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  ],
  usage: [
    {
      key: "unit",
      label: "Billing Unit",
      placeholder: "",
      type: "chips",
      chips: ["Per Minute", "Per Hour", "Per KM", "Per Session"],
    },
    {
      key: "ratePerUnit",
      label: "Rate per Unit (₹)",
      placeholder: "e.g., 50",
      type: "number",
    },
    {
      key: "minDuration",
      label: "Minimum Duration / Usage",
      placeholder: "e.g., 5 min",
      type: "text",
    },
  ],
  custom_input: [
    {
      key: "customFields",
      label: "What inputs does your customer provide?",
      placeholder: "e.g., Class, Subject, Timing",
      type: "text",
    },
    {
      key: "pricingRule",
      label: "Pricing Rule",
      placeholder: "",
      type: "chips",
      chips: ["Per Hour", "Per Month", "Per Session", "Custom Quote"],
    },
  ],
  fixed_package: [
    {
      key: "inclusions",
      label: "Package Inclusions",
      placeholder: "e.g., 3 nights stay, meals, sightseeing",
      type: "text",
    },
    {
      key: "validity",
      label: "Package Validity",
      placeholder: "",
      type: "chips",
      chips: ["1 Day", "3 Days", "1 Week", "1 Month", "Custom"],
    },
  ],
  on_demand: [
    {
      key: "issueTypes",
      label: "Common Issue / Service Types",
      placeholder: "e.g., Wiring, Fan repair, Switchboard",
      type: "text",
    },
    {
      key: "basePrice",
      label: "Base / Visit Charge (₹)",
      placeholder: "e.g., 100",
      type: "number",
    },
    {
      key: "hourlyRate",
      label: "Hourly Rate (₹)",
      placeholder: "e.g., 200",
      type: "number",
    },
  ],
};

export default function AddServiceScreen() {
  const router = useRouter();
  const { addMyService } = useApp();

  // ─── Step tracker ──────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = pattern, 2 = details, 3 = review

  // ─── Step 1 ────────────────────────────────────────────────────
  const [selectedPattern, setSelectedPattern] =
    useState<ServicePatternOption | null>(null);

  // ─── Step 2 ────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  // Pattern-specific config values
  const [patternConfig, setPatternConfig] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // ─── Helpers ───────────────────────────────────────────────────
  const updateConfig = (key: string, value: any) =>
    setPatternConfig((prev) => ({ ...prev, [key]: value }));

  const toggleChip = (key: string, chip: string, multi = true) => {
    setPatternConfig((prev) => {
      const current: string[] = Array.isArray(prev[key]) ? prev[key] : [];
      if (multi) {
        return {
          ...prev,
          [key]: current.includes(chip)
            ? current.filter((c: string) => c !== chip)
            : [...current, chip],
        };
      }
      return { ...prev, [key]: current.includes(chip) ? [] : [chip] };
    });
  };

  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit", "Maximum 5 images");
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to upload images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;
    const uri = result.assets[0]?.uri;
    if (uri) setImages((prev) => [...prev, uri]);
  };

  const handleRemoveImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  // ─── Validation ────────────────────────────────────────────────
  const validateStep2 = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Error", "Enter service name");
      return false;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("Error", "Enter a valid price");
      return false;
    }
    if (!category) {
      Alert.alert("Error", "Select a category");
      return false;
    }
    return true;
  };

  // ─── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const pattern = selectedPattern!;
      await addMyService({
        id: `svc_${Date.now()}`,
        name: name.trim(),
        price: Number(price),
        images,
        description: description.trim(),
        available: true,
        category,
        servicePattern: pattern.id,
        patternConfig,
        pricingModel: pattern.pricingModel,
        bookingType: pattern.bookingType,
      });
      Alert.alert("Success", "Service added!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Failed", err?.message || "Unable to add service.");
    } finally {
      setIsSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (step > 1) setStep(step - 1);
          else router.back();
        }}
      >
        <ArrowLeft size={22} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {step === 1
          ? "Select Service Type"
          : step === 2
            ? "Service Details"
            : "Review & Save"}
      </Text>
      <View style={{ width: 36 }} />
    </View>
  );

  // ─── Step indicator ────────────────────────────────────────────
  const renderSteps = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepRow}>
          <View
            style={[
              styles.stepCircle,
              s <= step && styles.stepCircleActive,
              s < step && styles.stepCircleDone,
            ]}
          >
            {s < step ? (
              <Check size={14} color="#fff" />
            ) : (
              <Text
                style={[
                  styles.stepNum,
                  s <= step && styles.stepNumActive,
                ]}
              >
                {s}
              </Text>
            )}
          </View>
          <Text
            style={[styles.stepLabel, s <= step && styles.stepLabelActive]}
          >
            {s === 1 ? "Type" : s === 2 ? "Details" : "Review"}
          </Text>
          {s < 3 && <View style={[styles.stepLine, s < step && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  // ─── STEP 1: Pattern grid ─────────────────────────────────────
  const renderStep1 = () => (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>What type of service do you offer?</Text>
      <View style={styles.patternGrid}>
        {SERVICE_PATTERNS.map((pattern) => {
          const active = selectedPattern?.id === pattern.id;
          return (
            <TouchableOpacity
              key={pattern.id}
              style={[
                styles.patternCard,
                { borderColor: active ? pattern.color : colors.ui.border },
                active && { backgroundColor: pattern.color + "08" },
              ]}
              onPress={() => setSelectedPattern(pattern)}
              activeOpacity={0.8}
            >
              <View style={[styles.patternIconWrap, { backgroundColor: pattern.color + "15" }]}>
                <Text style={{ fontSize: 28 }}>{pattern.icon}</Text>
              </View>
              <Text style={[styles.patternName, active && { color: pattern.color }]}>
                {pattern.name}
              </Text>
              <Text style={styles.patternDesc} numberOfLines={2}>
                {pattern.description}
              </Text>
              <Text style={styles.patternExamples}>{pattern.examples}</Text>
              {active && (
                <View style={[styles.patternCheck, { backgroundColor: pattern.color }]}>
                  <Check size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !selectedPattern && styles.nextBtnDisabled]}
        disabled={!selectedPattern}
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextBtnText}>Continue</Text>
        <ChevronRight size={18} color="#fff" />
      </TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );

  // ─── STEP 2: Details form ──────────────────────────────────────
  const renderStep2 = () => {
    const fields = PATTERN_FIELDS[selectedPattern?.id || ""] || [];

    return (
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Chosen pattern badge */}
        <View style={[styles.chosenBadge, { borderColor: selectedPattern!.color + "40" }]}>
          <Text style={{ fontSize: 20 }}>{selectedPattern!.icon}</Text>
          <Text style={[styles.chosenBadgeText, { color: selectedPattern!.color }]}>
            {selectedPattern!.name}
          </Text>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos (up to 5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
            {images.map((uri, i) => (
              <View key={i} style={styles.imgWrap}>
                <Image source={{ uri }} style={styles.svcImg} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => handleRemoveImage(i)}>
                  <Trash2 size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImgBtn} onPress={() => void handleAddImage()}>
                <Camera size={22} color={colors.brand.primary} />
                <Text style={styles.addImgText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Hair Cut, Gym Monthly"
            placeholderTextColor={colors.ui.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Price (₹) *
            {selectedPattern?.pricingModel === "recurring" && " — per plan"}
            {selectedPattern?.pricingModel === "per_unit" && " — per unit"}
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 500"
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
            style={[styles.textInput, styles.multiline]}
            placeholder="Describe your service (optional)"
            placeholderTextColor={colors.ui.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Category picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.categoryPickerBtn}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            {category ? (
              <Text style={styles.categoryEmoji}>
                {SERVICE_CATEGORIES.find((c) => c.id === category)?.icon}
              </Text>
            ) : null}
            <Text style={[styles.categoryPickerText, !category && { color: colors.ui.muted }]}>
              {category
                ? SERVICE_CATEGORIES.find((c) => c.id === category)?.name
                : "Select category"}
            </Text>
            <ChevronDown
              size={18}
              color={colors.text.secondary}
              style={{ transform: [{ rotate: showCategoryPicker ? "180deg" : "0deg" }] }}
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
              <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {SERVICE_CATEGORIES.filter(
                  (c) => c.id !== "all" && c.name.toLowerCase().includes(categorySearch.toLowerCase()),
                ).map((cat) => {
                  const active = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryItem, active && styles.categoryItemActive]}
                      onPress={() => {
                        setCategory(cat.id);
                        setShowCategoryPicker(false);
                        setCategorySearch("");
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                      <Text style={[styles.categoryItemText, active && { color: colors.brand.primary, fontWeight: "700" }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ─── Pattern-specific fields ──────────────────────────── */}
        {fields.length > 0 && (
          <View style={styles.patternFieldsSection}>
            <Text style={styles.sectionTitle}>
              {selectedPattern!.name} Options
            </Text>
            {fields.map((field) => (
              <View key={field.key} style={styles.section}>
                <Text style={styles.label}>{field.label}</Text>
                {field.type === "chips" && field.chips ? (
                  <View style={styles.chipGrid}>
                    {field.chips.map((chip) => {
                      const sel = Array.isArray(patternConfig[field.key])
                        ? patternConfig[field.key].includes(chip)
                        : false;
                      const isMulti = field.key === "availableDays" || field.key === "plans";
                      return (
                        <TouchableOpacity
                          key={chip}
                          style={[styles.chip, sel && styles.chipActive]}
                          onPress={() => toggleChip(field.key, chip, isMulti)}
                        >
                          <Text style={[styles.chipText, sel && styles.chipTextActive]}>
                            {chip}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={styles.textInput}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.ui.muted}
                    value={patternConfig[field.key] ?? ""}
                    onChangeText={(v) => updateConfig(field.key, v)}
                    keyboardType={field.type === "number" ? "numeric" : "default"}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Continue */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            if (validateStep2()) setStep(3);
          }}
        >
          <Text style={styles.nextBtnText}>Review</Text>
          <ChevronRight size={18} color="#fff" />
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  // ─── STEP 3: Review ────────────────────────────────────────────
  const renderStep3 = () => {
    const pattern = selectedPattern!;
    const catName =
      SERVICE_CATEGORIES.find((c) => c.id === category)?.name ?? category;

    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        <View style={styles.reviewCard}>
          <View style={[styles.reviewBadge, { backgroundColor: pattern.color + "12" }]}>
            <Text style={{ fontSize: 22 }}>{pattern.icon}</Text>
            <Text style={[styles.reviewBadgeText, { color: pattern.color }]}>
              {pattern.name}
            </Text>
          </View>

          {images.length > 0 && (
            <ScrollView horizontal style={{ marginBottom: 12 }}>
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.reviewImg} />
              ))}
            </ScrollView>
          )}

          <ReviewRow label="Name" value={name} />
          <ReviewRow label="Price" value={`₹${price}`} />
          <ReviewRow label="Category" value={catName} />
          <ReviewRow label="Pricing Model" value={pattern.pricingModel.replaceAll("_", " ")} />
          <ReviewRow label="Booking Type" value={pattern.bookingType.replaceAll("_", " ")} />
          {description ? <ReviewRow label="Description" value={description} /> : null}

          {/* Pattern config */}
          {Object.entries(patternConfig).map(([key, val]) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            const display = Array.isArray(val) ? val.join(", ") : String(val);
            return <ReviewRow key={key} label={key.replace(/([A-Z])/g, " $1")} value={display} />;
          })}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={() => void handleSave()}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? "Saving..." : "Add Service"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}
      {renderSteps()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </SafeAreaView>
  );
}

// ─── Small review row component ──────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════
//  STYLES
// ═════════════════════════════════════════════════════════════════
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
    marginBottom: spacing.sm,
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
  multiline: { minHeight: 80, paddingTop: 12 },

  /* Step indicator */
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.ui.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ui.background,
  },
  stepCircleActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  stepCircleDone: { backgroundColor: colors.status.success, borderColor: colors.status.success },
  stepNum: { fontSize: 13, fontWeight: "700", color: colors.text.secondary },
  stepNumActive: { color: "#fff" },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  stepLabelActive: { color: colors.brand.primary },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: colors.ui.border,
    marginHorizontal: 6,
  },
  stepLineActive: { backgroundColor: colors.status.success },

  /* Pattern grid */
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: spacing.lg,
  },
  patternCard: {
    width: "47.5%" as any,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    position: "relative",
    ...shadows.small,
  },
  patternIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  patternName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  patternDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
    marginBottom: 4,
  },
  patternExamples: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  patternCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Chosen badge */
  chosenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  chosenBadgeText: { fontSize: 14, fontWeight: "700" },

  /* Images */
  imgWrap: { position: "relative", marginRight: 12 },
  svcImg: {
    width: 90,
    height: 90,
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
    width: 90,
    height: 90,
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

  /* Category picker */
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
  categoryEmoji: { fontSize: 18 },
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
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border + "40",
  },
  categoryItemActive: { backgroundColor: colors.brand.primary + "10" },
  categoryItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },

  /* Chips */
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  chipActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "0A",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.text.primary },
  chipTextActive: { color: colors.brand.primary },

  /* Pattern config section */
  patternFieldsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },

  /* Continue / Next btn */
  nextBtn: {
    flexDirection: "row",
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...shadows.medium,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: colors.text.inverse },

  /* Review */
  reviewCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  reviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  reviewBadgeText: { fontSize: 15, fontWeight: "700" },
  reviewImg: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    marginRight: 8,
    backgroundColor: colors.ui.backgroundAlt,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border + "40",
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
    flex: 1,
    textTransform: "capitalize",
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1.5,
    textAlign: "right",
    textTransform: "capitalize",
  },

  /* Save */
  saveBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.text.inverse },
});
