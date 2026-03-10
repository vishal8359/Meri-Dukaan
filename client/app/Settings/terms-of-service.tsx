import { colors, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText } from "lucide-react-native";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconHeader}>
          <FileText size={48} color={colors.brand.primary} />
        </View>

        <Text style={styles.intro}>
          By using Sangam, you agree to these terms. Please read them carefully
          before using our platform.
        </Text>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>User Conduct</Text>
          <Text style={styles.termBody}>
            Users must provide accurate information. Misuse of the platform,
            including fraudulent orders or harassment of store owners/delivery
            partners, will lead to account suspension.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Pricing & Payments</Text>
          <Text style={styles.termBody}>
            Prices are set by individual store owners. Sangam acts as a
            facilitator. Delivery fees are calculated based on distance and
            order volume.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Cancellations & Refunds</Text>
          <Text style={styles.termBody}>
            Refunds are subject to the specific store's policy. If a service
            (like a plumber or electrician) is booked, cancellation fees may
            apply if cancelled within 2 hours of the slot.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Limitation of Liability</Text>
          <Text style={styles.termBody}>
            Sangam is not responsible for the quality of goods sold by
            independent sellers, though we strive to partner only with verified
            local businesses.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  content: { padding: spacing.lg },
  iconHeader: { alignItems: "center", marginBottom: spacing.lg },
  intro: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  termBox: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand.primary,
    marginBottom: 8,
  },
  termBody: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
});
