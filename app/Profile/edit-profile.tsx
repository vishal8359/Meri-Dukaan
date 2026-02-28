// app/edit-profile.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Camera,
    Check,
    Mail,
    MapPin,
    Phone,
    User,
} from "lucide-react-native";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || "Vishal Kumar",
    email: user?.email || "vishal@sangam.in",
    phone: "+91 98765 43210",
    address: "Rajendra Nagar, Patna - 800016",
    city: "Patna",
    state: "Bihar",
    pincode: "800016",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSave = () => {
    Alert.alert("Success", "Profile updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon: Icon,
    keyboardType = "default",
    multiline = false,
    fieldName,
  }: any) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {focusedField === fieldName && (
          <Check size={14} color={colors.tint.green} />
        )}
      </View>
      <View
        style={[
          styles.inputWrapper,
          focusedField === fieldName && styles.inputWrapperFocused,
        ]}
      >
        <Icon
          size={18}
          color={
            focusedField === fieldName ? colors.status.info : colors.ui.muted
          }
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ui.disabled}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField(null)}
        />
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <LinearGradient
          colors={[colors.tint.blueLight, colors.ui.surfaceHover]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{formData.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={14} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          <Text style={styles.photoSubText}>JPG or PNG up to 5MB</Text>
        </LinearGradient>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <InputField
            label="Full Name"
            value={formData.name}
            onChangeText={(text: string) =>
              setFormData({ ...formData, name: text })
            }
            placeholder="Enter your name"
            icon={User}
            fieldName="name"
          />

          <InputField
            label="Email Address"
            value={formData.email}
            onChangeText={(text: string) =>
              setFormData({ ...formData, email: text })
            }
            placeholder="Enter your email"
            icon={Mail}
            keyboardType="email-address"
            fieldName="email"
          />

          <InputField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text: string) =>
              setFormData({ ...formData, phone: text })
            }
            placeholder="Enter your phone"
            icon={Phone}
            keyboardType="phone-pad"
            fieldName="phone"
          />
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Address Information</Text>
          </View>

          <InputField
            label="Street Address"
            value={formData.address}
            onChangeText={(text: string) =>
              setFormData({ ...formData, address: text })
            }
            placeholder="Enter your address"
            icon={MapPin}
            multiline
            fieldName="address"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="City"
                value={formData.city}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, city: text })
                }
                placeholder="City"
                icon={MapPin}
                fieldName="city"
              />
            </View>

            <View style={styles.halfWidth}>
              <InputField
                label="State"
                value={formData.state}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, state: text })
                }
                placeholder="State"
                icon={MapPin}
                fieldName="state"
              />
            </View>
          </View>

          <InputField
            label="PIN Code"
            value={formData.pincode}
            onChangeText={(text: string) =>
              setFormData({ ...formData, pincode: text })
            }
            placeholder="Enter PIN code"
            icon={MapPin}
            keyboardType="numeric"
            fieldName="pincode"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Check size={20} color={colors.text.inverse} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.surfaceHover,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.status.info,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.ui.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.status.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.ui.surface,
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  photoSubText: {
    fontSize: 12,
    color: colors.ui.muted,
    marginTop: 2,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.status.info,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    paddingHorizontal: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: colors.status.info,
    backgroundColor: colors.tint.blueLight,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  multilineInput: {
    paddingVertical: spacing.sm,
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  buttonSection: {
    marginHorizontal: spacing.md,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.info,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    shadowColor: colors.status.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: colors.ui.surface,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.ui.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.secondary,
  },
});
