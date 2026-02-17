// src/features/dhindora/screens/DhindoraScreen.tsx
import { useApp } from "@/src/context/AppContext";
import { useReelSession } from "@/src/context/ReelContext";
import { reelCache } from "@/src/utils/reelCacheManager";
import { preloadNextReel } from "@/src/utils/videoLoadingOptimizer";
import * as NavigationBar from "expo-navigation-bar";
import { useFocusEffect } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MessageCircle,
  MoreVertical,
  Send,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const REELS_PER_PAGE = 3; // Fetch 3 reels at a time for low latency
const VIDEO_LOAD_CHUNK = 0.5; // Load video in 0.5-second chunks (faster loading)

interface Reel {
  _id: string;
  videoUrl: string;
  liked?: boolean;
  likesCount: number;
  description: string;
  user: {
    name: string;
    avatar: string;
  };
  comments: any[];
  shares?: number;
  saves?: number;
}

const ReelItem = ({
  item,
  isVisible,
  isPaused: parentPaused,
  itemHeight,
}: {
  item: Reel;
  isVisible: boolean;
  isPaused: boolean;
  itemHeight: number;
}) => {
  const { toggleLikeReel } = useApp();
  const [isLiked, setIsLiked] = useState(item.liked || false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);

  // Initialize the video player with chunked loading
  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
    playerRef.current = player;
  });

  // Handle Play/Pause based on visibility and parent pause state
  useEffect(() => {
    if (!playerRef.current) return;

    if (isVisible && !parentPaused) {
      // Start playing immediately with minimal delay
      const timer = setTimeout(() => {
        try {
          playerRef.current.play();
          setIsLoading(false);
        } catch (err) {
          console.log("Playback error:", err);
          setIsLoading(false);
        }
      }, VIDEO_LOAD_CHUNK * 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        playerRef.current.pause();
      } catch (err) {
        console.log("Pause error:", err);
      }
      // Release memory when not visible
      setIsLoading(true);
    }
  }, [isVisible, parentPaused]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    toggleLikeReel(item._id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <View style={[styles.videoContainer, { height: itemHeight, width: width }]}>
      {/* Video Player */}
      <VideoView
        player={player}
        style={[styles.fullVideo, { height: itemHeight }]}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Loading Indicator */}
      {isLoading && isVisible && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Right Sidebar Actions */}
      <View style={styles.rightSidebar}>
        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: item.user?.avatar }}
            style={styles.profilePic}
          />
          <View style={styles.followBtn}>
            <Text style={styles.followBtnText}>+</Text>
          </View>
        </View>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Heart
            size={32}
            color="#fff"
            fill={isLiked ? "#ff4081" : "none"}
            strokeWidth={isLiked ? 0 : 2}
          />
          <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Comments Button */}
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={32} color="#fff" strokeWidth={2} />
          <Text style={styles.actionCount}>
            {formatCount(item.comments?.length || 0)}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionBtn}>
          <Send size={32} color="#fff" strokeWidth={2} />
          <Text style={styles.actionCount}>
            {formatCount(item.shares || 0)}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
          <Bookmark
            size={30}
            color="#fff"
            fill={isSaved ? "#fff" : "none"}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* More Options */}
        <TouchableOpacity style={styles.actionBtn}>
          <MoreVertical size={28} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        {/* Creator's Product/Store Image (for promotion) */}
        <View style={styles.promotionThumbnail}>
          <Image
            source={{ uri: item.user?.avatar }}
            style={styles.thumbnailImage}
          />
        </View>
      </View>

      {/* Bottom Overlay Info */}
      <View style={styles.bottomOverlay}>
        <View style={styles.userRow}>
          <TouchableOpacity style={styles.userInfo}>
            <Text style={styles.username}>
              @{item.user?.name.toLowerCase().replace(" ", "_")}
            </Text>
            {item.user?.name && (
              <BadgeCheck size={16} color="#00BAFF" fill="#00BAFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.followTextBtn}>
            <Text style={styles.followText}>• Follow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Music/Audio Track */}
        <View style={styles.audioRow}>
          <Text style={styles.audioIcon}>🎵</Text>
          <Text style={styles.audioText} numberOfLines={1}>
            Original Audio • {item.user?.name}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function DhindoraScreen() {
  const { reels: initialReels } = useApp();
  const { reelState, setReelState, pauseSession, resumeSession } =
    useReelSession();

  const screenHeight = Dimensions.get("screen").height;

  const [viewableItem, setViewableItem] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>(
    initialReels.slice(0, REELS_PER_PAGE),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReels, setHasMoreReels] = useState(
    initialReels.length > REELS_PER_PAGE,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaused, setIsPaused] = useState(reelState.isPaused);

  const flatListRef = useRef<FlatList>(null);

  // Handle focus/blur events to pause/resume
  useFocusEffect(
    useCallback(() => {
      // Properly hide status bar
      StatusBar.setHidden(true, "none");

      // Resume when screen is focused
      resumeSession();
      setIsPaused(false);

      return () => {
        // Show status bar when leaving
        StatusBar.setHidden(false, "none");

        // Pause when screen is unfocused
        pauseSession();
        setIsPaused(true);
      };
    }, [pauseSession, resumeSession]),
  );

  useEffect(() => {
    // Hide navigation bar on Android for full-screen experience
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

  // Restore scroll position if available
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

  // Dynamic fetching of reels with caching - simulates API call
  const fetchMoreReels = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    // Simulate network delay for realistic chunk loading
    await new Promise((resolve) => setTimeout(resolve, 500));

    const startIdx = currentPage * REELS_PER_PAGE;
    const endIdx = startIdx + REELS_PER_PAGE;
    const newReels = initialReels.slice(startIdx, endIdx);

    if (newReels.length > 0) {
      // Add newly fetched reels to cache
      newReels.forEach((reel) => {
        if (!reelCache.isCached(reel._id)) {
          reelCache.addToCache(reel._id, reel);
        }
      });

      setReels((prev) => [...prev, ...newReels]);
      setCurrentPage((prev) => prev + 1);

      // Check if there are more reels to fetch
      if (endIdx >= initialReels.length) {
        setHasMoreReels(false);
      }
    } else {
      setHasMoreReels(false);
    }

    setIsLoadingMore(false);
  }, [currentPage, isLoadingMore, initialReels]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setViewableItem(visibleItem.key);

      // Find current reel index
      const visibleIndex = reels.findIndex((r) => r._id === visibleItem.key);
      if (visibleIndex >= 0) {
        // Update session state with current reel index
        setReelState({
          currentReelIndex: visibleIndex,
          reelId: visibleItem.key,
        });

        // Add current reel to cache
        const currentReel = reels[visibleIndex];
        if (!reelCache.isCached(currentReel._id)) {
          reelCache.addToCache(currentReel._id, currentReel);
        }

        // Predictive preloading: queue next 3 reels for preload
        reelCache.queueForPreload(reels, visibleIndex);

        // Start preloading the next reel immediately
        if (visibleIndex < reels.length - 1) {
          const nextReel = reels[visibleIndex + 1];
          preloadNextReel(nextReel.videoUrl).catch((err) =>
            console.log("Preload failed:", err),
          );
        }
      }
    }
  }).current;

  // Trigger loading more when user is near the end
  const onEndReached = useCallback(() => {
    if (hasMoreReels && !isLoadingMore) {
      fetchMoreReels();
    }
  }, [hasMoreReels, isLoadingMore, fetchMoreReels]);

  return (
    <View style={styles.reelPage}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={({ item }) => (
          <ReelItem
            item={item}
            isVisible={viewableItem === item._id}
            isPaused={isPaused}
            itemHeight={screenHeight}
          />
        )}
        keyExtractor={(item) => item._id}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        removeClippedSubviews
        windowSize={3}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 95,
        }}
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
  videoContainer: {
    width: width,
    position: "relative",
  },
  fullVideo: {
    flex: 1,
    width: width,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 20,
  },
  loadingFooter: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  rightSidebar: {
    position: "absolute",
    right: 12,
    bottom: 100,
    alignItems: "center",
    zIndex: 10,
  },
  profileContainer: {
    marginBottom: 20,
    position: "relative",
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  followBtn: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff4081",
    justifyContent: "center",
    alignItems: "center",
  },
  followBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  actionBtn: {
    alignItems: "center",
    marginBottom: 24,
  },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  promotionThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#fff",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    zIndex: 5,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  followTextBtn: {
    marginLeft: 8,
  },
  followText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    paddingRight: 60,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  audioIcon: {
    fontSize: 12,
  },
  audioText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  reelPage: {
    height: Dimensions.get("screen").height,
    width: Dimensions.get("screen").width,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#000",
  },
});
