// app/Settings/language-selection.tsx
import { useSettings, type AppLanguage } from "@/src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Globe, Languages } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface LangOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  desc: string;
}

const LANGUAGES: LangOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    desc: "International language used globally",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    desc: "भारत की राजभाषा",
  },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useSettings();

  const handleSelect = (code: AppLanguage) => {
    setLanguage(code);
    Alert.alert(t("common.success"), t("language.changed"), [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

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
            <Globe
              size={24}
              color={colors.tint.gold}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.headerTitle}>{t("language.title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("language.current")}:{" "}
              {language === "en" ? "English" : "हिन्दी"}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <View style={styles.infoBox}>
          <Languages size={18} color={colors.status.info} />
          <Text style={styles.infoText}>
            {language === "en"
              ? "Select your preferred language. The app interface will update immediately."
              : "अपनी पसंदीदा भाषा चुनें। ऐप इंटरफ़ेस तुरंत अपडेट हो जाएगा।"}
          </Text>
        </View>

        {/* Language cards */}
        {LANGUAGES.map((lang, index) => {
          const isSelected = language === lang.code;
          return (
            <MotiView
              key={lang.code}
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 + index * 80 }}
            >
              <TouchableOpacity
                style={[styles.langCard, isSelected && styles.langCardSelected]}
                activeOpacity={0.7}
                onPress={() => handleSelect(lang.code)}
              >
                <View style={styles.langLeft}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View style={styles.langInfo}>
                    <Text
                      style={[
                        styles.langName,
                        isSelected && styles.langNameSelected,
                      ]}
                    >
                      {lang.name}
                    </Text>
                    <Text style={styles.langNative}>{lang.nativeName}</Text>
                    <Text style={styles.langDesc}>{lang.desc}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={18} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        })}

        {/* Coming soon note */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>
            {language === "en"
              ? "More languages coming soon!"
              : "और भाषाएं जल्द आ रही हैं!"}
          </Text>
          <Text style={styles.comingSoonText}>
            {language === "en"
              ? "Bengali, Tamil, Telugu, Marathi, and more regional languages will be available in future updates."
              : "बंगाली, तमिल, तेलुगु, मराठी और अन्य क्षेत्रीय भाषाएं भविष्य के अपडेट में उपलब्ध होंगी।"}
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
    lineHeight: 19,
    fontWeight: "500",
  } as TextStyle,
  langCard: {
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
  langCardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + "08",
  } as ViewStyle,
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  flag: {
    fontSize: 36,
    marginRight: spacing.md,
  } as TextStyle,
  langInfo: {
    flex: 1,
  } as ViewStyle,
  langName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 2,
  } as TextStyle,
  langNameSelected: {
    color: colors.brand.primary,
  } as TextStyle,
  langNative: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  langDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  } as TextStyle,
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  comingSoon: {
    marginTop: spacing.lg,
    backgroundColor: colors.tint.goldLight,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.tint.gold + "30",
  } as ViewStyle,
  comingSoonTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.status.warningDark,
    marginBottom: spacing.xs,
  } as TextStyle,
  comingSoonText: {
    fontSize: 13,
    color: colors.status.warningDark,
    lineHeight: 19,
    fontWeight: "500",
    opacity: 0.8,
  } as TextStyle,
});
