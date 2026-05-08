import {
  cancelOnboarding,
  getOnboardingResult,
  getOnboardingStatus,
  submitOnboardingReview,
  updateOnboardingDetail,
  uploadOnboardingDocuments,
  type OnboardingResult,
  type OnboardingStatus
} from "@/src/api/onboarding";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Truck,
  Upload,
  XCircle
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// ── Step Flow ────────────────────────────────────────────────
type FlowStep = "upload" | "processing" | "review" | "result";

// ── Pipeline Steps for progress display ─────────────────────
const PIPELINE_LABELS: Record<string, { icon: string; label: string }> = {
  uploading:        { icon: "⬆️", label: "Uploading Documents" },
  extracting_data:  { icon: "🔍", label: "Extracting Data (AI/OCR)" },
  face_verification:{ icon: "👤", label: "Face Verification" },
  validation:       { icon: "✅", label: "Validating Information" },
  ai_scoring:       { icon: "🧮", label: "AI Scoring" },
  final_decision:   { icon: "⚖️", label: "Final Decision" },
};

export default function TransporterScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── State ──────────────────────────────────────────
  const [flowStep, setFlowStep] = useState<FlowStep>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Upload step state
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [panCardImage, setPanCardImage] = useState<string | null>(null);
  const [drivingLicenseImage, setDrivingLicenseImage] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [vehicleType, setVehicleType] = useState("");

  // Processing step state
  const [processingStatus, setProcessingStatus] = useState<OnboardingStatus | null>(null);
  const [pollingRef, setPollingRef] = useState<ReturnType<typeof setInterval> | null>(null);

  // Review step state
  const [editableData, setEditableData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    upiId: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Result step state
  const [resultData, setResultData] = useState<OnboardingResult | null>(null);

  // Partial update state
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpiPrompt, setShowUpiPrompt] = useState(false);
  const [newUpiText, setNewUpiText] = useState("");

  const [showVehiclePrompt, setShowVehiclePrompt] = useState(false);
  const [newVehicleText, setNewVehicleText] = useState("");


  // ── Pulse animation for processing ─────────────────
  useEffect(() => {
    if (flowStep === "processing") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [flowStep]);

  // ── Check existing application on mount ────────────
  useEffect(() => {
    checkExistingApplication();
    return () => {
      if (pollingRef) clearInterval(pollingRef);
    };
  }, []);

  const checkExistingApplication = async () => {
    try {
      const status = await getOnboardingStatus();
      if (status.hasApplication) {
        if (status.status === "processing") {
          setProcessingStatus(status);
          setFlowStep("processing");
          startPolling();
        } else if (status.status === "verified" || status.status === "rejected") {
          const result = await getOnboardingResult();
          setResultData(result);
          setFlowStep("result");
        }
      }
    } catch (err) {
      // No existing application — stay on upload
    } finally {
      setInitialCheckDone(true);
    }
  };

  // ── Polling for processing status ──────────────────
  const startPolling = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const status = await getOnboardingStatus();
        setProcessingStatus(status);

        if (status.status === "verified" || status.status === "rejected") {
          clearInterval(interval);
          setPollingRef(null);
          // Fetch full result
          const result = await getOnboardingResult();
          setResultData(result);

          // If verified, also populate review data
          if (result.profile) {
            setEditableData({
              fullName: result.profile.fullName || "",
              dateOfBirth: result.profile.dateOfBirth || "",
              address: result.profile.address || "",
              upiId: result.profile.upiId || "",
            });
          }

          // Short delay for animation, then show result
          setTimeout(() => {
            animateTransition("result");
          }, 1500);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    setPollingRef(interval);
  }, []);

  // ── Animation helper ───────────────────────────────
  const animateTransition = (next: FlowStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0, duration: 150, useNativeDriver: true,
    }).start(() => {
      setFlowStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 250, useNativeDriver: true,
      }).start();
    });
  };

  // ── Image Picker ───────────────────────────────────
  const pickImage = async (type: "aadhaar" | "selfie" | "pancard" | "license") => {
    const isSelfie = type === "selfie";

    const permResult = isSelfie
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert("Permission needed", `Please allow ${isSelfie ? "camera" : "gallery"} access.`);
      return;
    }

    const result = isSelfie
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: true,
          aspect: [1, 1],
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: true,
        });

    if (!result.canceled && result.assets[0]) {
      if (type === "aadhaar") {
        setAadhaarImage(result.assets[0].uri);
      } else if (type === "selfie") {
        setSelfieImage(result.assets[0].uri);
      } else if (type === "pancard") {
        setPanCardImage(result.assets[0].uri);
      } else if (type === "license") {
        setDrivingLicenseImage(result.assets[0].uri);
      }
    }
  };

  // ── Upload & Start Pipeline ────────────────────────
  const handleUpload = async () => {
    if (!aadhaarImage || !selfieImage || !panCardImage || !upiId.trim()) {
      Alert.alert("Missing Fields", "Please upload Aadhaar, PAN Card, Selfie, and enter UPI ID.");
      return;
    }

    const isMotorized = vehicleType && !["Walk", "Bicycle"].includes(vehicleType);
    if (isMotorized && !drivingLicenseImage) {
      Alert.alert("Missing License", "Driving License is required for motorized vehicles.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await uploadOnboardingDocuments(
        aadhaarImage,
        selfieImage,
        panCardImage,
        drivingLicenseImage,
        upiId.trim(),
        {
          bankAccountHolder: bankDetails.accountHolder || undefined,
          bankAccountNumber: bankDetails.accountNumber || undefined,
          bankIfsc: bankDetails.ifscCode || undefined,
          bankName: bankDetails.bankName || undefined,
          vehicleType: vehicleType || undefined,
        }
      );

      // Move to processing view
      animateTransition("processing");
      startPolling();
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Could not upload documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Submit Review ──────────────────────────────────
  const handleSubmitReview = async () => {
    if (!termsAccepted) {
      Alert.alert("Terms Required", "Please accept the Terms & Conditions.");
      return;
    }

    setIsLoading(true);
    try {
      await submitOnboardingReview({
        ...editableData,
        termsAccepted: true,
      });
      Alert.alert("Submitted!", "Your information has been saved.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not submit review.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Retry ──────────────────────────────────────────
  const handleRetry = () => {
    if (resultData?.profile) {
      setAadhaarImage(resultData.profile.aadhaarImageUrl || null);
      setSelfieImage(resultData.profile.selfieImageUrl || null);
      setPanCardImage(resultData.profile.panCardImageUrl || null);
      setDrivingLicenseImage(resultData.profile.drivingLicenseImageUrl || null);
      setUpiId(resultData.profile.upiId || "");
      if (resultData.profile.vehicleType) {
        setVehicleType(resultData.profile.vehicleType);
      }
    } else {
      setAadhaarImage(null);
      setSelfieImage(null);
      setPanCardImage(null);
      setDrivingLicenseImage(null);
      setUpiId("");
    }
    setResultData(null);
    setProcessingStatus(null);
    setTermsAccepted(false);
    animateTransition("upload");
  };

  // ── Cancel ─────────────────────────────────────────
  const handleCancel = async () => {
    try {
      await cancelOnboarding();
      if (pollingRef) {
        clearInterval(pollingRef);
        setPollingRef(null);
      }
      setProcessingStatus(null);
      animateTransition("upload");
    } catch (err: any) {
      Alert.alert("Cancellation Failed", err.message || "Failed to cancel process");
    }
  };

  // ── Partial Update ─────────────────────────────────
  const handleUpdateDetail = async (fieldKey: string) => {
    if (fieldKey === "UPI ID") {
      setNewUpiText(resultData?.profile.upiId || "");
      setShowUpiPrompt(true);
    } else {
      let apiField = "";
      if (fieldKey === "Aadhaar") apiField = "aadhaar";
      else if (fieldKey === "PAN Card") apiField = "panCard";
      else if (fieldKey === "Selfie") apiField = "selfie";
      else if (fieldKey === "Vehicle") {
        setNewVehicleText(resultData?.profile.vehicleType || "");
        setShowVehiclePrompt(true);
        return;
      }
      
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (!result.canceled && result.assets[0].uri) {
        setIsUpdating(true);
        setUpdatingField(fieldKey);
        try {
          const res = await updateOnboardingDetail(apiField, undefined, result.assets[0].uri);
          Alert.alert("Success", res.message);
          // Manually restart fetch logic instead of calling checkExistingApplication directly to re-fetch
          const status = await getOnboardingStatus();
          if (status.status === "verified" || status.status === "rejected") {
            const finalRes = await getOnboardingResult();
            setResultData(finalRes);
          }
        } catch (err: any) {
          Alert.alert("Error", err.message || "Failed to update detail");
        } finally {
          setIsUpdating(false);
          setUpdatingField(null);
        }
      }
    }
  };

  const submitUpiUpdate = async () => {
    if (!newUpiText.trim()) return;
    setShowUpiPrompt(false);
    setIsUpdating(true);
    setUpdatingField("UPI ID");
    try {
      const res = await updateOnboardingDetail("upiId", newUpiText.trim());
      Alert.alert("Success", res.message);
      const status = await getOnboardingStatus();
      if (status.status === "verified" || status.status === "rejected") {
        const finalRes = await getOnboardingResult();
        setResultData(finalRes);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update UPI");
    } finally {
      setIsUpdating(false);
      setUpdatingField(null);
    }
  };

  const submitVehicleUpdate = async () => {
    if (!newVehicleText.trim()) return;
    setShowVehiclePrompt(false);
    setIsUpdating(true);
    setUpdatingField("Vehicle");
    try {
      const res = await updateOnboardingDetail("vehicleType", newVehicleText.trim());
      Alert.alert("Success", res.message);
      const status = await getOnboardingStatus();
      if (status.status === "verified" || status.status === "rejected") {
        const finalRes = await getOnboardingResult();
        setResultData(finalRes);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update Vehicle");
    } finally {
      setIsUpdating(false);
      setUpdatingField(null);
    }
  };

  // ── Step Indicator ─────────────────────────────────
  const FLOW_STEPS: { key: FlowStep; label: string; icon: any }[] = [
    { key: "upload", label: "Upload", icon: Upload },
    { key: "processing", label: "AI Processing", icon: Loader2 },
    { key: "result", label: "Result", icon: ShieldCheck },
  ];

  const currentStepIndex = FLOW_STEPS.findIndex((s) => s.key === flowStep);

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {FLOW_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.key === flowStep || (flowStep === "review" && step.key === "result");
        const isCompleted = i < currentStepIndex || (flowStep === "review" && i <= 1);
        return (
          <View key={step.key} style={styles.stepItem}>
            {i > 0 && (
              <View style={[styles.stepLine, (isActive || isCompleted) && styles.stepLineActive]} />
            )}
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} color={colors.text.inverse} />
              ) : (
                <Icon size={16} color={isActive ? colors.text.inverse : colors.text.tertiary} />
              )}
            </View>
            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isCompleted && styles.stepLabelCompleted]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 1: Upload Screen
  // ═══════════════════════════════════════════════════════════
  const renderUploadStep = () => (
    <View>
      {/* Aadhaar Upload Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <FileText size={20} color={colors.brand.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Aadhaar Card</Text>
            <Text style={styles.cardSubtitle}>Upload a clear photo of your Aadhaar</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.uploadZone, aadhaarImage && styles.uploadZoneDone]}
          onPress={() => pickImage("aadhaar")}
          activeOpacity={0.7}
        >
          {aadhaarImage ? (
            <View style={styles.uploadPreview}>
              <Image source={{ uri: aadhaarImage }} style={styles.previewImage} contentFit="cover" />
              <View style={styles.uploadOverlay}>
                <CheckCircle2 size={32} color={colors.status.success} />
                <Text style={styles.uploadOverlayText}>Aadhaar Uploaded</Text>
                <Text style={styles.uploadOverlayHint}>Tap to change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Upload size={28} color={colors.brand.primary} />
              </View>
              <Text style={styles.uploadMainText}>Upload Aadhaar Card</Text>
              <Text style={styles.uploadHintText}>Front side · JPG, PNG · Max 5MB</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Selfie Capture Card */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: colors.tint.purpleLight }]}>
            <Camera size={20} color={colors.tint.purple} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Live Selfie</Text>
            <Text style={styles.cardSubtitle}>Take a clear selfie for face verification</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.uploadZone, selfieImage && styles.uploadZoneDone]}
          onPress={() => pickImage("selfie")}
          activeOpacity={0.7}
        >
          {selfieImage ? (
            <View style={styles.uploadPreview}>
              <Image source={{ uri: selfieImage }} style={styles.selfiePreview} contentFit="cover" />
              <View style={styles.uploadOverlay}>
                <CheckCircle2 size={32} color={colors.status.success} />
                <Text style={styles.uploadOverlayText}>Selfie Captured</Text>
                <Text style={styles.uploadOverlayHint}>Tap to retake</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={[styles.uploadIconCircle, { backgroundColor: colors.tint.purpleLight }]}>
                <Camera size={28} color={colors.tint.purple} />
              </View>
              <Text style={styles.uploadMainText}>Take Selfie</Text>
              <Text style={styles.uploadHintText}>Look at the camera · Good lighting</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* UPI ID */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: colors.tint.greenLight }]}>
            <CreditCard size={20} color={colors.tint.green} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Payment Details</Text>
            <Text style={styles.cardSubtitle}>For receiving delivery earnings</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            UPI ID <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrap}>
            <Text style={styles.upiAt}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@paytm"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>
        </View>

        {/* Vehicle Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {["Walk", "Bicycle", "Bike", "Auto", "Mini Truck"].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setVehicleType(v)}
                style={[styles.vehicleChip, vehicleType === v && styles.vehicleChipActive]}
              >
                <Text style={[styles.vehicleChipText, vehicleType === v && styles.vehicleChipTextActive]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PAN Card Upload */}
        <View style={[styles.card, { marginTop: 16, borderTopWidth: 0 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.tint.orangeLight }]}>
              <FileText size={20} color={colors.tint.orange} />
            </View>
            <View>
              <Text style={styles.cardTitle}>PAN Card <Text style={styles.required}>*</Text></Text>
              <Text style={styles.cardSubtitle}>Required for tax purposes</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.uploadZone, panCardImage && styles.uploadZoneDone]}
            onPress={() => pickImage("pancard")}
            activeOpacity={0.7}
          >
            {panCardImage ? (
              <View style={styles.uploadPreview}>
                <Image source={{ uri: panCardImage }} style={styles.previewImage} contentFit="cover" />
                <View style={styles.uploadOverlay}>
                  <CheckCircle2 size={32} color={colors.status.success} />
                  <Text style={styles.uploadOverlayText}>Captured</Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={[styles.uploadIconCircle, { backgroundColor: colors.tint.orangeLight }]}>
                  <Upload size={28} color={colors.tint.orange} />
                </View>
                <Text style={styles.uploadMainText}>Upload PAN Card</Text>
                <Text style={styles.uploadHintText}>Clear photo of front side</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Driving License Upload (Conditional) */}
        {vehicleType && !["Walk", "Bicycle"].includes(vehicleType) && (
          <View style={[styles.card, { marginTop: 16, borderTopWidth: 0 }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.tint.purpleLight }]}>
                <FileText size={20} color={colors.tint.purple} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Driving License <Text style={styles.required}>*</Text></Text>
                <Text style={styles.cardSubtitle}>Required for motorized vehicles</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.uploadZone, drivingLicenseImage && styles.uploadZoneDone]}
              onPress={() => pickImage("license")}
              activeOpacity={0.7}
            >
              {drivingLicenseImage ? (
                <View style={styles.uploadPreview}>
                  <Image source={{ uri: drivingLicenseImage }} style={styles.previewImage} contentFit="cover" />
                  <View style={styles.uploadOverlay}>
                    <CheckCircle2 size={32} color={colors.status.success} />
                    <Text style={styles.uploadOverlayText}>Captured</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={[styles.uploadIconCircle, { backgroundColor: colors.tint.purpleLight }]}>
                    <Upload size={28} color={colors.tint.purple} />
                  </View>
                  <Text style={styles.uploadMainText}>Upload Driving License</Text>
                  <Text style={styles.uploadHintText}>Clear photo of front side</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Optional Bank Details toggle */}
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => setShowBankDetails(!showBankDetails)}
          activeOpacity={0.7}
        >
          <Landmark size={16} color={colors.text.secondary} />
          <Text style={styles.expandToggleText}>Bank Details (Optional)</Text>
          {showBankDetails ? (
            <ChevronUp size={18} color={colors.text.secondary} />
          ) : (
            <ChevronDown size={18} color={colors.text.secondary} />
          )}
        </TouchableOpacity>

        {showBankDetails && (
          <View style={styles.bankSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Holder Name</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="As per bank passbook"
                  placeholderTextColor={colors.text.tertiary}
                  value={bankDetails.accountHolder}
                  onChangeText={(t) => setBankDetails({ ...bankDetails, accountHolder: t })}
                />
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Number</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter account number"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                  value={bankDetails.accountNumber}
                  onChangeText={(t) => setBankDetails({ ...bankDetails, accountNumber: t.replace(/[^0-9]/g, "") })}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>IFSC Code</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="SBIN0001234"
                    placeholderTextColor={colors.text.tertiary}
                    autoCapitalize="characters"
                    maxLength={11}
                    value={bankDetails.ifscCode}
                    onChangeText={(t) => setBankDetails({ ...bankDetails, ifscCode: t.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                  />
                </View>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Bank Name</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. SBI"
                    placeholderTextColor={colors.text.tertiary}
                    value={bankDetails.bankName}
                    onChangeText={(t) => setBankDetails({ ...bankDetails, bankName: t })}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <ShieldCheck size={14} color={colors.tint.green} />
        <Text style={styles.securityNoteText}>
          Your documents are encrypted and processed by AI. No human reviews your data.
        </Text>
      </View>
    </View>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 2: AI Processing Screen
  // ═══════════════════════════════════════════════════════════
  const renderProcessingStep = () => {
    const steps = processingStatus?.steps || [];
    const progress = processingStatus?.progress || 0;

    return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={styles.card}>
          <View style={styles.processingHeader}>
            <View style={styles.processingIconWrap}>
              <ActivityIndicator size="large" color={colors.brand.primary} />
            </View>
            <Text style={styles.processingTitle}>AI is Verifying...</Text>
            <Text style={styles.processingSubtitle}>
              Our AI is analyzing your documents. This usually takes 30–60 seconds.
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarOuter}>
            <Animated.View
              style={[
                styles.progressBarInner,
                { width: `${Math.max(progress, 5)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>

          {/* Step List */}
          <View style={styles.pipelineList}>
            {steps.map((step, i) => {
              const meta = PIPELINE_LABELS[step.name] || { icon: "📋", label: step.label };
              return (
                <View key={step.name} style={styles.pipelineItem}>
                  <View style={[
                    styles.pipelineStatus,
                    step.status === "completed" && styles.pipelineStatusDone,
                    step.status === "processing" && styles.pipelineStatusActive,
                    step.status === "failed" && styles.pipelineStatusFailed,
                  ]}>
                    {step.status === "completed" ? (
                      <CheckCircle2 size={16} color={colors.text.inverse} />
                    ) : step.status === "processing" ? (
                      <ActivityIndicator size="small" color={colors.text.inverse} />
                    ) : step.status === "failed" ? (
                      <XCircle size={16} color={colors.text.inverse} />
                    ) : (
                      <Text style={styles.pipelineNumber}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={styles.pipelineContent}>
                    <Text style={[
                      styles.pipelineLabel,
                      step.status === "completed" && styles.pipelineLabelDone,
                      step.status === "processing" && styles.pipelineLabelActive,
                    ]}>
                      {meta.icon} {meta.label}
                    </Text>
                    {step.error && (
                      <Text style={styles.pipelineError}>{step.error}</Text>
                    )}
                  </View>
                  {step.status === "completed" && (
                    <Text style={styles.pipelineCheck}>✓</Text>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.retryBtn, { marginTop: 24, borderColor: colors.status.error }]}
            onPress={handleCancel}
          >
            <Text style={[styles.retryBtnText, { color: colors.status.error }]}>Cancel Verification</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // STEP 3: Result Screen
  // ═══════════════════════════════════════════════════════════
  const renderResultStep = () => {
    if (!resultData) return null;

    const isVerified = resultData.status === "verified";

    return (
      <View>
        {/* Decision Banner */}
        <View style={[styles.resultBanner, isVerified ? styles.resultBannerSuccess : styles.resultBannerError]}>
          <View style={styles.resultIconWrap}>
            {isVerified ? (
              <CheckCircle2 size={48} color={colors.status.success} />
            ) : (
              <XCircle size={48} color={colors.status.error} />
            )}
          </View>
          <Text style={[styles.resultTitle, isVerified ? styles.resultTitleSuccess : styles.resultTitleError]}>
            {isVerified ? "Verified! 🎉" : "Not Approved"}
          </Text>
          <Text style={styles.resultSubtitle}>
            {isVerified
              ? "You are now a verified myBusz Delivery Partner!"
              : "Your application could not be verified at this time."}
          </Text>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreChipText}>
              Score: {resultData.scores.overall}/100
            </Text>
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          {[
            { label: "Aadhaar Authenticity", score: resultData.scores.aadhaarAuthenticity, weight: "30%" },
            { label: "Face Match", score: resultData.scores.faceMatch, weight: "25%" },
            { label: "Data Consistency", score: resultData.scores.dataConsistency, weight: "15%" },
            { label: "Age Eligibility", score: resultData.scores.ageEligibility, weight: "10%" },
            { label: "UPI Validity", score: resultData.scores.upiValidity, weight: "10%" },
            { label: "Image Clarity", score: resultData.scores.imageClarity, weight: "10%" },
          ].map((item) => (
            <View key={item.label} style={styles.scoreRow}>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreLabel}>{item.label}</Text>
                <Text style={styles.scoreWeight}>Weight: {item.weight}</Text>
              </View>
              <View style={styles.scoreBarOuter}>
                <View
                  style={[
                    styles.scoreBarInner,
                    {
                      width: `${item.score}%`,
                      backgroundColor:
                        item.score >= 80 ? colors.status.success
                        : item.score >= 50 ? colors.status.warning
                        : colors.status.error,
                    },
                  ]}
                />
              </View>
              <Text style={[
                styles.scoreValue,
                {
                  color:
                    item.score >= 80 ? colors.status.successDark
                    : item.score >= 50 ? colors.status.warningDark
                    : colors.status.errorDark,
                },
              ]}>
                {item.score}
              </Text>
            </View>
          ))}
        </View>

        {/* Rejection Reasons */}
        {!isVerified && resultData.rejectionReasons.length > 0 && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.status.errorDark }]}>
              Reasons for Rejection
            </Text>
            {resultData.rejectionReasons.map((reason, i) => (
              <View key={i} style={styles.rejectionItem}>
                <View style={styles.rejectionHeader}>
                  <XCircle size={16} color={colors.status.error} />
                  <Text style={styles.rejectionMessage}>{reason.message}</Text>
                </View>
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionLabel}>💡 Suggestion:</Text>
                  <Text style={styles.suggestionText}>{reason.suggestion}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Extracted Profile */}
        {resultData.profile && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Your Partner Profile</Text>
            {[
              { label: "Name", value: resultData.profile.fullName, editable: false },
              { label: "Date of Birth", value: resultData.profile.dateOfBirth, editable: false },
              { label: "Gender", value: resultData.profile.gender, editable: false },
              { label: "Aadhaar", value: resultData.profile.aadhaarMasked, editable: true },
              { label: "PAN Card", value: "Uploaded", editable: true },
              { label: "Selfie", value: "Uploaded", editable: true },
              { label: "UPI ID", value: resultData.profile.upiId, editable: true },
              { label: "Vehicle", value: resultData.profile.vehicleType, editable: true },
            ]
              .filter((f) => f.value)
              .map((field) => (
                <View key={field.label} style={styles.profileField}>
                  <Text style={styles.profileLabel}>{field.label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={styles.profileValue}>{field.value}</Text>
                    {field.editable && (
                      <TouchableOpacity onPress={() => handleUpdateDetail(field.label)}>
                        <Pencil size={14} color={colors.brand.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Terms (for verified users) */}
        {isVerified && !resultData.termsAccepted && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={styles.warningBox}>
              <AlertTriangle size={18} color={colors.status.errorDark} />
              <Text style={styles.warningText}>
                STRICT POLICY: Theft, tampering with packages, or any fraudulent
                activity will lead to immediate permanent ban and legal action.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                {termsAccepted && <CheckCircle2 size={16} color={colors.text.inverse} />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the Terms & Conditions and Code of Conduct.
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // Footer Buttons
  // ═══════════════════════════════════════════════════════════
  const renderFooter = () => {
    if (flowStep === "processing") return null;

    if (flowStep === "upload") {
      const canUpload = aadhaarImage && selfieImage && upiId.trim();
      return (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, !canUpload && styles.submitBtnDisabled]}
            disabled={!canUpload || isLoading}
            onPress={handleUpload}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <>
                <Upload size={18} color={colors.text.inverse} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Upload & Verify with AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (flowStep === "result") {
      const isVerified = resultData?.status === "verified";
      return (
        <View style={styles.footer}>
          {!isVerified && (
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.7}>
              <RefreshCw size={18} color={colors.brand.primary} />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          )}
          {isVerified && !resultData?.termsAccepted && (
            <TouchableOpacity
              style={[styles.submitBtn, !termsAccepted && styles.submitBtnDisabled]}
              disabled={!termsAccepted || isLoading}
              onPress={handleSubmitReview}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.submitBtnText}>Accept & Complete</Text>
              )}
            </TouchableOpacity>
          )}
          {isVerified && resultData?.termsAccepted && (
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.status.success }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <CheckCircle2 size={18} color={colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Done — Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════
  // Loading state
  // ═══════════════════════════════════════════════════════════
  if (!initialCheckDone) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={{ color: colors.text.secondary, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Main Render
  // ═══════════════════════════════════════════════════════════
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>myBusz Delivery</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Partner Verification</Text>
          </View>
          <View style={styles.headerTruckWrap}>
            <Truck size={22} color={colors.text.inverse} />
          </View>
        </View>
        {renderStepIndicator()}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {flowStep === "upload" && renderUploadStep()}
            {flowStep === "processing" && renderProcessingStep()}
            {(flowStep === "result" || flowStep === "review") && renderResultStep()}
          </Animated.View>
        </ScrollView>

        {renderFooter()}
      </KeyboardAvoidingView>

      {/* Floating Upload Overlay */}
      {(isLoading && flowStep === "upload") || isUpdating ? (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={colors.brand.primary} style={{ transform: [{ scale: 1.5 }] }} />
            <Text style={styles.overlayTitle}>
              {isUpdating ? `Updating ${updatingField}...` : "Uploading Documents..."}
            </Text>
            <Text style={styles.overlaySubtitle}>
              {isUpdating ? "Verifying partial update" : "Encrypting your data securely"}
            </Text>
          </View>
        </View>
      ) : null}

      {/* UPI Update Prompt Modal */}
      {showUpiPrompt && (
        <TouchableOpacity 
          style={styles.fullScreenOverlay} 
          activeOpacity={1} 
          onPress={() => setShowUpiPrompt(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={[styles.overlayContent, { width: "90%" }]}
          >
            <Text style={styles.cardTitle}>Update UPI ID</Text>
            <TextInput
              style={{
                width: "100%",
                borderWidth: 1.5,
                borderColor: colors.ui.border,
                borderRadius: radius.md,
                marginTop: 16,
                backgroundColor: "#F3F4F6",
                color: "#111827",
                paddingVertical: 14,
                paddingHorizontal: 16,
                fontSize: 16,
                fontWeight: "500"
              }}
              value={newUpiText}
              onChangeText={setNewUpiText}
              placeholder="e.g. yourname@okicici"
              placeholderTextColor="#9CA3AF"
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: colors.brand.primary }]}
                onPress={() => setShowUpiPrompt(false)}
              >
                <Text style={[styles.submitBtnText, { color: colors.brand.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1, backgroundColor: colors.brand.primary }]}
                onPress={submitUpiUpdate}
              >
                <Text style={styles.submitBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Vehicle Type Update Prompt Modal */}
      {showVehiclePrompt && (
        <TouchableOpacity 
          style={styles.fullScreenOverlay} 
          activeOpacity={1} 
          onPress={() => setShowVehiclePrompt(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={[styles.overlayContent, { width: "90%" }]}
          >
            <Text style={styles.cardTitle}>Update Vehicle Type</Text>
            <View style={[styles.vehicleRow, { marginTop: 16 }]}>
              {["Walk", "Bicycle", "Bike", "Auto", "Mini Truck"].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setNewVehicleText(v)}
                  style={[styles.vehicleChip, newVehicleText === v && styles.vehicleChipActive]}
                >
                  <Text style={[styles.vehicleChipText, newVehicleText === v && styles.vehicleChipTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1, backgroundColor: "transparent", borderWidth: 1, borderColor: colors.brand.primary }]}
                onPress={() => setShowVehiclePrompt(false)}
              >
                <Text style={[styles.submitBtnText, { color: colors.brand.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1, backgroundColor: colors.brand.primary }]}
                onPress={submitVehicleUpdate}
              >
                <Text style={styles.submitBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },

  // ── Header ────────────────────────────────────────
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
    width: 38, height: 38, borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: {
    color: colors.text.inverse, fontSize: 22, fontWeight: "800", letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: "500", marginTop: 2,
  },
  headerTruckWrap: {
    width: 42, height: 42, borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },

  // ── Step Indicator ────────────────────────────────
  stepContainer: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: spacing.lg, marginTop: 4,
  },
  stepItem: { flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  stepLine: {
    position: "absolute", top: 16, right: "50%", left: "-50%",
    height: 2, backgroundColor: "rgba(255,255,255,0.2)", zIndex: -1,
  },
  stepLineActive: { backgroundColor: "rgba(255,255,255,0.5)" },
  stepCircle: {
    width: 32, height: 32, borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "transparent",
  },
  stepCircleActive: { backgroundColor: colors.brand.accent, borderColor: "rgba(255,255,255,0.3)" },
  stepCircleCompleted: { backgroundColor: colors.status.success },
  stepLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.45)", marginTop: 6 },
  stepLabelActive: { color: colors.text.inverse },
  stepLabelCompleted: { color: "rgba(255,255,255,0.7)" },

  // ── Content ───────────────────────────────────────
  content: { padding: spacing.md, paddingBottom: 120 },

  // ── Card ──────────────────────────────────────────
  card: {
    backgroundColor: colors.ui.surface, borderRadius: radius.lg,
    padding: spacing.lg, ...shadows.medium,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12,
  },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center", alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  cardSubtitle: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },

  // ── Upload Zone ───────────────────────────────────
  uploadZone: {
    borderRadius: radius.md, borderWidth: 2,
    borderColor: colors.ui.border, borderStyle: "dashed",
    overflow: "hidden", backgroundColor: colors.ui.backgroundAlt,
  },
  uploadZoneDone: {
    borderColor: colors.status.success, borderStyle: "solid",
  },
  uploadPlaceholder: {
    paddingVertical: 32, alignItems: "center", gap: 10,
  },
  uploadIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center", alignItems: "center", marginBottom: 4,
  },
  uploadMainText: {
    fontSize: 16, fontWeight: "700", color: colors.text.primary,
  },
  uploadHintText: {
    fontSize: 13, color: colors.text.tertiary,
  },
  uploadPreview: {
    height: 180, position: "relative",
  },
  previewImage: {
    width: "100%", height: "100%", borderRadius: radius.md - 2,
  },
  selfiePreview: {
    width: "100%", height: "100%", borderRadius: radius.md - 2,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center", alignItems: "center",
    borderRadius: radius.md - 2,
  },
  uploadOverlayText: {
    color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 8,
  },
  uploadOverlayHint: {
    color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4,
  },

  // ── Fields ────────────────────────────────────────
  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 13, fontWeight: "600", color: colors.text.caption,
    marginBottom: 8, letterSpacing: 0.2,
  },
  required: { color: colors.status.error, fontSize: 13 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.ui.backgroundAlt,
    borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.ui.border, overflow: "hidden",
  },
  input: {
    flex: 1, fontSize: 15, color: colors.text.primary,
    paddingVertical: 12, paddingHorizontal: 12,
  },
  upiAt: {
    fontSize: 18, fontWeight: "700", color: colors.text.tertiary, paddingLeft: 14,
  },
  row: { flexDirection: "row" },

  // ── Vehicle ───────────────────────────────────────
  vehicleRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  vehicleChip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: radius.full, backgroundColor: colors.ui.backgroundAlt,
    borderWidth: 1.5, borderColor: colors.ui.border,
  },
  vehicleChipActive: {
    backgroundColor: colors.brand.primary, borderColor: colors.brand.primary,
  },
  vehicleChipText: { fontSize: 13, fontWeight: "600", color: colors.text.secondary },
  vehicleChipTextActive: { color: colors.text.inverse },

  // ── Bank Details ──────────────────────────────────
  expandToggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.ui.border,
    marginTop: 8,
  },
  expandToggleText: {
    flex: 1, fontSize: 14, fontWeight: "600", color: colors.text.secondary,
  },
  bankSection: { marginTop: 12 },

  // ── Security Note ─────────────────────────────────
  securityNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 16, paddingHorizontal: 4,
  },
  securityNoteText: {
    flex: 1, fontSize: 12, color: colors.text.tertiary, lineHeight: 17,
  },

  // ── Processing ────────────────────────────────────
  processingHeader: { alignItems: "center", paddingVertical: 8 },
  processingIconWrap: { marginBottom: 16 },
  processingTitle: {
    fontSize: 22, fontWeight: "800", color: colors.text.primary, marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14, color: colors.text.secondary, textAlign: "center",
    lineHeight: 20, paddingHorizontal: 20, marginBottom: 24,
  },
  progressBarOuter: {
    height: 8, backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 4, overflow: "hidden", marginBottom: 8,
  },
  progressBarInner: {
    height: "100%", backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13, color: colors.text.secondary, textAlign: "center",
    fontWeight: "600", marginBottom: 24,
  },

  // ── Pipeline Steps ────────────────────────────────
  pipelineList: { gap: 2 },
  pipelineItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.ui.borderLight,
  },
  pipelineStatus: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.ui.disabled,
    justifyContent: "center", alignItems: "center",
  },
  pipelineStatusDone: { backgroundColor: colors.status.success },
  pipelineStatusActive: { backgroundColor: colors.brand.primary },
  pipelineStatusFailed: { backgroundColor: colors.status.error },
  pipelineNumber: { fontSize: 12, fontWeight: "700", color: colors.text.inverse },
  pipelineContent: { flex: 1 },
  pipelineLabel: { fontSize: 14, fontWeight: "600", color: colors.text.tertiary },
  pipelineLabelDone: { color: colors.text.primary },
  pipelineLabelActive: { color: colors.brand.primary },
  pipelineError: { fontSize: 12, color: colors.status.error, marginTop: 2 },
  pipelineCheck: { fontSize: 16, color: colors.status.success, fontWeight: "700" },

  // ── Result ────────────────────────────────────────
  resultBanner: {
    borderRadius: radius.lg, padding: spacing.lg,
    alignItems: "center", ...shadows.medium,
  },
  resultBannerSuccess: { backgroundColor: colors.status.successLight },
  resultBannerError: { backgroundColor: colors.status.errorLight },
  resultIconWrap: { marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: "900", marginBottom: 8 },
  resultTitleSuccess: { color: colors.status.successDark },
  resultTitleError: { color: colors.status.errorDark },
  resultSubtitle: {
    fontSize: 14, color: colors.text.secondary,
    textAlign: "center", lineHeight: 20, marginBottom: 16,
  },
  scoreChip: {
    backgroundColor: "rgba(0,0,0,0.08)", paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: radius.full,
  },
  scoreChipText: { fontSize: 15, fontWeight: "700", color: colors.text.primary },

  // ── Score Breakdown ───────────────────────────────
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 16,
  },
  scoreRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginBottom: 14,
  },
  scoreInfo: { width: 110 },
  scoreLabel: { fontSize: 12, fontWeight: "600", color: colors.text.primary, lineHeight: 16 },
  scoreWeight: { fontSize: 10, color: colors.text.tertiary, marginTop: 1 },
  scoreBarOuter: {
    flex: 1, height: 8, backgroundColor: colors.ui.backgroundAlt,
    borderRadius: 4, overflow: "hidden",
  },
  scoreBarInner: { height: "100%", borderRadius: 4 },
  scoreValue: { width: 28, fontSize: 14, fontWeight: "800", textAlign: "right" },

  // ── Rejection ─────────────────────────────────────
  rejectionItem: { marginBottom: 16 },
  rejectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  rejectionMessage: {
    flex: 1, fontSize: 14, fontWeight: "600", color: colors.status.errorDark,
    lineHeight: 20,
  },
  suggestionBox: {
    marginTop: 8, marginLeft: 24, backgroundColor: colors.status.infoLight,
    borderRadius: radius.sm, padding: 10,
    borderWidth: 1, borderColor: colors.status.infoBorder,
  },
  suggestionLabel: { fontSize: 12, fontWeight: "700", color: colors.status.infoDark },
  suggestionText: { fontSize: 12, color: colors.status.infoDark, marginTop: 2, lineHeight: 17 },

  // ── Profile ───────────────────────────────────────
  profileField: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  profileLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: "500" },
  profileValue: { fontSize: 14, color: colors.text.primary, fontWeight: "600" },

  // ── Terms ─────────────────────────────────────────
  warningBox: {
    flexDirection: "row", gap: 10,
    backgroundColor: colors.status.errorLight, padding: 14,
    borderRadius: radius.sm, borderWidth: 1,
    borderColor: colors.status.errorBorder, marginBottom: 20,
  },
  warningText: {
    flex: 1, fontSize: 13, color: colors.status.errorDark,
    fontWeight: "600", lineHeight: 19,
  },
  checkboxRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: colors.text.secondary,
    justifyContent: "center", alignItems: "center", marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: colors.brand.primary, borderColor: colors.brand.primary,
  },
  checkboxText: {
    flex: 1, fontSize: 14, color: colors.text.primary, lineHeight: 21,
  },

  // ── Footer ────────────────────────────────────────
  footer: {
    flexDirection: "row", alignItems: "center", gap: 12,
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: colors.ui.border,
    ...shadows.medium,
  },
  submitBtn: {
    flex: 1, backgroundColor: colors.brand.primary,
    paddingVertical: 15, borderRadius: radius.md,
    alignItems: "center", flexDirection: "row",
    justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: colors.ui.disabled },
  submitBtnText: { color: colors.text.inverse, fontSize: 16, fontWeight: "700" },
  retryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 15, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.brand.primary,
  },
  retryBtnText: { fontSize: 15, fontWeight: "700", color: colors.brand.primary },

  // ── Overlay ───────────────────────────────────────
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: colors.ui.surface,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
