// app/create-store.tsx
import { BUSINESS_TYPES, STORE_CATEGORIES } from "@/src/assets/storeCategories";
import { colors, radius, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    MapPin,
    Store,
    Tag,
    Trash2,
    Upload,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateStoreScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: "",
    location: "",
    category: "",
    businessType: "", // "products", "services", or "both"
    images: [] as string[],
  });

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddImage = () => {
    if (formData.images.length >= 5) {
      Alert.alert("Limit Reached", "You can upload maximum 5 images");
      return;
    }
    // In real app, use image picker
    const dummyImage = `https://images.unsplash.com/photo-${Date.now()}?q=80&w=400`;
    updateField("images", [...formData.images, dummyImage]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateField("images", newImages);
  };

  const handleCreateStore = () => {
    // Validation
    if (!formData.storeName.trim()) {
      Alert.alert("Error", "Please enter store name");
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert("Error", "Please enter store location");
      return;
    }
    if (!formData.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!formData.businessType) {
      Alert.alert("Error", "Please select business type");
      return;
    }
    if (formData.images.length === 0) {
      Alert.alert("Error", "Please add at least 1 store image");
      return;
    }

    // Create store logic here
    Alert.alert("Success", "Store created successfully!", [
      { text: "OK", onPress: () => router.replace("/meri_dukaan/my-dukaan") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Your Dukaan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Store Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Images (1-5)</Text>
          <Text style={styles.sectionSubtitle}>
            Add at least 1 image, maximum 5 images
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
          >
            {formData.images.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: img }} style={styles.storeImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Trash2 size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {formData.images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageBtn}
                onPress={handleAddImage}
              >
                <Upload size={24} color={colors.brand.primary} />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Store Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Store Name *</Text>
          <View style={styles.inputWrapper}>
            <Store size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={formData.storeName}
              onChangeText={(text) => updateField("storeName", text)}
              placeholder="Enter your store name"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Store Location *</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => updateField("location", text)}
              placeholder="e.g., Rajendra Nagar, Patna - 800016"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Tag size={18} color={colors.text.secondary} />
            <Text
              style={[styles.input, !formData.category && styles.placeholder]}
            >
              {formData.category || "Select category"}
            </Text>
            <Ionicons
              name={showCategoryPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={styles.categoryPicker}>
              <FlatList
                data={STORE_CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      updateField("category", item);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.categoryText}>{item}</Text>
                    {formData.category === item && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.brand.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Business Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Business Type *</Text>
          <View style={styles.businessTypes}>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.businessTypeCard,
                  formData.businessType === type.id &&
                    styles.selectedBusinessType,
                ]}
                onPress={() => updateField("businessType", type.id)}
              >
                <View style={styles.businessTypeHeader}>
                  <Text
                    style={[
                      styles.businessTypeLabel,
                      formData.businessType === type.id &&
                        styles.selectedBusinessTypeText,
                    ]}
                  >
                    {type.label}
                  </Text>
                  {formData.businessType === type.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.brand.primary}
                    />
                  )}
                </View>
                <Text style={styles.businessTypeDesc}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.status.info}
          />
          <Text style={styles.infoText}>
            You can add products/services after creating your store
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateStore}>
          <Text style={styles.createBtnText}>Create My Dukaan</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  imagesScroll: {
    flexDirection: "row",
  },
  imageContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  storeImage: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: "#f1f5f9",
  },
  removeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.status.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageBtn: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.brand.primary + "10",
  },
  addImageText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  categoryPicker: {
    backgroundColor: "#FFF",
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxHeight: 200,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  categoryText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  businessTypes: {
    gap: spacing.md,
  },
  businessTypeCard: {
    backgroundColor: "#FFF",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  selectedBusinessType: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "05",
  },
  businessTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  businessTypeLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  selectedBusinessTypeText: {
    color: colors.brand.primary,
  },
  businessTypeDesc: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#dbeafe",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "600",
  },
  createBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});
