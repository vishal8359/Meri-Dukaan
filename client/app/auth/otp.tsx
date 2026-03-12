// app/auth/otp.tsx
import { useApp } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Lock,
    MessageSquare,
    RefreshCw,
} from "lucide-react-native";
import { MotiText, MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { login: appLogin, updateProfile } = useApp();
  const {
    pendingPhone,
    pendingCountryCode,
    mockOtp,
    otpAttempts,
    isOtpLocked,
    lockoutSecondsLeft,
    resendSecondsLeft,
    resetOtpState,
    incrementOtpAttempt,
    startResendCooldown,
    requestPhoneOtp,
    verifyPhoneOtp,
    completeAuth,
  } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const maskedPhone = `${pendingCountryCode} ${"*".repeat(
    Math.max(0, pendingPhone.length - 4),
  )}${pendingPhone.slice(-4)}`;

  const otpValue = otp.join("");
  const isComplete = otpValue.length === OTP_LENGTH;
  const attemptsLeft = 5 - otpAttempts;

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!isComplete || isOtpLocked) return;

    try {
      setIsVerifying(true);
      const result = await verifyPhoneOtp(pendingPhone, otpValue);
      setError("");

      if (result.isNewUser) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/personal-details" as any);
        }, 800);
        return;
      }

      if (!result.user || !result.token) {
        throw new Error("Invalid verification response from server");
      }

      const authUser = {
        id: result.user.id,
        phone: result.user.phone,
        countryCode: pendingCountryCode,
        name: result.user.name || "User",
        address: result.user.location || "",
        email: result.user.email || undefined,
        imageUri: result.user.profile_image || undefined,
      };

      await completeAuth(authUser, result.token);
      appLogin(authUser.name);
      updateProfile({
        phone: `${pendingCountryCode} ${pendingPhone}`,
        email: authUser.email,
        address: authUser.address,
      });

      setSuccess(true);
      setTimeout(() => {
        router.replace("/(drawer)/(tabs)/" as any);
      }, 800);
    } catch {
      incrementOtpAttempt();
      triggerShake();
      const newAttemptsLeft = attemptsLeft - 1;
      if (newAttemptsLeft <= 0) {
        setError(
          `Too many attempts. Try again in ${lockoutSecondsLeft || 30}s.`,
        );
      } else {
        setError(
          `Incorrect OTP. ${newAttemptsLeft} attempt${newAttemptsLeft === 1 ? "" : "s"} remaining.`,
        );
      }
      // Clear OTP boxes
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  }, [
    isComplete,
    isOtpLocked,
    otpValue,
    verifyPhoneOtp,
    pendingPhone,
    pendingCountryCode,
    completeAuth,
    appLogin,
    updateProfile,
    incrementOtpAttempt,
    triggerShake,
    attemptsLeft,
    lockoutSecondsLeft,
    router,
  ]);

  const handleResend = useCallback(async () => {
    if (resendSecondsLeft > 0) return;

    try {
      setIsResending(true);
      const response = await requestPhoneOtp(pendingPhone);
      startResendCooldown();
      resetOtpState();
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      if (response.otp) {
        console.log(`[DEV] New OTP: ${response.otp}`);
      }
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || "Unable to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [
    resendSecondsLeft,
    requestPhoneOtp,
    pendingPhone,
    startResendCooldown,
    resetOtpState,
  ]);

  // Auto-verify when all digits entered
  useEffect(() => {
    if (isComplete && !isOtpLocked && !success && !isVerifying) {
      handleVerify();
    }
  }, [isComplete, isOtpLocked, success, isVerifying, handleVerify]);

  // Update error when lockout changes
  useEffect(() => {
    if (isOtpLocked && lockoutSecondsLeft > 0) {
      setError(`Too many attempts. Try again in ${lockoutSecondsLeft}s.`);
    } else if (!isOtpLocked && lockoutSecondsLeft === 0 && otpAttempts === 0) {
      setError("");
    }
  }, [isOtpLocked, lockoutSecondsLeft, otpAttempts]);

  const handleOtpChange = (text: string, index: number) => {
    if (isOtpLocked || success) return;

    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.brand.primary}
      />

      {/* Header */}
      <LinearGradient
        colors={[colors.brand.primary, colors.brand.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={colors.text.inverse} />
        </TouchableOpacity>

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.iconWrap}
        >
          <MessageSquare size={36} color={colors.brand.secondary} />
        </MotiView>

        <MotiText
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 150 }}
          style={styles.headerTitle}
        >
          Verify OTP
        </MotiText>
        <Text style={styles.headerSubtitle}>Sent to {maskedPhone}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.body}
      >
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 150 }}
          style={styles.card}
        >
          {/* OTP Boxes */}
          <MotiView
            animate={
              shake ? { translateX: [-8, 8, -8, 8, 0] } : { translateX: 0 }
            }
            transition={{ type: "timing", duration: 400 }}
            style={styles.otpRow}
          >
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  success ? styles.otpBoxSuccess : null,
                  isOtpLocked ? styles.otpBoxLocked : null,
                  error && !isOtpLocked ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                editable={!isOtpLocked && !success}
                autoFocus={i === 0}
              />
            ))}
          </MotiView>

          {/* Status messages */}
          {success ? (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              style={styles.successRow}
            >
              <CheckCircle size={18} color={colors.status.success} />
              <Text style={styles.successText}>Verified!</Text>
            </MotiView>
          ) : isOtpLocked ? (
            <View style={styles.lockedRow}>
              <Lock size={16} color={colors.status.error} />
              <Text style={styles.lockedText}>
                Too many attempts — wait{" "}
                <Text style={styles.lockedTimer}>{lockoutSecondsLeft}s</Text>
              </Text>
            </View>
          ) : error ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 200 }}
              style={styles.errorRow}
            >
              <Text style={styles.errorText}>{error}</Text>
              {attemptsLeft > 0 && attemptsLeft <= 3 && (
                <View style={styles.attemptsBar}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.attemptDot,
                        i < attemptsLeft
                          ? styles.attemptDotActive
                          : styles.attemptDotUsed,
                      ]}
                    />
                  ))}
                </View>
              )}
            </MotiView>
          ) : (
            <Text style={styles.hintText}>
              Enter the 6-digit code sent to your number.
            </Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              (!isComplete || isOtpLocked || success) && styles.ctaBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={!isComplete || isOtpLocked || success}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isComplete && !isOtpLocked && !success
                  ? [colors.brand.secondary, colors.brand.accent]
                  : [colors.ui.disabled, colors.ui.disabled]
              }
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>
                {success ? "✓ Verified" : "Verify OTP"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Row */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive OTP? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendSecondsLeft > 0 || isResending}
              activeOpacity={0.7}
            >
              {resendSecondsLeft > 0 || isResending ? (
                <View style={styles.resendCooldown}>
                  <Clock size={13} color={colors.text.tertiary} />
                  <Text style={styles.resendCooldownText}>
                    {isResending ? "..." : `${resendSecondsLeft}s`}
                  </Text>
                </View>
              ) : (
                <View style={styles.resendActive}>
                  <RefreshCw size={13} color={colors.brand.primary} />
                  <Text style={styles.resendActiveText}>Resend</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Dev hint */}
          <View style={styles.devHint}>
            <Text style={styles.devHintText}>
              🛠 Dev: OTP is {mockOtp} (check console)
            </Text>
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text.inverse,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
    backgroundColor: colors.ui.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -radius.xl,
  },
  card: {
    backgroundColor: colors.ui.surface,
    margin: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.medium,
    marginTop: spacing.xl,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    backgroundColor: colors.ui.backgroundAlt,
  },
  otpBoxFilled: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.tint.blueLight,
  },
  otpBoxSuccess: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.successLight,
    color: colors.status.successDark,
  },
  otpBoxError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.errorLight,
  },
  otpBoxLocked: {
    borderColor: colors.ui.disabled,
    backgroundColor: colors.ui.backgroundAlt,
    opacity: 0.5,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.status.successDark,
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
    backgroundColor: colors.status.errorLight,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  lockedText: {
    fontSize: 14,
    color: colors.status.error,
    fontWeight: "500",
  },
  lockedTimer: {
    fontWeight: "700",
  },
  errorRow: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    color: colors.status.error,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  attemptsBar: {
    flexDirection: "row",
    gap: 6,
  },
  attemptDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  attemptDotActive: {
    backgroundColor: colors.status.success,
  },
  attemptDotUsed: {
    backgroundColor: colors.status.error,
  },
  hintText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  ctaBtn: {
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  resendLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  resendCooldown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resendCooldownText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: "600",
  },
  resendActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resendActiveText: {
    fontSize: 14,
    color: colors.brand.primary,
    fontWeight: "700",
  },
  devHint: {
    backgroundColor: colors.tint.goldLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  devHintText: {
    fontSize: 12,
    color: colors.text.caption,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
