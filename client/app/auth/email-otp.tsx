import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, spacing } from "@/src/theme/colors";

export default function EmailOtpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Email Verification Not Required</Text>
        <Text style={styles.subtitle}>
          This flow now uses backend registration directly from Personal Details.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/auth/personal-details" as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Back to Personal Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: "700",
    fontSize: 14,
  },
});
