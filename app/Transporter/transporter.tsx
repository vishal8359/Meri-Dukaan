import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    CheckCircle2,
    CreditCard,
    FileText,
    Landmark,
    MapPin,
    Phone,
    ShieldCheck,
    Truck,
    Upload,
    User,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const STEPS = [
  { key: "personal", label: "Personal", icon: User },
  { key: "bank", label: "Bank", icon: Landmark },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "terms", label: "Terms", icon: ShieldCheck },
] as const;

export default function TransporterScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    vehicleType: "",
    aadhaar: null as string | null,
    pan: null as string | null,
    // Bank details
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  const handleUpload = (field: "aadhaar" | "pan") => {
    setForm((prev) => ({ ...prev, [field]: "document_uploaded.pdf" }));
    Alert.alert(
      "Uploaded",
      `${field === "aadhaar" ? "Aadhaar" : "PAN"} uploaded successfully!`,
    );
  };

  const animateTransition = (next: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return form.fullName.trim() && form.phone.trim().length === 10;
      case 1:
        return (
          form.accountHolder.trim() &&
          form.accountNumber.trim() &&
          form.accountNumber === form.confirmAccountNumber &&
          form.ifscCode.trim() &&
          form.bankName.trim()
        );
      case 2:
        return form.aadhaar && form.pan;
      case 3:
        return agreed;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!canProceed()) {
      Alert.alert("Incomplete", "Please fill all required fields.");
      return;
    }
    Alert.alert(
      "Application Submitted! 🎉",
      "Your profile is under verification. We'll contact you within 24-48 hours.",
      [{ text: "Done", onPress: () => router.back() }],
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <View key={step.key} style={styles.stepItem}>
            {i > 0 && (
              <View
                style={[
                  styles.stepLine,
                  (isActive || isCompleted) && styles.stepLineActive,
                ]}
              />
            )}
            <TouchableOpacity
              onPress={() => i < currentStep && animateTransition(i)}
              activeOpacity={i < currentStep ? 0.7 : 1}
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} color={colors.text.inverse} />
              ) : (
                <Icon
                  size={16}
                  color={isActive ? colors.text.inverse : colors.text.tertiary}
                />
              )}
            </TouchableOpacity>
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                isCompleted && styles.stepLabelCompleted,
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderPersonalStep = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <User size={20} color={colors.brand.primary} />
        </View>
        <View>
          <Text style={styles.cardTitle}>Personal Details</Text>
          <Text style={styles.cardSubtitle}>Tell us about yourself</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Full Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrap}>
          <User
            size={18}
            color={colors.text.tertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="As per Aadhaar card"
            placeholderTextColor={colors.text.tertiary}
            value={form.fullName}
            onChangeText={(t) => setForm({ ...form, fullName: t })}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Mobile Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrap}>
          <Phone
            size={18}
            color={colors.text.tertiary}
            style={styles.inputIcon}
          />
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="10-digit number"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="phone-pad"
            maxLength={10}
            value={form.phone}
            onChangeText={(t) =>
              setForm({ ...form, phone: t.replace(/[^0-9]/g, "") })
            }
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Current Address</Text>
        <View style={[styles.inputWrap, { alignItems: "flex-start" }]}>
          <MapPin
            size={18}
            color={colors.text.tertiary}
            style={[styles.inputIcon, { marginTop: 14 }]}
          />
          <TextInput
            style={[
              styles.input,
              { height: 80, textAlignVertical: "top", flex: 1 },
            ]}
            placeholder="House No, Street, Area, City..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            value={form.address}
            onChangeText={(t) => setForm({ ...form, address: t })}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.vehicleRow}>
          {["Bicycle", "Bike", "Auto", "Mini Truck"].map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setForm({ ...form, vehicleType: v })}
              style={[
                styles.vehicleChip,
                form.vehicleType === v && styles.vehicleChipActive,
              ]}
            >
              <Text
                style={[
                  styles.vehicleChipText,
                  form.vehicleType === v && styles.vehicleChipTextActive,
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderBankStep = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.cardIconWrap,
            { backgroundColor: colors.tint.greenLight },
          ]}
        >
          <Landmark size={20} color={colors.tint.green} />
        </View>
        <View>
          <Text style={styles.cardTitle}>Bank Details</Text>
          <Text style={styles.cardSubtitle}>For payment settlements</Text>
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Banknote size={16} color={colors.status.infoDark} />
        <Text style={styles.infoBannerText}>
          Earnings will be credited directly to this account every week.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Account Holder Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrap}>
          <User
            size={18}
            color={colors.text.tertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Name as per bank passbook"
            placeholderTextColor={colors.text.tertiary}
            value={form.accountHolder}
            onChangeText={(t) => setForm({ ...form, accountHolder: t })}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Account Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrap}>
          <CreditCard
            size={18}
            color={colors.text.tertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter account number"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            value={form.accountNumber}
            onChangeText={(t) =>
              setForm({ ...form, accountNumber: t.replace(/[^0-9]/g, "") })
            }
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Confirm Account Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrap}>
          <CreditCard
            size={18}
            color={colors.text.tertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Re-enter account number"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            value={form.confirmAccountNumber}
            onChangeText={(t) =>
              setForm({
                ...form,
                confirmAccountNumber: t.replace(/[^0-9]/g, ""),
              })
            }
          />
        </View>
        {form.confirmAccountNumber.length > 0 &&
          form.accountNumber !== form.confirmAccountNumber && (
            <Text style={styles.errorHint}>Account numbers do not match</Text>
          )}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>
            IFSC Code <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="SBIN0001234"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="characters"
              maxLength={11}
              value={form.ifscCode}
              onChangeText={(t) =>
                setForm({
                  ...form,
                  ifscCode: t.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                })
              }
            />
          </View>
        </View>
        <View style={{ width: 12 }} />
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>
            Bank Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="e.g. SBI"
              placeholderTextColor={colors.text.tertiary}
              value={form.bankName}
              onChangeText={(t) => setForm({ ...form, bankName: t })}
            />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>UPI ID (Optional)</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.upiAt}>@</Text>
          <TextInput
            style={styles.input}
            placeholder="yourname@upi"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            value={form.upiId}
            onChangeText={(t) => setForm({ ...form, upiId: t })}
          />
        </View>
      </View>
    </View>
  );

  const renderDocumentsStep = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.cardIconWrap,
            { backgroundColor: colors.tint.purpleLight },
          ]}
        >
          <FileText size={20} color={colors.tint.purple} />
        </View>
        <View>
          <Text style={styles.cardTitle}>Identity Verification</Text>
          <Text style={styles.cardSubtitle}>Upload your KYC documents</Text>
        </View>
      </View>

      {/* Aadhaar */}
      <TouchableOpacity
        style={[styles.uploadCard, form.aadhaar && styles.uploadCardDone]}
        onPress={() => handleUpload("aadhaar")}
        activeOpacity={0.7}
      >
        <View style={styles.uploadRow}>
          <View
            style={[
              styles.uploadIconWrap,
              form.aadhaar && { backgroundColor: colors.status.successLight },
            ]}
          >
            {form.aadhaar ? (
              <CheckCircle2 size={22} color={colors.status.success} />
            ) : (
              <FileText size={22} color={colors.brand.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>Aadhaar Card</Text>
            <Text style={styles.uploadSub}>
              {form.aadhaar
                ? "✓ Document uploaded"
                : "Front & Back · PDF or JPG · Max 2MB"}
            </Text>
          </View>
          {!form.aadhaar && (
            <View style={styles.uploadBtnSmall}>
              <Upload size={16} color={colors.brand.primary} />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* PAN */}
      <TouchableOpacity
        style={[styles.uploadCard, form.pan && styles.uploadCardDone]}
        onPress={() => handleUpload("pan")}
        activeOpacity={0.7}
      >
        <View style={styles.uploadRow}>
          <View
            style={[
              styles.uploadIconWrap,
              form.pan && { backgroundColor: colors.status.successLight },
            ]}
          >
            {form.pan ? (
              <CheckCircle2 size={22} color={colors.status.success} />
            ) : (
              <FileText size={22} color={colors.brand.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>PAN Card</Text>
            <Text style={styles.uploadSub}>
              {form.pan
                ? "✓ Document uploaded"
                : "Identity verification · PDF or JPG · Max 2MB"}
            </Text>
          </View>
          {!form.pan && (
            <View style={styles.uploadBtnSmall}>
              <Upload size={16} color={colors.brand.primary} />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.docNote}>
        <ShieldCheck size={14} color={colors.text.tertiary} />
        <Text style={styles.docNoteText}>
          Your documents are encrypted and stored securely.
        </Text>
      </View>
    </View>
  );

  const renderTermsStep = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.cardIconWrap,
            { backgroundColor: colors.tint.orangeLight },
          ]}
        >
          <ShieldCheck size={20} color={colors.brand.accent} />
        </View>
        <View>
          <Text style={styles.cardTitle}>Terms & Code of Conduct</Text>
          <Text style={styles.cardSubtitle}>Please read carefully</Text>
        </View>
      </View>

      <View style={styles.termsList}>
        <Text style={styles.termsItem}>
          1. I verify that all submitted documents and bank details are genuine
          and belong to me.
        </Text>
        <Text style={styles.termsItem}>
          2. I agree to maintain professionalism during all deliveries.
        </Text>
        <Text style={styles.termsItem}>
          3. I understand that delivery timelines must be strictly followed.
        </Text>
      </View>

      <View style={styles.warningBox}>
        <AlertTriangle size={18} color={colors.status.errorDark} />
        <Text style={styles.warningText}>
          STRICT POLICY: Theft, tampering with packages, or any fraudulent
          activity will lead to immediate permanent ban and legal action under
          IPC. myBusz reserves the right to file a police complaint for any
          missing inventory assigned to you.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAgreed(!agreed)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
          {agreed && <CheckCircle2 size={16} color={colors.text.inverse} />}
        </View>
        <Text style={styles.checkboxText}>
          I agree to the Terms & Conditions and understand the legal
          consequences of misconduct.
        </Text>
      </TouchableOpacity>
    </View>
  );

  const stepRenderers = [
    renderPersonalStep,
    renderBankStep,
    renderDocumentsStep,
    renderTermsStep,
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>myBusz Delivery</Text>
            <Text style={styles.headerSubtitle}>Partner Application</Text>
          </View>
          <View style={styles.headerTruckWrap}>
            <Truck size={22} color={colors.text.inverse} />
          </View>
        </View>

        {/* Step Indicator inside header */}
        {renderStepIndicator()}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {stepRenderers[currentStep]()}
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backStepBtn}
              onPress={() => animateTransition(currentStep - 1)}
            >
              <ArrowLeft size={18} color={colors.brand.primary} />
              <Text style={styles.backStepText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              !canProceed() && styles.nextBtnDisabled,
              currentStep === 0 && { flex: 1 },
            ]}
            disabled={!canProceed()}
            onPress={() => {
              if (currentStep < STEPS.length - 1) {
                animateTransition(currentStep + 1);
              } else {
                handleSubmit();
              }
            }}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === STEPS.length - 1
                ? "Submit Application"
                : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },

  // Header
  header: {
    backgroundColor: colors.brand.primary,
    paddingTop: Platform.OS === "android" ? 44 : 20,
    paddingBottom: 16,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: {
    color: colors.text.inverse,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  headerTruckWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Step Indicator
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    marginTop: 4,
  },
  stepItem: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  stepLine: {
    position: "absolute",
    top: 16,
    right: "50%",
    left: "-50%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    zIndex: -1,
  },
  stepLineActive: { backgroundColor: "rgba(255,255,255,0.5)" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  stepCircleActive: {
    backgroundColor: colors.brand.accent,
    borderColor: "rgba(255,255,255,0.3)",
  },
  stepCircleCompleted: {
    backgroundColor: colors.status.success,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
  },
  stepLabelActive: { color: colors.text.inverse },
  stepLabelCompleted: { color: "rgba(255,255,255,0.7)" },

  // Content
  content: { padding: spacing.md, paddingBottom: 120 },

  // Card
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  cardSubtitle: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },

  // Fields
  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.caption,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  required: { color: colors.status.error, fontSize: 13 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    overflow: "hidden",
  },
  inputIcon: { marginLeft: 12 },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: colors.ui.border,
    paddingVertical: 12,
  },
  upiAt: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.tertiary,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  errorHint: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: 4,
    fontWeight: "500",
  },

  // Vehicle chips
  vehicleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  vehicleChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.ui.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
  },
  vehicleChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  vehicleChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  vehicleChipTextActive: { color: colors.text.inverse },

  // Bank info banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.status.infoLight,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.status.infoDark,
    fontWeight: "500",
    lineHeight: 17,
  },
  row: { flexDirection: "row" },
  divider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: 18,
  },

  // Upload
  uploadCard: {
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    borderStyle: "dashed",
    marginBottom: 12,
  },
  uploadCardDone: {
    borderColor: colors.status.success,
    borderStyle: "solid",
    backgroundColor: colors.status.successLight,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  uploadSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
    lineHeight: 17,
  },
  uploadBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  docNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  docNoteText: { fontSize: 12, color: colors.text.tertiary },

  // Terms
  termsList: { marginBottom: 16 },
  termsItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  warningBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.status.errorLight,
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.status.errorDark,
    fontWeight: "600",
    lineHeight: 19,
  },
  checkboxRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 21,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    ...shadows.medium,
  },
  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  backStepText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: "center",
  },
  nextBtnDisabled: { backgroundColor: colors.ui.disabled },
  nextBtnText: { color: colors.text.inverse, fontSize: 16, fontWeight: "700" },
});
