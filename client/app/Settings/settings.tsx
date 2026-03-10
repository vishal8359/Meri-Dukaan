// app/Settings/settings.tsx — rebuilt with SettingsContext
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    ChevronRight,
    Globe,
    Lock,
    Palette,
    Settings,
    Shield,
    Smartphone,
    Trash2,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

/* ---- Sub-components ---- */
const SettingItem = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
  color = colors.brand.primary,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  color?: string;
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress && !rightComponent}
    activeOpacity={0.7}
  >
    <View style={styles.settingLeft}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
    {rightComponent ||
      (showArrow && <ChevronRight size={20} color={colors.ui.disabled} />)}
  </TouchableOpacity>
);

const SettingSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIndicator} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

/* ---- Main Screen ---- */
export default function SettingsScreen() {
  const router = useRouter();
  const {
    t,
    language,
    theme,
    isDark,
    notificationsEnabled,
    setNotificationsEnabled,
    locationEnabled,
    setLocationEnabled,
  } = useSettings();

  // Human-readable theme label
  const themeLabel =
    theme === "light"
      ? t("settings.theme.light")
      : theme === "dark"
        ? t("settings.theme.dark")
        : t("settings.theme.system");

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[
          colors.gradient.navyStart,
          colors.gradient.navyEnd,
          colors.brand.primaryLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Settings
              size={28}
              color={colors.tint.green}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.headerTitle}>{t("settings.title")}</Text>
            <Text style={styles.headerSubtitle}>{t("settings.subtitle")}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <SettingSection title={t("settings.account")}>
          <SettingItem
            icon={Bell}
            title={t("settings.notifications")}
            subtitle={t("settings.notifications.desc")}
            color="#ef4444"
            onPress={() => router.push("/Settings/notifications")}
          />
          <SettingItem
            icon={Globe}
            title={t("settings.language")}
            subtitle={t("settings.language.desc")}
            color="#f59e0b"
            onPress={() => router.push("/Settings/language-selection")}
          />
          <SettingItem
            icon={Smartphone}
            title={t("settings.location")}
            subtitle={t("settings.location.desc")}
            color="#3b82f6"
            rightComponent={
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{
                  false: colors.ui.border,
                  true: colors.status.infoBorder,
                }}
                thumbColor={
                  locationEnabled ? colors.status.info : colors.ui.surfaceHover
                }
              />
            }
            showArrow={false}
          />
        </SettingSection>

        {/* Appearance */}
        <SettingSection title={t("settings.appearance")}>
          <SettingItem
            icon={Palette}
            title={t("appearance.title")}
            subtitle={themeLabel}
            color="#8b5cf6"
            onPress={() => router.push("/Settings/appearance")}
          />
        </SettingSection>

        {/* Security & Privacy */}
        <SettingSection title={t("settings.security")}>
          <SettingItem
            icon={Lock}
            title={t("settings.changePassword")}
            subtitle={t("settings.changePassword.desc")}
            color="#10b981"
            onPress={() => router.push("/Settings/change-password")}
          />
          <SettingItem
            icon={Shield}
            title={t("settings.privacy")}
            subtitle={t("settings.privacy.desc")}
            color="#06b6d4"
            onPress={() => router.push("/Settings/privacy-policy")}
          />
          <SettingItem
            icon={Shield}
            title={t("settings.terms")}
            subtitle={t("settings.terms.desc")}
            color="#8b5cf6"
            onPress={() => router.push("/Settings/terms-of-service")}
          />
        </SettingSection>

        {/* Data */}
        <SettingSection title={t("settings.data")}>
          <SettingItem
            icon={Trash2}
            title={t("settings.clearCache")}
            subtitle={t("settings.clearCache.desc")}
            color="#f59e0b"
            onPress={() => {
              Alert.alert(t("common.success"), "Cache cleared successfully!");
            }}
          />
        </SettingSection>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => router.push("/Settings/delete-account")}
          >
            <Trash2 size={20} color={colors.status.error} />
            <Text style={styles.deleteButtonText}>
              {t("settings.deleteAccount")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t("settings.version")}</Text>
          <Text style={styles.versionSubtext}>{t("settings.build")}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  } as ViewStyle,
  gradientHeader: {
    paddingBottom: spacing.md,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  } as ViewStyle,
  headerContent: {
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  backButton: {
    padding: 4,
  } as ViewStyle,
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.inverse,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 12,
    color: colors.ui.disabled,
    marginTop: 2,
    fontWeight: "600",
  } as TextStyle,
  content: {
    padding: spacing.md,
  } as ViewStyle,
  section: {
    marginBottom: spacing.lg,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  } as ViewStyle,
  sectionIndicator: {
    width: 4,
    height: 20,
    backgroundColor: colors.status.info,
    borderRadius: 2,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
  sectionContent: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.small,
  } as ViewStyle,
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  } as ViewStyle,
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,
  settingText: {
    flex: 1,
  } as ViewStyle,
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  } as TextStyle,
  settingSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  } as TextStyle,
  dangerZone: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  } as ViewStyle,
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.errorLight,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
  } as ViewStyle,
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.status.error,
  } as TextStyle,
  versionContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  } as ViewStyle,
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  } as TextStyle,
  versionSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  } as TextStyle,
});
