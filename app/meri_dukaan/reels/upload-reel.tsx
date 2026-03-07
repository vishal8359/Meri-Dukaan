// app/meri_dukaan/reels/upload-reel.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, Film, Upload } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function UploadReelScreen() {
  const router = useRouter();
  const { addMyReel, canUploadReelToday, myStore } = useApp();

  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const alreadyUploaded = !canUploadReelToday();

  const handleUpload = () => {
    if (alreadyUploaded) {
      return Alert.alert(
        "Daily Limit",
        "You can upload only 1 reel per day. Come back tomorrow!",
      );
    }
    if (!videoUrl.trim()) return Alert.alert("Error", "Enter video URL");

    addMyReel({
      id: `reel_${Date.now()}`,
      videoUrl: videoUrl.trim(),
      caption: caption.trim(),
      createdAt: Date.now(),
      likes: 0,
      comments: 0,
      views: 0,
    });

    Alert.alert("Success", "Reel uploaded!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const todayReels =
    myStore?.reels.filter((r) => {
      const d = new Date(r.createdAt);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }) ?? [];

  const uploaded = alreadyUploaded;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Reel</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Limit Banner */}
        <View
          style={[
            styles.banner,
            alreadyUploaded ? styles.bannerWarn : styles.bannerInfo,
          ]}
        >
          <Film
            size={20}
            color={alreadyUploaded ? colors.status.error : colors.brand.primary}
          />
          <Text
            style={[
              styles.bannerText,
              alreadyUploaded && { color: colors.status.error },
            ]}
          >
            {alreadyUploaded
              ? "Daily limit reached! You already uploaded a reel today."
              : "You can upload 1 reel per day (max 1 minute)"}
          </Text>
        </View>

        {/* Video URL */}
        <View style={styles.section}>
          <Text style={styles.label}>Video URL *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Paste video URL here"
            placeholderTextColor={colors.ui.muted}
            value={videoUrl}
            onChangeText={setVideoUrl}
            editable={!alreadyUploaded}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Max duration: 1 minute. Supported: MP4, MOV
          </Text>
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={[styles.textInput, styles.multiline]}
            placeholder="Write a caption for your reel..."
            placeholderTextColor={colors.ui.muted}
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!alreadyUploaded}
          />
        </View>

        {/* Today's Upload Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today's Upload</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                uploaded ? styles.statusDotUsed : styles.statusDotFree,
              ]}
            />
            <Text style={styles.statusText}>
              {todayReels.length}/1 reel uploaded today
            </Text>
          </View>
          {myStore && (
            <Text style={styles.totalReels}>
              Total Reels: {myStore.reels.length}
            </Text>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            alreadyUploaded && styles.uploadBtnDisabled,
          ]}
          onPress={handleUpload}
          disabled={alreadyUploaded}
        >
          <Upload size={18} color={colors.text.inverse} />
          <Text style={styles.uploadBtnText}>Upload Reel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ui.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    ...shadows.small,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  scroll: { padding: spacing.md },
  section: { marginBottom: spacing.lg },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: colors.text.primary,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },

  /* Banner */
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    gap: 10,
  },
  bannerInfo: {
    backgroundColor: colors.brand.primary + "0A",
    borderWidth: 1,
    borderColor: colors.brand.primary + "20",
  },
  bannerWarn: {
    backgroundColor: colors.status.error + "0A",
    borderWidth: 1,
    borderColor: colors.status.error + "30",
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },

  /* Status Card */
  statusCard: {
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginBottom: spacing.xl,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotUsed: {
    backgroundColor: colors.status.error,
  },
  statusDotFree: {
    backgroundColor: colors.status.success,
  },
  statusText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  totalReels: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  /* Upload */
  uploadBtn: {
    flexDirection: "row",
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...shadows.medium,
  },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
});
