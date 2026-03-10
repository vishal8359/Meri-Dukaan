// app/dhindora-store.tsx
import { EnhancedReel } from "@/src/assets/mockData";
import { useApp } from "@/src/context/AppContext";
import { useReelSession } from "@/src/context/ReelContext";
import { ReelItem } from "@/src/features/dhindora/components/ReelItem";
import { reelCache } from "@/src/utils/reelCacheManager";
import { preloadNextReel } from "@/src/utils/videoLoadingOptimizer";
import * as NavigationBar from "expo-navigation-bar";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Store } from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

const REELS_PER_PAGE = 3;

export default function StoreDhindoraScreen() {
  const { storeId, initialIndex } = useLocalSearchParams<{
    storeId: string;
    initialIndex?: string;
  }>();

  const { reels: allReels, toggleLikeReel, getStoreById } = useApp();
  const { reelState, setReelState, pauseSession, resumeSession } =
    useReelSession();

  // Filter reels for this specific store
  const storeReels = useMemo(
    () => allReels.filter((r: EnhancedReel) => r.store.id === storeId),
    [allReels, storeId],
  );

  const store = useMemo(
    () => getStoreById(storeId || ""),
    [getStoreById, storeId],
  );

  const startIndex = parseInt(initialIndex || "0", 10);

  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const screenHeight = windowHeight;

  const [viewableItem, setViewableItem] = useState<string | null>(null);
  const [reels, setReels] = useState<EnhancedReel[]>(
    storeReels.slice(0, Math.max(REELS_PER_PAGE, startIndex + 2)),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReels, setHasMoreReels] = useState(
    storeReels.length > REELS_PER_PAGE,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaused, setIsPaused] = useState(reelState.isPaused);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(true, "fade");
      resumeSession();
      setIsPaused(false);
      return () => {
        StatusBar.setHidden(false, "fade");
        pauseSession();
        setIsPaused(true);
      };
    }, [pauseSession, resumeSession]),
  );

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
    return () => {
      if (Platform.OS === "android") {
        NavigationBar.setVisibilityAsync("visible");
      }
    };
  }, []);

  // Scroll to initial index if provided
  useEffect(() => {
    if (
      startIndex > 0 &&
      flatListRef.current &&
      reels.length > startIndex &&
      !initialScrollDone
    ) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: startIndex,
          animated: false,
        });
        setInitialScrollDone(true);
      }, 100);
    }
  }, [startIndex, reels.length, initialScrollDone]);

  const fetchMoreReels = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const startIdx = currentPage * REELS_PER_PAGE;
    const endIdx = startIdx + REELS_PER_PAGE;
    const newReels = storeReels.slice(startIdx, endIdx);

    if (newReels.length > 0) {
      newReels.forEach((reel: EnhancedReel) => {
        if (!reelCache.isCached(reel._id)) reelCache.addToCache(reel._id, reel);
      });
      setReels((prev) => [...prev, ...newReels]);
      setCurrentPage((prev) => prev + 1);
      if (endIdx >= storeReels.length) setHasMoreReels(false);
    } else {
      setHasMoreReels(false);
    }
    setIsLoadingMore(false);
  }, [currentPage, isLoadingMore, storeReels]);

  // ─── Use a stable ref callback that always reads latest `reels` ────────
  const reelsRef = useRef(reels);
  useEffect(() => {
    reelsRef.current = reels;
  }, [reels]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setViewableItem(visibleItem.key);

      const latestReels = reelsRef.current;
      const visibleIndex = latestReels.findIndex(
        (r) => r._id === visibleItem.key,
      );
      if (visibleIndex >= 0) {
        setReelState({
          currentReelIndex: visibleIndex,
          reelId: visibleItem.key,
        });
        const currentReel = latestReels[visibleIndex];
        if (!reelCache.isCached(currentReel._id))
          reelCache.addToCache(currentReel._id, currentReel);
        reelCache.queueForPreload(latestReels, visibleIndex);
        if (visibleIndex < latestReels.length - 1) {
          preloadNextReel(latestReels[visibleIndex + 1].videoUrl).catch(
            () => {},
          );
        }
      }
    }
  }).current;

  const onEndReached = useCallback(() => {
    if (hasMoreReels && !isLoadingMore) fetchMoreReels();
  }, [hasMoreReels, isLoadingMore, fetchMoreReels]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <View
      style={[styles.container, { height: screenHeight, width: windowWidth }]}
    >
      {/* Store Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Store size={16} color="#fff" />
          <Text style={styles.storeName} numberOfLines={1}>
            {store?.name || "Store Reels"}
          </Text>
        </View>
        <Text style={styles.reelCount}>{storeReels.length} Reels</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={({ item }) => (
          <ReelItem
            item={item}
            isVisible={viewableItem === item._id}
            isPaused={isPaused}
            itemHeight={screenHeight}
            itemWidth={windowWidth}
            onLikeToggle={toggleLikeReel}
          />
        )}
        keyExtractor={(item) => item._id}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        removeClippedSubviews={true}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={50}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
});
