// src/features/dhindora/screens/DhindoraScreen.tsx
import { EnhancedReel } from "@/src/assets/mockData";
import { useApp } from "@/src/context/AppContext";
import { useReelSession } from "@/src/context/ReelContext";
import { reelCache } from "@/src/utils/reelCacheManager";
import { preloadNextReel } from "@/src/utils/videoLoadingOptimizer";
import * as NavigationBar from "expo-navigation-bar";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { ReelItem } from "../components/ReelItem";

const REELS_PER_PAGE = 3;

export default function DhindoraScreen() {
  const { reels: initialReels, toggleLikeReel } = useApp();
  const { reelState, setReelState, pauseSession, resumeSession } =
    useReelSession();

  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const screenHeight = windowHeight;

  const [viewableItem, setViewableItem] = useState<string | null>(null);
  const [reels, setReels] = useState<EnhancedReel[]>(
    initialReels.slice(0, REELS_PER_PAGE),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReels, setHasMoreReels] = useState(
    initialReels.length > REELS_PER_PAGE,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaused, setIsPaused] = useState(reelState.isPaused);

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

  useEffect(() => {
    if (
      reelState.currentReelIndex > 0 &&
      flatListRef.current &&
      reels.length > 0
    ) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: reelState.currentReelIndex,
          animated: false,
        });
      }, 100);
    }
  }, []);

  const fetchMoreReels = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const startIdx = currentPage * REELS_PER_PAGE;
    const endIdx = startIdx + REELS_PER_PAGE;
    const newReels = initialReels.slice(startIdx, endIdx);

    if (newReels.length > 0) {
      newReels.forEach((reel) => {
        if (!reelCache.isCached(reel._id)) reelCache.addToCache(reel._id, reel);
      });
      setReels((prev) => [...prev, ...newReels]);
      setCurrentPage((prev) => prev + 1);
      if (endIdx >= initialReels.length) setHasMoreReels(false);
    } else {
      setHasMoreReels(false);
    }
    setIsLoadingMore(false);
  }, [currentPage, isLoadingMore, initialReels]);

  // ─── FIX: Use a stable ref callback that always reads latest `reels` ────────
  const reelsRef = useRef(reels);
  useEffect(() => {
    reelsRef.current = reels;
  }, [reels]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setViewableItem(visibleItem.key);

      // Use reelsRef.current so we always have the latest list (avoids stale closure)
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
  // ───────────────────────────────────────────────────────────────────────────

  const onEndReached = useCallback(() => {
    if (hasMoreReels && !isLoadingMore) fetchMoreReels();
  }, [hasMoreReels, isLoadingMore, fetchMoreReels]);

  return (
    <View
      style={[styles.container, { height: screenHeight, width: windowWidth }]}
    >
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
    backgroundColor: "#000", // Intentional: pure black for video player background
  },
});
