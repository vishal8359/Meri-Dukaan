// app/dukaan/reels/[storeId].tsx
import { Reel, useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import StoreReelsGrid from "@/src/features/dukaan/components/StoreReelsGrid";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Play } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StoreReelsPage() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const { t } = useSettings();
  const { reels, allStores, getStoreById } = useApp();

  // Get store info
  const store = useMemo(
    () => getStoreById(storeId || ""),
    [getStoreById, storeId],
  );

  // Filter reels for this store
  const storeReels = useMemo(
    () => reels.filter((r: Reel) => r.store.id === storeId),
    [reels, storeId],
  );

  const handleReelPress = useCallback(
    (reel: Reel, index: number) => {
      // Navigate to dhindora with store filter
      router.push({
        pathname: "/dhindora-store",
        params: {
          storeId: storeId,
          initialIndex: index.toString(),
        },
      });
    },
    [storeId],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // Header component for the grid
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContent}>
        {/* Store Info Card */}
        <View style={styles.storeCard}>
          <Image source={{ uri: store?.image }} style={styles.storeImage} />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store?.name || "Store"}</Text>
            <Text style={styles.storeType}>{store?.type || "Shop"}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Play size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{storeReels.length}</Text>
            <Text style={styles.statLabel}>{t("reels.reels")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {storeReels.reduce(
                (acc: number, r: Reel) => acc + r.likesCount,
                0,
              )}
            </Text>
            <Text style={styles.statLabel}>{t("reels.totalLikes")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {storeReels.reduce(
                (acc: number, r: Reel) => acc + r.comments.length,
                0,
              )}
            </Text>
            <Text style={styles.statLabel}>{t("reels.comments")}</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>{t("reels.allReels")}</Text>
      </View>
    ),
    [store, storeReels],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("reels.storeReels")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Reels Grid */}
      <StoreReelsGrid
        reels={storeReels}
        onReelPress={handleReelPress}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    paddingBottom: 16,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
  },
  storeInfo: {
    marginLeft: 14,
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  storeType: {
    fontSize: 14,
    color: "#64748b",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
