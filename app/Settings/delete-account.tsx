// app/delete-account.tsx
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { AlertTriangle, ArrowLeft, Lock, Shield } from "lucide-react-native";
import React, { useRef, useState } from "react";
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

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"warning" | "pin" | "otp">("warning");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const pinRefs = useRef<(TextInput | null)[]>([]);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Auto-focus next input
      if (value && index < 3) {
        pinRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleVerifyPin = () => {
    const pinValue = pin.join("");
    if (pinValue.length !== 4) {
      Alert.alert("Error", "Please enter 4-digit PIN");
      return;
    }
    // In real app, verify PIN with backend
    setStep("otp");
    // Trigger OTP send to phone/email
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      Alert.alert("Error", "Please enter 6-digit OTP");
      return;
    }
    // In real app, verify OTP and delete account
    Alert.alert(
      "Account Deleted",
      "Your account has been permanently deleted.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ],
    );
  };

  const WarningStep = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.warningIcon}>
        <AlertTriangle size={64} color={colors.status.error} />
      </View>

      <Text style={styles.warningTitle}>Delete Account?</Text>
      <Text style={styles.warningText}>
        This action is permanent and cannot be undone. All your data will be
        deleted including:
      </Text>

      <View style={styles.itemsList}>
        <Text style={styles.listItem}>
          • Your profile and personal information
        </Text>
        <Text style={styles.listItem}>• Order history and transactions</Text>
        <Text style={styles.listItem}>• Saved addresses and preferences</Text>
        <Text style={styles.listItem}>• Wishlist and cart items</Text>
        <Text style={styles.listItem}>• Store data (if you have a store)</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setStep("pin")}
      >
        <Text style={styles.deleteButtonText}>Continue to Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const PinStep = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Lock size={48} color={colors.brand.primary} />
      </View>

      <Text style={styles.stepTitle}>Enter Your PIN</Text>
      <Text style={styles.stepSubtitle}>
        Enter your 4-digit account PIN to continue
      </Text>

      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              pinRefs.current[index] = ref;
            }}
            style={styles.pinInput}
            value={digit}
            onChangeText={(value) => handlePinChange(index, value)}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry
          />
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyPin}>
        <Text style={styles.primaryButtonText}>Verify PIN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Forgot PIN?</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const OtpStep = () => {
    const [resendTimer, setResendTimer] = useState(30);

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Shield size={48} color={colors.brand.primary} />
        </View>

        <Text style={styles.stepTitle}>Verify OTP</Text>
        <Text style={styles.stepSubtitle}>
          Enter the 6-digit code sent to your registered mobile/email
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                otpRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleVerifyOtp}
        >
          <Text style={styles.primaryButtonText}>Verify & Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            Resend OTP {resendTimer > 0 ? `(${resendTimer}s)` : ""}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

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
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View
          style={[styles.stepDot, step === "warning" && styles.activeStepDot]}
        />
        <View style={styles.stepLine} />
        <View
          style={[styles.stepDot, step === "pin" && styles.activeStepDot]}
        />
        <View style={styles.stepLine} />
        <View
          style={[styles.stepDot, step === "otp" && styles.activeStepDot]}
        />
      </View>

      {/* Content */}
      {step === "warning" && <WarningStep />}
      {step === "pin" && <PinStep />}
      {step === "otp" && <OtpStep />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.ui.surface,
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
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    backgroundColor: colors.ui.surface,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.ui.border,
  },
  activeStepDot: {
    backgroundColor: colors.brand.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.ui.border,
    marginHorizontal: 4,
  },
  content: {
    padding: spacing.xl,
    alignItems: "center",
  },
  warningIcon: {
    marginBottom: spacing.xl,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.status.error,
    marginBottom: spacing.md,
  },
  warningText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  itemsList: {
    alignSelf: "stretch",
    backgroundColor: colors.status.errorLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  listItem: {
    fontSize: 14,
    color: colors.status.errorDark,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: colors.status.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  pinContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pinInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: colors.ui.surface,
  },
  otpContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: colors.ui.surface,
  },
  primaryButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.primary,
  },
});
