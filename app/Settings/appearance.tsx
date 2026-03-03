// app/Settings/appearance.tsx
import { useSettings, type AppTheme } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Check,
    Monitor,
    Moon,
    Palette,
    Sun,
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface ThemeOption {
  key: AppTheme;
  label: string;
  labelHi: string;
  icon: any;
  color: string;
  bg: string;
  desc: string;
  descHi: string;
}

const THEMES: ThemeOption[] = [
  {
    key: "light",
    label: "Light",
    labelHi: "लाइट",
    icon: Sun,
    color: colors.tint.gold,
    bg: colors.tint.goldLight,
    desc: "Bright, clean interface ideal for daytime use",
    descHi: "दिन के उपयोग के लिए उज्ज्वल, स्वच्छ इंटरफ़ेस",
  },
  {
    key: "dark",
    label: "Dark",
    labelHi: "डार्क",
    icon: Moon,
    color: colors.tint.purple,
    bg: colors.tint.purpleLight,
    desc: "Easy on the eyes, perfect for night browsing",
    descHi: "आँखों पर आसान, रात की ब्राउज़िंग के लिए सही",
  },
  {
    key: "system",
    label: "System",
    labelHi: "सिस्टम",
    icon: Monitor,
    color: colors.tint.blue,
    bg: colors.tint.blueLight,
    desc: "Automatically follows your device theme settings",
    descHi: "स्वचालित रूप से आपके डिवाइस थीम का पालन करता है",
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, setTheme, isDark, t, language } = useSettings();

  const isHi = language === "hi";

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
            <Palette
              size={24}
              color={colors.tint.purple}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.headerTitle}>{t("appearance.title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("appearance.subtitle")}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Mode Section */}
        <Text style={styles.sectionLabel}>{t("appearance.themeMode")}</Text>

        {THEMES.map((opt, index) => {
          const isSelected = theme === opt.key;
          const Icon = opt.icon;
          return (
            <MotiView
              key={opt.key}
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 + index * 80 }}
            >
              <TouchableOpacity
                style={[
                  styles.themeCard,
                  isSelected && {
                    borderColor: opt.color,
                    backgroundColor: opt.bg,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setTheme(opt.key)}
              >
                <View style={styles.themeLeft}>
                  <View
                    style={[
                      styles.themeIconBg,
                      {
                        backgroundColor: isSelected
                          ? opt.color + "20"
                          : colors.ui.background,
                      },
                    ]}
                  >
                    <Icon
                      size={22}
                      color={isSelected ? opt.color : colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text
                      style={[
                        styles.themeName,
                        isSelected && { color: opt.color },
                      ]}
                    >
                      {isHi ? opt.labelHi : opt.label}
                    </Text>
                    <Text style={styles.themeDesc}>
                      {isHi ? opt.descHi : opt.desc}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View
                    style={[styles.checkCircle, { backgroundColor: opt.color }]}
                  >
                    <Check size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        })}

        {/* Preview Section */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
          {t("appearance.preview")}
        </Text>
        <View style={styles.previewContainer}>
          {/* Light Preview */}
          <View style={styles.previewCard}>
            <View
              style={[styles.previewScreen, { backgroundColor: "#F5F7FA" }]}
            >
              <View style={[styles.previewBar, { backgroundColor: "#203659" }]}>
                <View style={styles.previewDotRow}>
                  <View
                    style={[styles.previewDot, { backgroundColor: "#FFF" }]}
                  />
                  <View
                    style={[
                      styles.previewLine,
                      { backgroundColor: "rgba(255,255,255,0.4)" },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.previewBody}>
                <View
                  style={[styles.previewBlock, { backgroundColor: "#FFF" }]}
                />
                <View
                  style={[styles.previewBlock, { backgroundColor: "#FFF" }]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.previewLabel,
                theme === "light" && {
                  color: colors.brand.primary,
                  fontWeight: "800",
                },
              ]}
            >
              {isHi ? "लाइट" : "Light"}
            </Text>
            {theme === "light" && <View style={styles.previewIndicator} />}
          </View>

          {/* Dark Preview */}
          <View style={styles.previewCard}>
            <View
              style={[styles.previewScreen, { backgroundColor: "#1a1a2e" }]}
            >
              <View style={[styles.previewBar, { backgroundColor: "#16213e" }]}>
                <View style={styles.previewDotRow}>
                  <View
                    style={[
                      styles.previewDot,
                      { backgroundColor: "rgba(255,255,255,0.5)" },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewLine,
                      { backgroundColor: "rgba(255,255,255,0.2)" },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.previewBody}>
                <View
                  style={[styles.previewBlock, { backgroundColor: "#16213e" }]}
                />
                <View
                  style={[styles.previewBlock, { backgroundColor: "#16213e" }]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.previewLabel,
                theme === "dark" && {
                  color: colors.tint.purple,
                  fontWeight: "800",
                },
              ]}
            >
              {isHi ? "डार्क" : "Dark"}
            </Text>
            {theme === "dark" && (
              <View
                style={[
                  styles.previewIndicator,
                  { backgroundColor: colors.tint.purple },
                ]}
              />
            )}
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            {isHi
              ? "नोट: डार्क मोड वर्तमान में बीटा स्टेज में है। कुछ स्क्रीन पूरी तरह अनुकूलित नहीं हो सकती।"
              : "Note: Dark mode is currently in beta. Some screens may not be fully optimized yet."}
          </Text>
        </View>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  } as TextStyle,

  // Theme Card
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.ui.borderLight,
    ...shadows.small,
  } as ViewStyle,
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  themeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,
  themeInfo: {
    flex: 1,
  } as ViewStyle,
  themeName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 3,
  } as TextStyle,
  themeDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
    lineHeight: 17,
  } as TextStyle,
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  // Preview
  previewContainer: {
    flexDirection: "row",
    gap: spacing.md,
  } as ViewStyle,
  previewCard: {
    flex: 1,
    alignItems: "center",
  } as ViewStyle,
  previewScreen: {
    width: "100%",
    aspectRatio: 0.65,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.ui.border,
    ...shadows.small,
  } as ViewStyle,
  previewBar: {
    height: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
  } as ViewStyle,
  previewDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  } as ViewStyle,
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,
  previewLine: {
    height: 6,
    width: 40,
    borderRadius: 3,
  } as ViewStyle,
  previewBody: {
    flex: 1,
    padding: 8,
    gap: 6,
  } as ViewStyle,
  previewBlock: {
    height: 24,
    borderRadius: 6,
  } as ViewStyle,
  previewLabel: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  } as TextStyle,
  previewIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.primary,
    marginTop: 4,
  } as ViewStyle,

  // Note
  noteBox: {
    marginTop: spacing.xl,
    backgroundColor: colors.tint.purpleLight,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.tint.purple + "20",
  } as ViewStyle,
  noteText: {
    fontSize: 13,
    color: colors.tint.purple,
    fontWeight: "500",
    lineHeight: 19,
  } as TextStyle,
});
