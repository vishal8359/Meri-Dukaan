// app/auth/mobile.tsx
import { useAuth } from "@/src/context/AuthContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronDown, Phone, ShoppingBag } from "lucide-react-native";
import { MotiText, MotiView } from "moti";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { height } = Dimensions.get("window");

const COUNTRY_CODES = [
  { code: "+91", name: "India", flag: "🇮🇳", digits: 10 },
  { code: "+1", name: "USA / Canada", flag: "🇺🇸", digits: 10 },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", digits: 10 },
  { code: "+971", name: "UAE", flag: "🇦🇪", digits: 9 },
  { code: "+61", name: "Australia", flag: "🇦🇺", digits: 9 },
  { code: "+49", name: "Germany", flag: "🇩🇪", digits: 10 },
  { code: "+33", name: "France", flag: "🇫🇷", digits: 9 },
  { code: "+81", name: "Japan", flag: "🇯🇵", digits: 10 },
  { code: "+86", name: "China", flag: "🇨🇳", digits: 11 },
  { code: "+65", name: "Singapore", flag: "🇸🇬", digits: 8 },
  { code: "+60", name: "Malaysia", flag: "🇲🇾", digits: 10 },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", digits: 9 },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩", digits: 10 },
  { code: "+92", name: "Pakistan", flag: "🇵🇰", digits: 10 },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰", digits: 9 },
  { code: "+977", name: "Nepal", flag: "🇳🇵", digits: 10 },
];

export default function MobileScreen() {
  const router = useRouter();
  const {
    setPendingPhone,
    setPendingCountryCode,
    requestPhoneOtp,
    startResendCooldown,
    resetOtpState,
  } = useAuth();

  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValidPhone =
    phone.replace(/\s/g, "").length === selectedCountry.digits;

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length !== selectedCountry.digits) {
      setError(`Please enter a valid ${selectedCountry.digits}-digit number.`);
      return;
    }

    setError("");
    setIsSending(true);

    try {
      resetOtpState();
      setPendingPhone(cleaned);
      setPendingCountryCode(selectedCountry.code);
      const response = await requestPhoneOtp(cleaned);
      startResendCooldown();

      if (response.otp) {
        console.log(`[DEV] OTP for ${selectedCountry.code}${cleaned}: ${response.otp}`);
      }

      router.push("/auth/otp" as any);
    } catch (err: any) {
      setError(err?.message || "Unable to send OTP. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    // Only allow digits and spaces
    const cleaned = text.replace(/[^\d\s]/g, "");
    setPhone(cleaned);
    if (error) setError("");
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
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.logoRow}
        >
          <View style={styles.iconCircle}>
            <ShoppingBag size={32} color={colors.brand.secondary} />
          </View>
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 800, delay: 200 }}
            style={styles.appName}
          >
            Sangam
          </MotiText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
        >
          <Text style={styles.tagline}>Your local market, digitized.</Text>
        </MotiView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.body}
      >
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 200 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Welcome! 👋</Text>
          <Text style={styles.cardSubtitle}>
            Enter your mobile number to get started
          </Text>

          {/* Phone input row */}
          <View style={styles.inputLabel}>
            <Phone size={14} color={colors.text.secondary} />
            <Text style={styles.inputLabelText}>Mobile Number</Text>
          </View>

          <View style={[styles.phoneRow, error ? styles.phoneRowError : null]}>
            {/* Country Code Picker */}
            <TouchableOpacity
              style={styles.countryCodeBtn}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <ChevronDown size={14} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Phone Number Input */}
            <TextInput
              ref={inputRef}
              style={styles.phoneInput}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholder={`${"0".repeat(selectedCountry.digits)}`}
              placeholderTextColor={colors.ui.muted}
              maxLength={selectedCountry.digits + 2}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
          </View>

          {error ? (
            <MotiView
              from={{ opacity: 0, translateX: -4 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <Text style={styles.errorText}>{error}</Text>
            </MotiView>
          ) : null}

          <Text style={styles.hintText}>
            We'll send a one-time password to verify your number.
          </Text>

          {/* CTA Button */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              (!isValidPhone || isSending) && styles.ctaBtnDisabled,
            ]}
            onPress={handleSendOtp}
            activeOpacity={0.85}
            disabled={!isValidPhone || isSending}
          >
            <LinearGradient
              colors={
                isValidPhone && !isSending
                  ? [colors.brand.secondary, colors.brand.accent]
                  : [colors.ui.disabled, colors.ui.disabled]
              }
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>{isSending ? "Sending..." : "Send OTP"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> &{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </MotiView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code + item.name}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    item.code === selectedCountry.code &&
                      item.name === selectedCountry.name &&
                      styles.countryItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountry(item);
                    setPhone("");
                    setShowPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.name}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text.inverse,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
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
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xs,
  },
  inputLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  phoneRowError: {
    borderColor: colors.status.error,
  },
  countryCodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  flag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.ui.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: colors.text.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 13,
    color: colors.status.error,
    marginBottom: spacing.xs,
  },
  hintText: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
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
  termsText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: colors.brand.primary,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.ui.overlay,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: height * 0.65,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ui.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.heading,
    marginBottom: spacing.md,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  countryItemSelected: {
    backgroundColor: colors.tint.blueLight,
  },
  countryItemFlag: {
    fontSize: 22,
  },
  countryItemName: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  countryItemCode: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "600",
  },
});
