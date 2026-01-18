import * as NavigationBar from "expo-navigation-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { BadgeCheck, Heart, MessageSquare } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageStyle,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useApp } from "../../../context/AppContext";

const { width, height } = Dimensions.get("window");

// 1. Define the Reel interface to fix the 'any' type errors
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
}

const ReelItem = ({ item, isVisible }: { item: Reel; isVisible: boolean }) => {
  // Initialize the video player
  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
    if (isVisible) player.play();
  });

  // Handle Play/Pause based on visibility
  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.fullVideo}
        contentFit="cover"
        nativeControls={false}
      />

      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.iconCircle}>
            <Heart
              color="white"
              fill={item.liked ? "#ff4081" : "none"}
              size={28}
            />
          </View>
          <Text style={styles.actionText}>{item.likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.iconCircle}>
            <MessageSquare color="white" size={28} />
          </View>
          <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user?.avatar }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.username}>
              {item.user?.name} <BadgeCheck size={14} color="#00BAFF" />
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function DhindoraSection() {
  const { reels } = useApp();
  const [viewableItem, setViewableItem] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
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
      />

      {/* Floating App Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/Meri_dukaan_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <FlatList
        data={reels}
        renderItem={({ item }) => (
          <ReelItem item={item} isVisible={viewableItem === item._id} />
        )}
        keyExtractor={(item) => item._id}
        pagingEnabled
        // Removed 'vertical' prop as it's default and causing TS errors
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  } as ViewStyle,
  logoContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  } as ViewStyle,
  logo: {
    width: 100,
    height: 40,
  } as ImageStyle,
  videoContainer: {
    width: width,
    height: height,
  } as ViewStyle,
  fullVideo: {
    flex: 1,
  } as ViewStyle,
  sidebar: {
    position: "absolute",
    right: 15,
    bottom: 100,
    zIndex: 10,
  } as ViewStyle,
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  } as ViewStyle,
  actionBtn: {
    alignItems: "center",
    marginBottom: 15,
  } as ViewStyle,
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  } as TextStyle,
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    padding: 20,
  } as ViewStyle,
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1, // Fixed: changed from borderWeight
    borderColor: "#fff",
  } as ImageStyle,
  username: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  } as TextStyle,
  description: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
    width: "85%",
  } as TextStyle,
});
