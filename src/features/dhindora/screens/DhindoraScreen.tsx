// src/features/dhindora/screens/DhindoraScreen.tsx
import { useApp } from "@/src/context/AppContext";
import * as NavigationBar from "expo-navigation-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MessageCircle,
  MoreVertical,
  Send,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
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

const { width, height } = Dimensions.get("window");

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

const ReelItem = ({ item, isVisible }: { item: Reel; isVisible: boolean }) => {
  const { toggleLikeReel } = useApp();
  const [isLiked, setIsLiked] = useState(item.liked || false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [isSaved, setIsSaved] = useState(false);

  // Initialize the video player
  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Handle Play/Pause based on visibility
  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible]);

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
    <View style={styles.videoContainer}>
      {/* Video Player */}
      <VideoView
        player={player}
        style={styles.fullVideo}
        contentFit="cover"
        nativeControls={false}
      />

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

      {/* Top Gradient for better text visibility */}
      <View style={styles.topGradient} />
      <View style={styles.bottomGradient} />
    </View>
  );
};

export default function DhindoraScreen() {
  const { reels } = useApp();
  const [viewableItem, setViewableItem] = useState<string | null>(null);

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

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setViewableItem(viewableItems[0].key);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
        hidden
      />

      <FlatList
        data={reels}
        renderItem={({ item }) => (
          <ReelItem item={item} isVisible={viewableItem === item._id} />
        )}
        keyExtractor={(item) => item._id}
        pagingEnabled
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={height}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />

      {/* Top Tab Bar (like Instagram) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topTab}>
          <Text style={[styles.topTabText, styles.activeTopTab]}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topTab}>
          <Text style={styles.topTabText}>Following</Text>
        </TouchableOpacity>
      </View>
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
    height: height,
    position: "relative",
  },
  fullVideo: {
    flex: 1,
    width: width,
    height: height,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    zIndex: 10,
  },
  topTab: {
    paddingVertical: 8,
  },
  topTabText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "700",
  },
  activeTopTab: {
    color: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
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
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor:
      "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor:
      "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
    zIndex: 1,
  },
});
