// app/meri_dukaan/reels/dashboard.tsx
import { MyStoreReel, useApp } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    BarChart3,
    Edit3,
    Eye,
    Film,
    Heart,
    MessageCircle,
    Trash2,
    TrendingUp,
    Upload,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const REEL_CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - 12) / 2;

export default function ReelDashboardScreen() {
  const router = useRouter();
  const { myStore, removeMyReel, canUploadReelToday } = useApp();
  const [sortBy, setSortBy] = useState<"recent" | "views" | "likes">("recent");

  const reels = myStore?.reels ?? [];

  // Sort reels
  const sortedReels = [...reels].sort((a, b) => {
    if (sortBy === "views") return b.views - a.views;
    if (sortBy === "likes") return b.likes - a.likes;
    return b.createdAt - a.createdAt;
  });

  // Engagement totals
  const totalViews = reels.reduce((s, r) => s + r.views, 0);
  const totalLikes = reels.reduce((s, r) => s + r.likes, 0);
  const totalComments = reels.reduce((s, r) => s + r.comments, 0);
  const avgViews = reels.length > 0 ? Math.round(totalViews / reels.length) : 0;

  const handleRemoveReel = (id: string) => {
    Alert.alert("Delete Reel", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeMyReel(id),
      },
    ]);
  };

  const handleEditReel = (reel: MyStoreReel) => {
    Alert.alert("Edit Reel", `Edit caption for: "${reel.caption || "No caption"}"\n\nThis feature is coming soon!`);
  };

  const canUpload = canUploadReelToday();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.ui.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Ads</Text>
        <TouchableOpacity
          style={[styles.uploadHeaderBtn, !canUpload && { opacity: 0.5 }]}
          onPress={() => {
            if (canUpload) {
              router.push("/meri_dukaan/reels/upload-reel" as any);
            } else {
              Alert.alert("Daily Limit", "You can upload only 1 reel per day.");
            }
          }}
        >
          <Upload size={16} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Info Banner */}
        {myStore && (
          <View style={styles.storeBanner}>
            <View style={styles.storeBannerLeft}>
              {myStore.images.length > 0 && (
                <Image
                  source={{ uri: myStore.images[0] }}
                  style={styles.storeBannerImg}
                />
              )}
              <View>
                <Text style={styles.storeBannerName}>{myStore.name}</Text>
                <Text style={styles.storeBannerCategory}>
                  {myStore.category}
                </Text>
              </View>
            </View>
            <View style={styles.reelCountBadge}>
              <Film size={14} color={colors.brand.primary} />
              <Text style={styles.reelCountText}>{reels.length}</Text>
            </View>
          </View>
        )}

        {/* Engagement Overview */}
        <View style={styles.engagementCard}>
          <View style={styles.engagementHeader}>
            <BarChart3 size={18} color={colors.brand.primary} />
            <Text style={styles.engagementTitle}>Store Engagement</Text>
          </View>
          <View style={styles.engagementRow}>
            <View style={styles.engagementStat}>
              <Eye size={18} color={colors.brand.primary} />
              <Text style={styles.engagementNum}>
                {totalViews.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Total Views</Text>
            </View>
            <View style={styles.engagementDivider} />
            <View style={styles.engagementStat}>
              <Heart size={18} color={colors.status.error} />
              <Text style={styles.engagementNum}>
                {totalLikes.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Total Likes</Text>
            </View>
            <View style={styles.engagementDivider} />
            <View style={styles.engagementStat}>
              <MessageCircle size={18} color={colors.status.info} />
              <Text style={styles.engagementNum}>
                {totalComments.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Comments</Text>
            </View>
          </View>

          {/* Avg stat */}
          <View style={styles.avgRow}>
            <TrendingUp size={14} color={colors.tint.green} />
            <Text style={styles.avgText}>
              Avg. {avgViews.toLocaleString()} views per reel
            </Text>
          </View>
        </View>

        {/* Upload Section */}
        <TouchableOpacity
          style={[styles.uploadCard, !canUpload && styles.uploadCardDisabled]}
          onPress={() => {
            if (canUpload) {
              router.push("/meri_dukaan/reels/upload-reel" as any);
            } else {
              Alert.alert("Daily Limit", "You can upload only 1 reel per day. Come back tomorrow!");
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.uploadCardLeft}>
            <View style={styles.uploadIconCircle}>
              <Upload
                size={22}
                color={canUpload ? colors.brand.primary : colors.ui.muted}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.uploadCardTitle,
                  !canUpload && { color: colors.text.tertiary },
                ]}
              >
                {canUpload ? "Upload New Reel" : "Daily Limit Reached"}
              </Text>
              <Text style={styles.uploadCardSub}>
                {canUpload
                  ? "1 reel per day • Max 1 minute"
                  : "Come back tomorrow to upload"}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Sort & Filter */}
        {reels.length > 0 && (
          <View style={styles.sortRow}>
            <Text style={styles.sectionTitle}>
              Your Reels ({reels.length})
            </Text>
            <View style={styles.sortBtns}>
              {(["recent", "views", "likes"] as const).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sortBtn,
                    sortBy === key && styles.sortBtnActive,
                  ]}
                  onPress={() => setSortBy(key)}
                >
                  <Text
                    style={[
                      styles.sortBtnText,
                      sortBy === key && styles.sortBtnTextActive,
                    ]}
                  >
                    {key === "recent"
                      ? "Recent"
                      : key === "views"
                        ? "Views"
                        : "Likes"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reels Grid */}
        {reels.length === 0 ? (
          <View style={styles.emptyState}>
            <Film size={48} color={colors.ui.muted} />
            <Text style={styles.emptyTitle}>No Reels Yet</Text>
            <Text style={styles.emptySub}>
              Upload your first reel to boost your store's visibility and
              engagement
            </Text>
            {canUpload && (
              <TouchableOpacity
                style={styles.emptyUploadBtn}
                onPress={() =>
                  router.push("/meri_dukaan/reels/upload-reel" as any)
                }
              >
                <Upload size={16} color={colors.text.inverse} />
                <Text style={styles.emptyUploadBtnText}>
                  Upload Your First Reel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.reelGrid}>
            {sortedReels.map((r) => (
              <View key={r.id} style={styles.reelCard}>
                {/* Thumbnail */}
                <View style={styles.reelThumb}>
                  {r.thumbnail ? (
                    <Image
                      source={{ uri: r.thumbnail }}
                      style={styles.reelThumbImg}
                    />
                  ) : (
                    <View style={styles.reelThumbPlaceholder}>
                      <Film size={28} color={colors.brand.primary} />
                      <Text style={styles.reelThumbLabel}>Reel</Text>
                    </View>
                  )}
                  {/* Action overlay */}
                  <View style={styles.reelOverlay}>
                    <TouchableOpacity
                      style={styles.reelActionBtn}
                      onPress={() => handleEditReel(r)}
                    >
                      <Edit3 size={12} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.reelActionBtn,
                        { backgroundColor: colors.status.error },
                      ]}
                      onPress={() => handleRemoveReel(r.id)}
                    >
                      <Trash2 size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {/* Views badge */}
                  <View style={styles.viewsBadge}>
                    <Eye size={10} color="#fff" />
                    <Text style={styles.viewsBadgeText}>
                      {r.views.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Caption */}
                <Text style={styles.reelCaption} numberOfLines={2}>
                  {r.caption || "No caption"}
                </Text>

                {/* Stats */}
                <View style={styles.reelStats}>
                  <View style={styles.miniStat}>
                    <Heart size={11} color={colors.text.tertiary} />
                    <Text style={styles.miniStatNum}>{r.likes}</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <MessageCircle size={11} color={colors.text.tertiary} />
                    <Text style={styles.miniStatNum}>{r.comments}</Text>
                  </View>
                </View>

                {/* Date */}
                <Text style={styles.reelDate}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ui.background },

  /* Header */
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  uploadHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: { padding: spacing.md },

  /* Store banner */
  storeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  storeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  storeBannerImg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
  },
  storeBannerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  storeBannerCategory: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  reelCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand.primary + "10",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  reelCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },

  /* Engagement */
  engagementCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  engagementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  engagementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  engagementRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  engagementStat: { alignItems: "center", gap: 4 },
  engagementNum: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  engagementLabel: { fontSize: 11, color: colors.text.tertiary },
  engagementDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.ui.border,
  },
  avgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
  },
  avgText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.tint.green,
  },

  /* Upload card */
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.brand.primary + "30",
    borderStyle: "dashed",
  },
  uploadCardDisabled: {
    borderColor: colors.ui.border,
    opacity: 0.7,
  },
  uploadCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  uploadCardSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },

  /* Sort */
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  sortBtns: { flexDirection: "row", gap: 6 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.ui.background,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  sortBtnActive: {
    backgroundColor: colors.brand.primary + "10",
    borderColor: colors.brand.primary,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
  },
  sortBtnTextActive: { color: colors.brand.primary },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  emptySub: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  emptyUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    gap: 8,
    marginTop: spacing.md,
    ...shadows.medium,
  },
  emptyUploadBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  /* Reel Grid */
  reelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  reelCard: {
    width: REEL_CARD_WIDTH,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  reelThumb: { position: "relative" },
  reelThumbImg: { width: "100%", height: 160 },
  reelThumbPlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: colors.brand.primary + "0A",
    justifyContent: "center",
    alignItems: "center",
  },
  reelThumbLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.brand.primary,
    marginTop: 4,
  },
  reelOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    gap: 6,
  },
  reelActionBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  viewsBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  viewsBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  reelCaption: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  reelStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 3 },
  miniStatNum: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: "600",
  },
  reelDate: {
    fontSize: 10,
    color: colors.text.light,
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 8,
  },
});
