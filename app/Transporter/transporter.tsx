import { colors, radius, shadows } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    FileText,
    ShieldCheck,
    Truck,
    Upload,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TransporterScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    aadhaar: null as string | null,
    pan: null as string | null,
  });

  const handleUpload = (field: "aadhaar" | "pan") => {
    // Mock file picker
    setForm((prev) => ({ ...prev, [field]: "document_uploaded.pdf" }));
    Alert.alert("Upload", `${field.toUpperCase()} uploaded successfully!`);
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.phone || !form.aadhaar || !form.pan) {
      Alert.alert(
        "Missing Fields",
        "Please fill all details and upload documents.",
      );
      return;
    }
    Alert.alert(
      "Application Submitted",
      "Your profile is under verification. We will contact you shortly.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Sangam Delivery</Text>
        <Truck size={24} color={colors.text.inverse} style={{ opacity: 0.8 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Intro Card */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Become a Partner</Text>
            <Text style={styles.introSub}>
              Earn by delivering goods in your city. Quick payments and flexible
              timings.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Personal Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name (as per Aadhaar)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. Rahul Verma"
                value={form.fullName}
                onChangeText={(t) => setForm({ ...form, fullName: t })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Current Address</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="House No, Street, Area..."
                multiline
                textAlignVertical="top"
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Document Verification</Text>

            {/* Aadhaar Upload */}
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => handleUpload("aadhaar")}
            >
              <View style={styles.uploadLeft}>
                <View
                  style={[
                    styles.iconBox,
                    form.aadhaar ? styles.iconBoxActive : null,
                  ]}
                >
                  {form.aadhaar ? (
                    <CheckCircle2 size={20} color={colors.text.inverse} />
                  ) : (
                    <FileText size={20} color={colors.brand.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.uploadTitle}>
                    Aadhaar Card (Front & Back)
                  </Text>
                  <Text style={styles.uploadSub}>
                    {form.aadhaar || "PDF or JPG max 2MB"}
                  </Text>
                </View>
              </View>
              {!form.aadhaar && (
                <Upload size={20} color={colors.text.secondary} />
              )}
            </TouchableOpacity>

            {/* PAN Upload */}
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => handleUpload("pan")}
            >
              <View style={styles.uploadLeft}>
                <View
                  style={[
                    styles.iconBox,
                    form.pan ? styles.iconBoxActive : null,
                  ]}
                >
                  {form.pan ? (
                    <CheckCircle2 size={20} color={colors.text.inverse} />
                  ) : (
                    <FileText size={20} color={colors.brand.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.uploadTitle}>PAN Card</Text>
                  <Text style={styles.uploadSub}>
                    {form.pan || "Identify Verification"}
                  </Text>
                </View>
              </View>
              {!form.pan && <Upload size={20} color={colors.text.secondary} />}
            </TouchableOpacity>
          </View>

          {/* Terms & Conditions (Strict) */}
          <View style={styles.termsBox}>
            <View style={styles.termsHeader}>
              <ShieldCheck size={20} color={colors.brand.primary} />
              <Text style={styles.termsTitle}>
                Terms of Service & Code of Conduct
              </Text>
            </View>
            <Text style={styles.termsText}>
              1. I verify that all submitted documents are genuine.
            </Text>
            <View style={styles.warningBox}>
              <AlertTriangle size={18} color={colors.status.errorDark} />
              <Text style={styles.warningText}>
                STRICT POLICY: Theft, tampering with packages, or any fraudulent
                activity will lead to immediate permanent ban and legal action
                under IPC. Sangam reserves the right to file a police complaint
                for any missing inventory assigned to you.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && (
                  <CheckCircle2 size={16} color={colors.text.inverse} />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the Terms & Conditions and understand the legal
                consequences of misconduct.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, !agreed && styles.submitBtnDisabled]}
            disabled={!agreed}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  header: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: colors.text.inverse, fontSize: 20, fontWeight: "700" },
  backBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 100 },

  introCard: {
    backgroundColor: colors.ui.surface,
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 20,
    ...shadows.small,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  introSub: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },

  // Upload Styles
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ui.surface,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderStyle: "dashed",
    marginBottom: 12,
  },
  uploadLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxActive: { backgroundColor: colors.status.success },
  uploadTitle: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  uploadSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },

  // Terms Styles
  termsBox: {
    backgroundColor: colors.ui.surface,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  termsTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  termsText: { fontSize: 14, color: colors.text.secondary, marginBottom: 12 },
  warningBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.status.errorLight,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.status.errorDark,
    fontWeight: "600",
    lineHeight: 18,
  },

  checkboxRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
  submitBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  submitBtnDisabled: { backgroundColor: colors.ui.disabled },
  submitText: { color: colors.text.inverse, fontSize: 16, fontWeight: "700" },
});
