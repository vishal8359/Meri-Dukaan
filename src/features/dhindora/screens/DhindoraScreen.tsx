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
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const REELS_PER_PAGE = 3;
const VIDEO_LOAD_CHUNK = 0.5;

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
  itemWidth,
}: {
  item: Reel;
  isVisible: boolean;
  isPaused: boolean;
  itemHeight: number;
  itemWidth: number;
}) => {
  const { toggleLikeReel } = useApp();
  const [isLiked, setIsLiked] = useState(item.liked || false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);

  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
    playerRef.current = player;
  });

  useEffect(() => {
    if (!playerRef.current) return;

    if (isVisible && !parentPaused) {
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
      setIsLoading(true);
    }
  }, [isVisible, parentPaused]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    toggleLikeReel(item._id);
  };

  const handleSave = () => setIsSaved(!isSaved);

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  return (
    <View
      style={[styles.videoContainer, { height: itemHeight, width: itemWidth }]}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {isLoading && isVisible && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <View style={styles.rightSidebar}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: item.user?.avatar }}
            style={styles.profilePic}
          />
          <View style={styles.followBtn}>
            <Text style={styles.followBtnText}>+</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Heart
            size={32}
            color="#fff"
            fill={isLiked ? "#ff4081" : "none"}
            strokeWidth={isLiked ? 0 : 2}
          />
          <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={32} color="#fff" strokeWidth={2} />
          <Text style={styles.actionCount}>
            {formatCount(item.comments?.length || 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Send size={32} color="#fff" strokeWidth={2} />
          <Text style={styles.actionCount}>
            {formatCount(item.shares || 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
          <Bookmark
            size={30}
            color="#fff"
            fill={isSaved ? "#fff" : "none"}
            strokeWidth={2}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MoreVertical size={28} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.promotionThumbnail}>
          <Image
            source={{ uri: item.user?.avatar }}
            style={styles.thumbnailImage}
          />
        </View>
      </View>

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

  // FIXED: Using hooks for reactive dimensions
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Calculate screen height precisely (excluding safe areas if not handled by StatusBar hidden)
  // If you are using Tab Navigation, subtract your Tab Bar height here as well.
  const screenHeight = windowHeight;

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

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setViewableItem(visibleItem.key);
      const visibleIndex = reels.findIndex((r) => r._id === visibleItem.key);
      if (visibleIndex >= 0) {
        setReelState({
          currentReelIndex: visibleIndex,
          reelId: visibleItem.key,
        });
        const currentReel = reels[visibleIndex];
        if (!reelCache.isCached(currentReel._id))
          reelCache.addToCache(currentReel._id, currentReel);
        reelCache.queueForPreload(reels, visibleIndex);
        if (visibleIndex < reels.length - 1) {
          preloadNextReel(reels[visibleIndex + 1].videoUrl).catch(() => {});
        }
      }
    }
  }).current;

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
          />
        )}
        keyExtractor={(item) => item._id}
        pagingEnabled
        // --- CRITICAL FIXES FOR ONE-BY-ONE SCROLLING ---
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true} // Forces it to stop at the next item
        // ----------------------------------------------

        removeClippedSubviews={true}
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
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
  videoContainer: {
    overflow: "hidden",
    position: "relative",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 20,
  },
  rightSidebar: {
    position: "absolute",
    right: 12,
    bottom: 90, // Slightly adjusted for modern gesture bars
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
    marginBottom: 20,
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
    bottom: 60, // Adjust this based on your bottom nav bar presence
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
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
});
