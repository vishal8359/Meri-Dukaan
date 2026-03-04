// app/Profile/edit-profile.tsx
import { useApp, UserProfile } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// ─── Modular Sub-Components ─────────────────────────────────

/** Reusable section header */
const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconCircle}>
      <Ionicons name={icon as any} size={16} color={colors.brand.primaryLight} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/** Reusable input field */
const InputField = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType = "default",
    multiline = false,
    isFocused,
    onFocus,
    onBlur,
    editable = true,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: string;
    keyboardType?: string;
    multiline?: boolean;
    isFocused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    editable?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={isFocused ? colors.brand.primaryLight : colors.ui.muted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ui.disabled}
          keyboardType={keyboardType as any}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={editable}
        />
        {isFocused && (
          <Ionicons name="create-outline" size={16} color={colors.brand.primaryLight} />
        )}
      </View>
    </View>
  ),
);

// ─── Main Screen ─────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || "Vishal Kumar",
    email: user?.email || "vishal@sangam.in",
    phone: user?.phone || "+91 98765 43210",
    bio: user?.bio || "",
    address: user?.address || "Rajendra Nagar, Patna - 800016",
    city: user?.city || "Patna",
    state: user?.state || "Bihar",
    pincode: user?.pincode || "800016",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    const profileUpdate: Partial<UserProfile> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    };
    updateProfile(profileUpdate);
    Toast.show({ type: "success", text1: "Profile updated successfully" });
    setHasChanges(false);
    router.back();
  }, [formData, updateProfile, router]);

  const initials = formData.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveHeaderBtn, !hasChanges && styles.saveHeaderBtnDisabled]}
          onPress={handleSave}
          disabled={!hasChanges}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.saveHeaderBtnText,
              !hasChanges && styles.saveHeaderBtnTextDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
                <Ionicons name="camera" size={16} color={colors.text.inverse} />
              </TouchableOpacity>
              <Text style={styles.avatarName}>{formData.name}</Text>
              <Text style={styles.avatarSubtext}>Tap photo to change</Text>
            </View>

            {/* Personal Info */}
            <View style={styles.section}>
              <SectionHeader icon="person-outline" title="Personal" />

              <InputField
                label="Full Name"
                value={formData.name}
                onChangeText={(t) => updateField("name", t)}
                placeholder="Enter your name"
                icon="person-outline"
                isFocused={focusedField === "name"}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
              />

              <InputField
                label="Bio"
                value={formData.bio}
                onChangeText={(t) => updateField("bio", t)}
                placeholder="Tell us about yourself"
                icon="document-text-outline"
                multiline
                isFocused={focusedField === "bio"}
                onFocus={() => setFocusedField("bio")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
              <SectionHeader icon="call-outline" title="Contact" />

              <InputField
                label="Email"
                value={formData.email}
                onChangeText={(t) => updateField("email", t)}
                placeholder="your@email.com"
                icon="mail-outline"
                keyboardType="email-address"
                isFocused={focusedField === "email"}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />

              <InputField
                label="Phone"
                value={formData.phone}
                onChangeText={(t) => updateField("phone", t)}
                placeholder="+91 00000 00000"
                icon="call-outline"
                keyboardType="phone-pad"
                isFocused={focusedField === "phone"}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Address */}
            <View style={styles.section}>
              <SectionHeader icon="location-outline" title="Address" />

              <InputField
                label="Street Address"
                value={formData.address}
                onChangeText={(t) => updateField("address", t)}
                placeholder="Enter your address"
                icon="home-outline"
                multiline
                isFocused={focusedField === "address"}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField(null)}
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <InputField
                    label="City"
                    value={formData.city}
                    onChangeText={(t) => updateField("city", t)}
                    placeholder="City"
                    icon="business-outline"
                    isFocused={focusedField === "city"}
                    onFocus={() => setFocusedField("city")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View style={styles.halfField}>
                  <InputField
                    label="State"
                    value={formData.state}
                    onChangeText={(t) => updateField("state", t)}
                    placeholder="State"
                    icon="map-outline"
                    isFocused={focusedField === "state"}
                    onFocus={() => setFocusedField("state")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <InputField
                label="PIN Code"
                value={formData.pincode}
                onChangeText={(t) => updateField("pincode", t)}
                placeholder="000000"
                icon="keypad-outline"
                keyboardType="numeric"
                isFocused={focusedField === "pincode"}
                onFocus={() => setFocusedField("pincode")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Bottom Save Button */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!hasChanges}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 56,
    paddingBottom: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
    ...shadows.small,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
  },
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primaryLight,
  },
  saveHeaderBtnDisabled: {
    backgroundColor: colors.ui.backgroundAlt,
  },
  saveHeaderBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  saveHeaderBtnTextDisabled: {
    color: colors.ui.disabled,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    backgroundColor: colors.ui.surface,
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.ui.surface,
    ...shadows.medium,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  cameraBtn: {
    position: "absolute",
    top: spacing.xl + 58,
    right: "50%",
    marginRight: -44,
    backgroundColor: colors.brand.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.ui.surface,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginTop: 12,
  },
  avatarSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Sections
  section: {
    backgroundColor: colors.ui.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Input
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: colors.brand.primaryLight,
    backgroundColor: colors.tint.blueLight,
  },
  inputWrapperDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: "top",
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },

  // Bottom Actions
  bottomActions: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand.primaryLight,
    paddingVertical: 15,
    borderRadius: radius.md,
    ...shadows.small,
  },
  saveBtnDisabled: {
    backgroundColor: colors.ui.disabled,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.secondary,
  },
});
