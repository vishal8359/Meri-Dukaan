// src/features/dukaan/components/EditItemModal.tsx
import { colors, radius, spacing } from "@/src/theme/colors";
import { Minus, Plus, Save, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
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

            {type === "product" ? (
              <>
                {/* Category */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.category}
                    onChangeText={(text) => updateField("category", text)}
                    placeholder="e.g., Vegetables"
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
              <Save size={18} color="#FFF" />
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
    backgroundColor: "#FFF",
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
    borderColor: "#e2e8f0",
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  stockControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stockBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#f1f5f9",
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
    borderColor: "#e2e8f0",
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
    color: "#FFF",
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
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
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
    color: "#FFF",
  },
});
