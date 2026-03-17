// app/meri_dukaan/reels/upload-reel.tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Film, Upload, Video, X } from "lucide-react-native";
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
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const alreadyUploaded = !canUploadReelToday();

  const pickVideo = async () => {
    if (alreadyUploaded) {
      return Alert.alert(
        "Daily Limit",
        "You can upload only 1 reel per day. Come back tomorrow!",
      );
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Permission Required",
        "Please allow access to your media library to upload videos.",
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      videoMaxDuration: 60,
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? asset.uri.split("/").pop() ?? "video";
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const allowedExts = ["mp4", "mov", "m4v", "avi"];

    if (ext && !allowedExts.includes(ext)) {
      return Alert.alert(
        "Invalid Format",
        "Please select a video file (MP4, MOV, M4V).",
      );
    }

    setVideoUri(asset.uri);
    setVideoName(fileName);
  };

  const clearVideo = () => {
    setVideoUri(null);
    setVideoName(null);
  };

  const handleUpload = async () => {
    if (alreadyUploaded) {
      return Alert.alert(
        "Daily Limit",
        "You can upload only 1 reel per day. Come back tomorrow!",
      );
    }
    if (!videoUri) return Alert.alert("Error", "Please select a video file");

    try {
      setIsUploading(true);
      await addMyReel({
        id: `reel_${Date.now()}`,
        videoUrl: videoUri,
        caption: caption.trim(),
        createdAt: Date.now(),
        likes: 0,
        comments: 0,
        views: 0,
      });

      Alert.alert("Success", "Reel uploaded!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Upload Failed",
        err?.message || "Unable to upload reel right now.",
      );
    } finally {
      setIsUploading(false);
    }
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

        {/* Video Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Video File *</Text>
          {videoUri ? (
            <View style={styles.selectedFile}>
              <View style={styles.selectedFileInfo}>
                <Video size={20} color={colors.brand.primary} />
                <Text style={styles.selectedFileName} numberOfLines={1}>
                  {videoName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.clearFileBtn}
                onPress={clearVideo}
                disabled={alreadyUploaded}
              >
                <X size={16} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={pickVideo}
              disabled={alreadyUploaded}
              activeOpacity={0.7}
            >
              <Video size={24} color={colors.brand.primary} />
              <Text style={styles.pickBtnText}>Choose MP4 Video</Text>
              <Text style={styles.pickBtnHint}>Tap to browse your gallery</Text>
            </TouchableOpacity>
          )}
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
            (alreadyUploaded || isUploading) && styles.uploadBtnDisabled,
          ]}
          onPress={() => void handleUpload()}
          disabled={alreadyUploaded || isUploading}
        >
          <Upload size={18} color={colors.text.inverse} />
          <Text style={styles.uploadBtnText}>
            {isUploading ? "Uploading..." : "Upload Reel"}
          </Text>
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

  /* Video Picker */
  pickBtn: {
    backgroundColor: colors.ui.surface,
    borderWidth: 1.5,
    borderColor: colors.brand.primary + "40",
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pickBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.primary,
    marginTop: 4,
  },
  pickBtnHint: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.brand.primary + "0A",
    borderWidth: 1,
    borderColor: colors.brand.primary + "30",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  selectedFileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  clearFileBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.status.error + "15",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
});
