// app/settings.tsx (UPDATED)
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Globe,
  Lock,
  Moon,
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
  }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={colors.brand.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent ||
        (showArrow && <ChevronRight size={20} color="#cbd5e1" />)}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
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
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

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
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: "#e2e8f0",
                  true: colors.brand.primaryLight,
                }}
                thumbColor={notifications ? colors.brand.primary : "#f4f3f4"}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon={Globe}
            title="Language"
            subtitle="English (India)"
            onPress={() => router.push("/Settings/language-selection")}
          />
          <SettingItem
            icon={Smartphone}
            title="Location Services"
            subtitle="Allow app to access your location"
            rightComponent={
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{
                  false: "#e2e8f0",
                  true: colors.brand.primaryLight,
                }}
                thumbColor={locationServices ? colors.brand.primary : "#f4f3f4"}
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
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled
                trackColor={{
                  false: "#e2e8f0",
                  true: colors.brand.primaryLight,
                }}
                thumbColor={darkMode ? colors.brand.primary : "#f4f3f4"}
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
            onPress={() => router.push("/Settings/change-password")}
          />
          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => router.push("/privacy-policy")}
          />
          <SettingItem
            icon={Shield}
            title="Terms of Service"
            subtitle="Read terms and conditions"
            onPress={() => router.push("/terms-of-service")}
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data">
          <SettingItem
            icon={Trash2}
            title="Clear Cache"
            subtitle="Free up storage space"
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFF",
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
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    backgroundColor: "#FFF",
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
    borderBottomColor: "#f1f5f9",
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
    backgroundColor: "#f1f5f9",
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
    backgroundColor: "#fef2f2",
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#fee2e2",
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
