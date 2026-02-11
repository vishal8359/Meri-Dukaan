import { colors, radius, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const PolicySection = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ShieldCheck size={48} color={colors.brand.primary} />
          <Text style={styles.lastUpdated}>Last Updated: January 20, 2024</Text>
        </View>

        <PolicySection
          title="1. Information We Collect"
          content="We collect information you provide directly to us, such as when you create an account, update your profile, or use our delivery services. This includes your name, email address, phone number, and delivery addresses."
        />

        <PolicySection
          title="2. How We Use Data"
          content="Your data helps us provide and improve Sangam services. We use your location to find nearby stores (Dukaans), process your transactions, and send you relevant updates about your orders."
        />

        <PolicySection
          title="3. Data Sharing"
          content="We share necessary information with vendors (Store owners) only to fulfill your orders. We do not sell your personal data to third parties for marketing purposes."
        />

        <PolicySection
          title="4. Security"
          content="We implement robust security measures including encryption and secure socket layers (SSL) to protect your sensitive information during transmission."
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Questions about our policy?</Text>
          <TouchableOpacity>
            <Text style={styles.contactLink}>support@sangam.in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  content: { padding: spacing.lg },
  hero: { alignItems: "center", marginBottom: spacing.xl },
  lastUpdated: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionText: { fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: "#f8f9fa",
    borderRadius: radius.lg,
    alignItems: "center",
  },
  footerText: { color: colors.text.secondary, fontSize: 14 },
  contactLink: { color: colors.brand.primary, fontWeight: "700", marginTop: 4 },
});
