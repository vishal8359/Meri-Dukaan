// src/features/dukaan/components/EditItemModal.tsx
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES } from "@/src/constants/catalog";
import { colors, radius, spacing } from "@/src/theme/colors";
import { ChevronDown, Minus, Plus, Save, Trash2, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface EditItemModalProps {
  visible: boolean;
  onClose: () => void;
  item: any;
  type: "product" | "service";
  onSave: (item: any) => void;
  onDelete: (id: string) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  onClose,
  item,
  type,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState(item || {});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Reset form data when item changes
  useEffect(() => {
    setFormData(item || {});
    setShowCategoryPicker(false);
  }, [item]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    onDelete(item?.id);
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const incrementStock = () => {
    const current = parseInt(formData.stock) || 0;
    updateField("stock", (current + 1).toString() + " kg");
  };

  const decrementStock = () => {
    const current = parseInt(formData.stock) || 0;
    if (current > 0) {
      updateField("stock", (current - 1).toString() + " kg");
    }
  };

  // Get the appropriate categories list (skip "all" option)
  const categories =
    type === "product"
      ? PRODUCT_CATEGORIES.filter((c) => c.id !== "all")
      : SERVICE_CATEGORIES.filter((c) => c.id !== "all");

  // Find the currently selected category display name
  const currentCategory = formData.category || formData.type || "";
  const selectedCategoryOption = categories.find(
    (c) =>
      c.id === currentCategory.toLowerCase() ||
      c.name.toLowerCase() === currentCategory.toLowerCase(),
  );
  const categoryDisplayName =
    selectedCategoryOption?.name || currentCategory || "Select category";

  const handleCategorySelect = (categoryId: string) => {
    updateField("category", categoryId);
    updateField("type", categoryId);
    setShowCategoryPicker(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Edit {type === "product" ? "Product" : "Service"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {type === "product" ? "Product" : "Service"} Name
              </Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                placeholder="Enter name"
              />
            </View>

            {/* Category Picker (for both products and services) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.categoryPickerBtn}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                {selectedCategoryOption && (
                  <Text style={styles.categoryEmoji}>
                    {selectedCategoryOption.icon}
                  </Text>
                )}
                <Text
                  style={[
                    styles.categoryPickerText,
                    !selectedCategoryOption && { color: colors.text.tertiary },
                  ]}
                  numberOfLines={1}
                >
                  {categoryDisplayName}
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
                  <ScrollView
                    style={styles.categoryDropdownScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {categories.map((cat) => {
                      const isSelected =
                        currentCategory.toLowerCase() === cat.id ||
                        currentCategory.toLowerCase() ===
                          cat.name.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryDropdownItem,
                            isSelected && {
                              backgroundColor: colors.tint.blueLight,
                              borderColor: colors.brand.primaryLight,
                            },
                          ]}
                          onPress={() => handleCategorySelect(cat.id)}
                        >
                          <Text style={styles.categoryItemEmoji}>
                            {cat.icon}
                          </Text>
                          <Text
                            style={[
                              styles.categoryItemText,
                              isSelected && {
                                color: colors.brand.primary,
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {cat.name}
                          </Text>
                          {isSelected && (
                            <View
                              style={[
                                styles.categoryDot,
                                { backgroundColor: cat.color },
                              ]}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {type === "product" ? (
              <>
                {/* Price */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price?.toString()}
                    onChangeText={(text) =>
                      updateField("price", parseInt(text) || 0)
                    }
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>

                {/* Stock with +/- buttons */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Stock</Text>
                  <View style={styles.stockControl}>
                    <TouchableOpacity
                      style={styles.stockBtn}
                      onPress={decrementStock}
                    >
                      <Minus size={18} color={colors.text.primary} />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, styles.stockInput]}
                      value={formData.stock}
                      onChangeText={(text) => updateField("stock", text)}
                      placeholder="0 kg"
                    />
                    <TouchableOpacity
                      style={styles.stockBtn}
                      onPress={incrementStock}
                    >
                      <Plus size={18} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        formData.status === "active" && styles.activeStatusBtn,
                      ]}
                      onPress={() => updateField("status", "active")}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          formData.status === "active" &&
                            styles.activeStatusText,
                        ]}
                      >
                        Active
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        formData.status === "out-of-stock" &&
                          styles.activeStatusBtn,
                      ]}
                      onPress={() => updateField("status", "out-of-stock")}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          formData.status === "out-of-stock" &&
                            styles.activeStatusText,
                        ]}
                      >
                        Out of Stock
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => updateField("description", text)}
                    placeholder="Service description"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Price */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price?.toString()}
                    onChangeText={(text) =>
                      updateField("price", parseInt(text) || 0)
                    }
                    placeholder="0 (Free if 0)"
                    keyboardType="numeric"
                  />
                </View>

                {/* Active Status */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        formData.active && styles.activeStatusBtn,
                      ]}
                      onPress={() => updateField("active", true)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          formData.active && styles.activeStatusText,
                        ]}
                      >
                        Active
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        !formData.active && styles.activeStatusBtn,
                      ]}
                      onPress={() => updateField("active", false)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          !formData.active && styles.activeStatusText,
                        ]}
                      >
                        Inactive
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Trash2 size={18} color={colors.status.error} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Save size={18} color={colors.text.inverse} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  // Category Picker styles
  categoryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    padding: spacing.md,
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
  categoryDropdownScroll: {
    maxHeight: 200,
  },
  categoryDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 4,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  categoryItemEmoji: {
    fontSize: 16,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Stock controls
  stockControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stockBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.ui.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  stockInput: {
    flex: 1,
  },
  statusButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    alignItems: "center",
  },
  activeStatusBtn: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  activeStatusText: {
    color: colors.text.inverse,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
    backgroundColor: colors.status.errorLight,
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.status.error,
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.primary,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
