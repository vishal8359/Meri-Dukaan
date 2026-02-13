// app/edit-profile.tsx
import { useApp } from "@/src/context/AppContext";
import { spacing } from "@/src/theme/colors";
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
        {focusedField === fieldName && <Check size={14} color="#10b981" />}
      </View>
      <View
        style={[
          styles.inputWrapper,
          focusedField === fieldName && styles.inputWrapperFocused,
        ]}
      >
        <Icon
          size={18}
          color={focusedField === fieldName ? "#3b82f6" : "#94a3b8"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
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
          <ArrowLeft size={24} color="#0f172a" />
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
          colors={["#f0f9ff", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{formData.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={18} color="#FFF" />
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
            <Check size={20} color="#FFF" />
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
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
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
    color: "#0f172a",
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
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ef4444",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: spacing.sm,
  },
  photoSubText: {
    fontSize: 12,
    color: "#94a3b8",
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
    backgroundColor: "#3b82f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
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
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: spacing.md,
    transition: "all 0.3s ease",
  },
  inputWrapperFocused: {
    borderColor: "#3b82f6",
    backgroundColor: "#f0f9ff",
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: "#0f172a",
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
    backgroundColor: "#3b82f6",
    paddingVertical: spacing.lg,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: "#FFF",
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
  },
});
