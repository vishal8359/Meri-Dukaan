// app/Settings/notifications.tsx
import { useSettings } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    BellOff,
    MessageSquare,
    Package,
    Sparkles,
    Tag,
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import {
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

interface NotifOption {
  key: "orders" | "promotions" | "chat" | "appUpdates";
  titleKey: string;
  descKey: string;
  icon: any;
  color: string;
  bg: string;
}

const NOTIF_OPTIONS: NotifOption[] = [
  {
    key: "orders",
    titleKey: "notifications.orders",
    descKey: "notifications.orders.desc",
    icon: Package,
    color: colors.tint.blue,
    bg: colors.tint.blueLight,
  },
  {
    key: "promotions",
    titleKey: "notifications.promotions",
    descKey: "notifications.promotions.desc",
    icon: Tag,
    color: colors.tint.orange,
    bg: colors.tint.orangeLight,
  },
  {
    key: "chat",
    titleKey: "notifications.chat",
    descKey: "notifications.chat.desc",
    icon: MessageSquare,
    color: colors.tint.green,
    bg: colors.tint.greenLight,
  },
  {
    key: "appUpdates",
    titleKey: "notifications.appUpdates",
    descKey: "notifications.appUpdates.desc",
    icon: Sparkles,
    color: colors.tint.purple,
    bg: colors.tint.purpleLight,
  },
];

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const {
    t,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationPrefs,
    updateNotificationPref,
  } = useSettings();

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
            <Bell
              size={24}
              color={colors.status.error}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("notifications.subtitle")}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 50 }}
        >
          <View style={styles.masterCard}>
            <View style={styles.masterLeft}>
              <View
                style={[
                  styles.masterIconBg,
                  {
                    backgroundColor: notificationsEnabled
                      ? colors.status.errorBorder
                      : colors.ui.background,
                  },
                ]}
              >
                {notificationsEnabled ? (
                  <Bell size={22} color={colors.status.error} />
                ) : (
                  <BellOff size={22} color={colors.text.tertiary} />
                )}
              </View>
              <View style={styles.masterInfo}>
                <Text style={styles.masterTitle}>
                  {t("notifications.master")}
                </Text>
                <Text style={styles.masterDesc}>
                  {t("notifications.master.desc")}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colors.ui.border,
                true: colors.status.errorBorder,
              }}
              thumbColor={
                notificationsEnabled
                  ? colors.status.error
                  : colors.ui.surfaceHover
              }
            />
          </View>
        </MotiView>

        {/* Divider */}
        {notificationsEnabled && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {t("settings.notifications.desc")}
            </Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        {/* Individual Prefs */}
        {notificationsEnabled &&
          NOTIF_OPTIONS.map((opt, index) => {
            const Icon = opt.icon;
            const isOn = notificationPrefs[opt.key];
            return (
              <MotiView
                key={opt.key}
                from={{ opacity: 0, translateX: 15 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 120 + index * 70 }}
              >
                <View style={styles.prefCard}>
                  <View style={styles.prefLeft}>
                    <View
                      style={[
                        styles.prefIconBg,
                        {
                          backgroundColor: isOn ? opt.bg : colors.ui.background,
                        },
                      ]}
                    >
                      <Icon
                        size={20}
                        color={isOn ? opt.color : colors.text.tertiary}
                      />
                    </View>
                    <View style={styles.prefInfo}>
                      <Text
                        style={[
                          styles.prefTitle,
                          !isOn && { color: colors.text.tertiary },
                        ]}
                      >
                        {t(opt.titleKey)}
                      </Text>
                      <Text style={styles.prefDesc}>{t(opt.descKey)}</Text>
                    </View>
                  </View>
                  <Switch
                    value={isOn}
                    onValueChange={(v) => updateNotificationPref(opt.key, v)}
                    trackColor={{
                      false: colors.ui.border,
                      true: opt.color + "40",
                    }}
                    thumbColor={isOn ? opt.color : colors.ui.surfaceHover}
                  />
                </View>
              </MotiView>
            );
          })}

        {/* Disabled state */}
        {!notificationsEnabled && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.disabledState}
          >
            <BellOff size={48} color={colors.text.tertiary} />
            <Text style={styles.disabledTitle}>
              {t("notifications.master")} Off
            </Text>
            <Text style={styles.disabledDesc}>
              {notificationPrefs
                ? "Turn on notifications to manage individual preferences"
                : "सूचनाएं चालू करें ताकि अलग-अलग प्राथमिकताएं प्रबंधित कर सकें"}
            </Text>
          </MotiView>
        )}
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
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    fontWeight: "500",
  } as TextStyle,
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  } as ViewStyle,

  // Master card
  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  } as ViewStyle,
  masterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.md,
  } as ViewStyle,
  masterIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,
  masterInfo: {
    flex: 1,
  } as ViewStyle,
  masterTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 3,
  } as TextStyle,
  masterDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  } as TextStyle,

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
    gap: spacing.sm,
  } as ViewStyle,
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ui.borderLight,
  } as ViewStyle,
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,

  // Pref card
  prefCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  } as ViewStyle,
  prefLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.md,
  } as ViewStyle,
  prefIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,
  prefInfo: {
    flex: 1,
  } as ViewStyle,
  prefTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  } as TextStyle,
  prefDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  } as TextStyle,

  // Disabled state
  disabledState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  } as ViewStyle,
  disabledTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.secondary,
  } as TextStyle,
  disabledDesc: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: spacing.xl,
  } as TextStyle,
});
