// app/Settings/change-password.tsx
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Check,
    Eye,
    EyeOff,
    Lock,
    ShieldCheck,
    X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useSettings();

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

  // --- Password Strength ---
  const passwordStrength = useMemo(() => {
    const p = formData.newPassword;
    if (!p) return { score: 0, label: "", color: colors.ui.border };

    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    const levels = [
      { label: t("password.weak"), color: colors.status.error },
      { label: t("password.fair"), color: colors.status.warning },
      { label: t("password.good"), color: colors.tint.blue },
      { label: t("password.strong"), color: colors.status.success },
    ];

    const idx = Math.max(0, Math.min(score - 1, 3));
    return {
      score,
      label: levels[idx]?.label || "",
      color: levels[idx]?.color || colors.ui.border,
    };
  }, [formData.newPassword, t]);

  // --- Requirements check ---
  const requirements = useMemo(() => {
    const p = formData.newPassword;
    return [
      { key: "len", label: t("password.req1"), met: p.length >= 8 },
      { key: "upper", label: t("password.req2"), met: /[A-Z]/.test(p) },
      { key: "num", label: t("password.req3"), met: /[0-9]/.test(p) },
      {
        key: "special",
        label: t("password.req4"),
        met: /[^A-Za-z0-9]/.test(p),
      },
    ];
  }, [formData.newPassword, t]);

  const handleChangePassword = () => {
    if (!formData.currentPassword) {
      Alert.alert(t("common.error"), "Please enter your current password");
      return;
    }
    if (formData.newPassword.length < 8) {
      Alert.alert(t("common.error"), "Password must be at least 8 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert(t("common.error"), "Passwords do not match");
      return;
    }
    if (passwordStrength.score < 2) {
      Alert.alert(
        t("common.error"),
        "Password is too weak. Please make it stronger.",
      );
      return;
    }

    Alert.alert(t("common.success"), t("password.success"), [
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
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={!showPasswords[field]}
          autoCapitalize="none"
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
      <LinearGradient
        colors={[colors.gradient.navyStart, colors.gradient.navyEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ShieldCheck
              size={24}
              color={colors.tint.green}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.headerTitle}>{t("password.title")}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Lock size={16} color={colors.status.info} />
          <Text style={styles.infoText}>
            Choose a strong password with at least 8 characters, including
            uppercase letters, numbers and special characters.
          </Text>
        </View>

        {/* Current Password */}
        <PasswordInput
          label={t("password.current")}
          value={formData.currentPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, currentPassword: text })
          }
          placeholder="Enter current password"
          field="current"
        />

        {/* New Password */}
        <PasswordInput
          label={t("password.new")}
          value={formData.newPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, newPassword: text })
          }
          placeholder="Enter new password"
          field="new"
        />

        {/* Password Strength Meter */}
        {formData.newPassword.length > 0 && (
          <View style={styles.strengthSection}>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthLabel}>{t("password.strength")}</Text>
              <Text
                style={[
                  styles.strengthValue,
                  { color: passwordStrength.color },
                ]}
              >
                {passwordStrength.label}
              </Text>
            </View>
            <View style={styles.strengthBarBg}>
              {[1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthBarSegment,
                    {
                      backgroundColor:
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : colors.ui.borderLight,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Confirm Password */}
        <PasswordInput
          label={t("password.confirm")}
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
          placeholder="Re-enter new password"
          field="confirm"
        />

        {/* Match indicator */}
        {formData.confirmPassword.length > 0 && (
          <View style={styles.matchRow}>
            {formData.newPassword === formData.confirmPassword ? (
              <>
                <Check size={16} color={colors.status.success} />
                <Text
                  style={[styles.matchText, { color: colors.status.success }]}
                >
                  Passwords match
                </Text>
              </>
            ) : (
              <>
                <X size={16} color={colors.status.error} />
                <Text
                  style={[styles.matchText, { color: colors.status.error }]}
                >
                  Passwords do not match
                </Text>
              </>
            )}
          </View>
        )}

        {/* Requirements checklist */}
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>
            {t("password.requirements")}
          </Text>
          {requirements.map((req) => (
            <View key={req.key} style={styles.reqRow}>
              <View
                style={[
                  styles.reqDot,
                  {
                    backgroundColor: req.met
                      ? colors.status.success
                      : colors.ui.disabled,
                  },
                ]}
              >
                {req.met && <Check size={10} color="#FFF" />}
              </View>
              <Text
                style={[
                  styles.reqText,
                  req.met && { color: colors.status.success },
                ]}
              >
                {req.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[
            styles.changeButton,
            passwordStrength.score < 2 && styles.changeButtonDisabled,
          ]}
          onPress={handleChangePassword}
          activeOpacity={0.8}
        >
          <Lock size={18} color="#FFF" />
          <Text style={styles.changeButtonText}>{t("password.change")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotButtonText}>{t("password.forgot")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  } as ViewStyle,
  headerGradient: {
    paddingBottom: spacing.md,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  } as ViewStyle,
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  headerCenter: {
    flex: 1,
    alignItems: "center",
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  } as TextStyle,
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  } as ViewStyle,
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.status.infoLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    alignItems: "flex-start",
  } as ViewStyle,
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.status.infoDark,
    lineHeight: 18,
    fontWeight: "500",
  } as TextStyle,
  inputGroup: {
    marginBottom: spacing.md,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  } as TextStyle,
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  } as ViewStyle,
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  } as TextStyle,

  // Strength meter
  strengthSection: {
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  } as ViewStyle,
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  } as ViewStyle,
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  } as TextStyle,
  strengthValue: {
    fontSize: 12,
    fontWeight: "800",
  } as TextStyle,
  strengthBarBg: {
    flexDirection: "row",
    gap: 4,
    height: 6,
  } as ViewStyle,
  strengthBarSegment: {
    flex: 1,
    borderRadius: 3,
  } as ViewStyle,

  // Match
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
  } as ViewStyle,
  matchText: {
    fontSize: 12,
    fontWeight: "600",
  } as TextStyle,

  // Requirements
  requirementsBox: {
    backgroundColor: colors.ui.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  } as ViewStyle,
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.md,
  } as TextStyle,
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  } as ViewStyle,
  reqDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  reqText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: "500",
  } as TextStyle,

  // Buttons
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    ...shadows.medium,
  } as ViewStyle,
  changeButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  changeButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  } as TextStyle,
  forgotButton: {
    alignItems: "center",
    marginTop: spacing.lg,
  } as ViewStyle,
  forgotButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  } as TextStyle,
});
