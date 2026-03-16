// src/features/dukaan/components/CategoryPickerModal.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { STORE_TYPES } from "@/src/constants/catalog";
import { colors, radius, spacing } from "../../../theme/colors";

interface CategoryPickerModalProps {
  visible: boolean;
  selectedType: string;
  onSelectCategory: (type: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Grocery: "cart-outline",
  Medical: "medkit-outline",
  Tailor: "cut-outline",
  Mechanical: "construct-outline",
  Property: "home-outline",
  Phone: "phone-portrait-outline",
  Photo: "camera-outline",
  Makeup: "color-palette-outline",
  "Book Depot": "book-outline",
  Electric: "flash-outline",
  Clothes: "shirt-outline",
  Shoes: "footsteps-outline",
  Furniture: "bed-outline",
  Garden: "leaf-outline",
  Fish: "fish-outline",
  Pizza: "pizza-outline",
  ATM: "card-outline",
};

function getCategoryIcon(type: string): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[type] || "storefront-outline";
}

export const CategoryPickerModal = React.memo(
  ({
    visible,
    selectedType,
    onSelectCategory,
    onClose,
    t,
  }: CategoryPickerModalProps) => {
    const [categorySearch, setCategorySearch] = useState("");

    const searchedCategories = useMemo(() => {
      if (!categorySearch) return STORE_TYPES;
      return STORE_TYPES.filter((type) =>
        type.toLowerCase().includes(categorySearch.toLowerCase()),
      );
    }, [categorySearch]);

    const handleSelect = (type: string) => {
      onSelectCategory(type);
      setCategorySearch("");
    };

    const handleClose = () => {
      setCategorySearch("");
      onClose();
    };

    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{t("bazar.categories")}</Text>
                <Text style={styles.subtitle}>
                  {STORE_TYPES.length} {t("bazar.categories").toLowerCase()}{" "}
                  available
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={colors.ui.muted} />
                <TextInput
                  placeholder={t("bazar.searchCategory")}
                  style={styles.searchInput}
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  placeholderTextColor={colors.ui.muted}
                />
                {categorySearch !== "" && (
                  <TouchableOpacity onPress={() => setCategorySearch("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.ui.muted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category List */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* "All Stores" option */}
              {(!categorySearch ||
                "all stores".includes(categorySearch.toLowerCase())) && (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedType === "All" && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleSelect("All")}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        selectedType === "All" && styles.iconCircleSelected,
                      ]}
                    >
                      <Ionicons
                        name="apps-outline"
                        size={18}
                        color={
                          selectedType === "All"
                            ? colors.text.inverse
                            : colors.brand.primary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedType === "All" && styles.categoryLabelSelected,
                      ]}
                    >
                      {t("bazar.allStores")}
                    </Text>
                  </View>
                  {selectedType === "All" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.brand.primaryLight}
                    />
                  )}
                </TouchableOpacity>
              )}

              {/* Individual categories */}
              {searchedCategories.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.categoryItem,
                    selectedType === type && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleSelect(type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        selectedType === type && styles.iconCircleSelected,
                      ]}
                    >
                      <Ionicons
                        name={getCategoryIcon(type)}
                        size={18}
                        color={
                          selectedType === type
                            ? colors.text.inverse
                            : colors.brand.primary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedType === type && styles.categoryLabelSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </View>
                  {selectedType === type && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.brand.primaryLight}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {searchedCategories.length === 0 && (
                <View style={styles.noResultContainer}>
                  <Ionicons
                    name="search-outline"
                    size={36}
                    color={colors.ui.disabled}
                  />
                  <Text style={styles.noResultText}>
                    {t("bazar.noCategories")} "{categorySearch}"
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.ui.overlay,
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    paddingTop: spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ui.disabled,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.borderLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryItemSelected: {
    backgroundColor: colors.tint.blueLight,
    borderColor: colors.brand.primaryLight,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleSelected: {
    backgroundColor: colors.brand.primaryLight,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  categoryLabelSelected: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  noResultContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: spacing.md,
  },
  noResultText: {
    textAlign: "center",
    color: colors.text.tertiary,
    fontSize: 14,
  },
});
