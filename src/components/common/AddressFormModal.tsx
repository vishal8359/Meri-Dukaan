// src/components/common/AddressFormModal.tsx
import { UserAddress } from "@/src/context/AppContext";
import { colors, radius, spacing } from "@/src/theme/colors";
import { Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<UserAddress, "id">) => void;
  initial?: UserAddress;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initial,
}) => {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  // Reset form when initial data or visibility changes
  useEffect(() => {
    if (visible) {
      setLabel(initial?.label ?? "");
      setAddress(initial?.address ?? "");
      setCity(initial?.city ?? "");
      setState(initial?.state ?? "");
      setPincode(initial?.pincode ?? "");
      setPhone(initial?.phone ?? "");
      setIsDefault(initial?.isDefault ?? false);
    }
  }, [visible, initial]);

  // Handle Android back button
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, onClose]);

  const handleSave = () => {
    if (!label.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    onSave({
      label: label.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      isDefault,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Tapping outside (overlay area) closes the modal */}
        <Pressable style={styles.overlayTouchable} onPress={onClose} />

        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          <Text style={styles.modalTitle}>
            {initial ? "Edit Address" : "Add New Address"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.formScroll}
          >
            <Text style={styles.inputLabel}>Label *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Home, Office, Mom's House"
              placeholderTextColor={colors.text.tertiary}
              value={label}
              onChangeText={setLabel}
            />

            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Street address, locality"
              placeholderTextColor={colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor={colors.text.tertiary}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor={colors.text.tertiary}
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6-digit pincode"
                  placeholderTextColor={colors.text.tertiary}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor={colors.text.tertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.defaultToggle}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View
                style={[styles.checkbox, isDefault && styles.checkboxChecked]}
              >
                {isDefault && <Check size={14} color={colors.text.inverse} />}
              </View>
              <Text style={styles.defaultToggleText}>
                Set as default address
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {initial ? "Update" : "Save Address"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.ui.overlay,
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ui.disabled,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  formScroll: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm + 4,
  },
  input: {
    backgroundColor: colors.ui.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    gap: spacing.sm + 4,
  },
  formHalf: {
    flex: 1,
  },
  defaultToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.ui.disabled,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  defaultToggleText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm + 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.ui.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
