// app/settings.tsx (UPDATED)
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    ChevronRight,
    Globe,
    Lock,
    Moon,
    Settings,
    Shield,
    Smartphone,
    Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useApp();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
    color = colors.brand.primary,
  }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent ||
        (showArrow && <ChevronRight size={20} color={colors.ui.disabled} />)}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIndicator} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings */}
        <SettingSection title="Account">
          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Manage notification preferences"
            color="#ef4444"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: colors.ui.border,
                  true: colors.status.errorBorder,
                }}
                thumbColor={
                  notifications ? colors.status.error : colors.ui.surfaceHover
                }
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon={Globe}
            title="Language"
            subtitle="English (India)"
            color="#f59e0b"
            onPress={() => router.push("/Settings/language-selection")}
          />
          <SettingItem
            icon={Smartphone}
            title="Location Services"
            subtitle="Allow app to access your location"
            color="#3b82f6"
            rightComponent={
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{
                  false: colors.ui.border,
                  true: colors.status.infoBorder,
                }}
                thumbColor={
                  locationServices ? colors.status.info : colors.ui.surfaceHover
                }
              />
            }
            showArrow={false}
          />
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="Appearance">
          <SettingItem
            icon={Moon}
            title="Dark Mode"
            subtitle="Coming soon"
            color="#8b5cf6"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled
                trackColor={{
                  false: colors.ui.border,
                  true: colors.tint.purpleLight,
                }}
                thumbColor={
                  darkMode ? colors.tint.purple : colors.ui.surfaceHover
                }
              />
            }
            showArrow={false}
          />
        </SettingSection>

        {/* Security & Privacy */}
        <SettingSection title="Security & Privacy">
          <SettingItem
            icon={Lock}
            title="Change Password"
            subtitle="Update your password"
            color="#10b981"
            onPress={() => router.push("/Settings/change-password")}
          />
          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            color="#06b6d4"
            onPress={() => router.push("/Settings/privacy-policy")}
          />
          <SettingItem
            icon={Shield}
            title="Terms of Service"
            subtitle="Read terms and conditions"
            color="#8b5cf6"
            onPress={() => router.push("/Settings/terms-of-service")}
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data">
          <SettingItem
            icon={Trash2}
            title="Clear Cache"
            subtitle="Free up storage space"
            color="#f59e0b"
            onPress={() => {
              Alert.alert("Success", "Cache cleared successfully!");
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
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Sangam v1.0.0</Text>
          <Text style={styles.versionSubtext}>Build 2024.01.20</Text>
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
  },
  gradientHeader: {
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.ui.disabled,
    marginTop: 2,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    backgroundColor: colors.status.info,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.small,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  dangerZone: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
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
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.status.error,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  versionSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
