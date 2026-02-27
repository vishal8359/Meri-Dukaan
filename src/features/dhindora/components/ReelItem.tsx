// src/features/dhindora/components/ReelItem.tsx
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { EnhancedReel } from "@/src/assets/mockData";
import {
    useCommentsManager,
    useReelInteraction,
} from "../hooks/useReelInteraction";
import { ReelComment } from "../types";
import { CommentsModal } from "./CommentsModal";
import { DescriptionModal } from "./DescriptionModal";
import { ReelBottomInfo } from "./ReelBottomInfo";
import { ReelSidebar } from "./ReelSidebar";
import { ShareModal } from "./ShareModal";

interface ReelItemProps {
  item: EnhancedReel;
  isVisible: boolean;
  isPaused: boolean;
  itemHeight: number;
  itemWidth: number;
  onLikeToggle: (reelId: string) => void;
}

// Helper to convert mockData comments to component format
const convertComments = (comments: EnhancedReel["comments"]): ReelComment[] => {
  return comments.map((c) => ({
    id: c.id,
    user: {
      id: c.user.id,
      name: c.user.name,
      avatar: c.user.avatar,
      isVerified: c.user.isVerified,
    },
    text: c.text,
    likesCount: c.likesCount,
    liked: c.liked,
    createdAt: c.createdAt,
    isReview: c.isReview,
    replies: c.replies.map((r) => ({
      id: r.id,
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
      text: r.text,
      likesCount: r.likesCount,
      liked: r.liked,
      createdAt: r.createdAt,
    })),
  }));
};

export const ReelItem: React.FC<ReelItemProps> = ({
  item,
  isVisible,
  isPaused: parentPaused,
  itemHeight,
  itemWidth,
  onLikeToggle,
}) => {
  const router = useRouter();
  const [isClickedPaused, setIsClickedPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Video player setup
  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  const [playerStatus, setPlayerStatus] = useState<string>(
    player.status ?? "idle",
  );

  useEffect(() => {
    const subscription = player.addListener(
      "statusChange",
      ({ status }: { status: string }) => {
        setPlayerStatus(status);
      },
    );
    return () => subscription.remove();
  }, [player]);

  const isReadyToPlay = playerStatus === "readyToPlay";
  const isLoading = isVisible && !isClickedPaused && !isReadyToPlay;

  // Play/pause based on visibility
  useEffect(() => {
    if (!isReadyToPlay) return;

    try {
      if (isVisible && !parentPaused && !isClickedPaused) {
        player.play();
      } else {
        player.pause();
      }
    } catch (err) {
      console.log("Playback toggle error for reel", item._id, ":", err);
    }
  }, [isVisible, parentPaused, isClickedPaused, isReadyToPlay, item._id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) {}
    };
  }, [item._id]);

  // Reel interaction state
  const {
    isLiked,
    likesCount,
    isSaved,
    isFollowing,
    commentsCount,
    handleLike,
    handleSave,
    handleFollow,
    incrementComments,
  } = useReelInteraction({
    initialLiked: item.liked,
    initialLikesCount: item.likesCount,
    initialCommentsCount: item.comments.length,
    onLikeChange: () => onLikeToggle(item._id),
  });

  // Comments management
  const { comments, addComment, likeComment, addReply, likeReply } =
    useCommentsManager({
      initialComments: convertComments(item.comments),
    });

  const handleVideoPress = useCallback(() => {
    try {
      if (isClickedPaused) {
        player.play();
      } else {
        player.pause();
      }
    } catch (err) {
      console.log("Error toggling video play/pause:", err);
    }
    setIsClickedPaused(!isClickedPaused);
  }, [isClickedPaused, player]);

  // Navigation handlers
  const handleStorePress = useCallback(() => {
    router.push(`/dukaan/${item.store.id}`);
  }, [router, item.store.id]);

  const handleItemPress = useCallback(() => {
    if (item.item.type === "product") {
      router.push(`/product/${item.item.id}`);
    } else {
      router.push(`/service/${item.item.id}`);
    }
  }, [router, item.item]);

  const handleAddComment = useCallback(
    (text: string) => {
      addComment(text);
      incrementComments();
    },
    [addComment, incrementComments],
  );

  const handleShareComplete = useCallback(() => {
    // Could increment shares count here if needed
  }, []);

  const handleMoreOptions = useCallback(() => {
    // TODO: Implement more options menu (report, not interested, etc.)
  }, []);

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

      {/* Video tap overlay for play/pause */}
      <TouchableOpacity
        style={styles.videoOverlay}
        activeOpacity={1}
        onPress={handleVideoPress}
      >
        {isClickedPaused && (
          <View style={styles.pauseIndicator}>
            <Text style={styles.pauseText}>⏸</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Right sidebar with actions */}
      <ReelSidebar
        isLiked={isLiked}
        likesCount={likesCount}
        onLike={handleLike}
        commentsCount={commentsCount}
        onComment={() => setShowComments(true)}
        sharesCount={item.shares}
        onShare={() => setShowShare(true)}
        isSaved={isSaved}
        onSave={handleSave}
        onMoreOptions={handleMoreOptions}
        item={{
          id: item.item.id,
          name: item.item.name,
          price: item.item.price,
          image: item.item.image,
          type: item.item.type,
        }}
        onItemPress={handleItemPress}
      />

      {/* Bottom info section */}
      <ReelBottomInfo
        store={{
          id: item.store.id,
          name: item.store.name,
          logo: item.store.logo,
          type: item.store.type,
          isVerified: item.store.isVerified,
        }}
        description={item.description}
        isFollowing={isFollowing}
        onFollowPress={handleFollow}
        onStorePress={handleStorePress}
        onDescriptionPress={() => setShowDescription(true)}
      />

      {/* Comments Modal */}
      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={likeComment}
        onAddReply={addReply}
        onLikeReply={likeReply}
      />

      {/* Description Modal */}
      <DescriptionModal
        visible={showDescription}
        onClose={() => setShowDescription(false)}
        description={item.description}
        store={{
          id: item.store.id,
          name: item.store.name,
          logo: item.store.logo,
          type: item.store.type,
          isVerified: item.store.isVerified,
        }}
        onStorePress={handleStorePress}
      />

      {/* Share Modal */}
      <ShareModal
        visible={showShare}
        onClose={() => setShowShare(false)}
        reelId={item._id}
        storeName={item.store.name}
        description={item.description}
        onShareComplete={handleShareComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    overflow: "hidden",
    position: "relative",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseIndicator: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseText: {
    fontSize: 40,
    color: "#fff",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 20,
  },
});

export default ReelItem;
