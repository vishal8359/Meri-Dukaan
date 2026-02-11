// app/change-password.tsx
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = () => {
    // Validation
    if (!formData.currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    if (!formData.newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    if (formData.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // In real app, verify current password and update
    Alert.alert("Success", "Password changed successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    field,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    field: "current" | "new" | "confirm";
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Lock size={18} color={colors.text.secondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={!showPasswords[field]}
        />
        <TouchableOpacity onPress={() => togglePasswordVisibility(field)}>
          {showPasswords[field] ? (
            <EyeOff size={20} color={colors.text.secondary} />
          ) : (
            <Eye size={20} color={colors.text.secondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Choose a strong password with at least 6 characters, including
            letters and numbers.
          </Text>
        </View>

        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          value={formData.currentPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, currentPassword: text })
          }
          placeholder="Enter current password"
          field="current"
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          value={formData.newPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, newPassword: text })
          }
          placeholder="Enter new password"
          field="new"
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
          placeholder="Re-enter new password"
          field="confirm"
        />

        {/* Password Requirements */}
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirementItem}>• At least 6 characters</Text>
          <Text style={styles.requirementItem}>
            • Mix of letters and numbers recommended
          </Text>
          <Text style={styles.requirementItem}>• Avoid common words</Text>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleChangePassword}
        >
          <Text style={styles.changeButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotButtonText}>Forgot Password?</Text>
        </TouchableOpacity>
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
    ...shadows.small,
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
  infoBox: {
    backgroundColor: "#dbeafe",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
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
  requirementsBox: {
    backgroundColor: "#f1f5f9",
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  requirementItem: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  forgotButton: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  forgotButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.primary,
  },
});
