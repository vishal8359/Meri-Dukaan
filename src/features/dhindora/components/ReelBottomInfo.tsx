// src/features/dhindora/components/ReelBottomInfo.tsx
import { BadgeCheck } from "lucide-react-native";
import React from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ReelStore } from "../types";

interface ReelBottomInfoProps {
  store: ReelStore;
  description: string;
  isFollowing: boolean;
  onFollowPress: () => void;
  onStorePress: () => void;
  onDescriptionPress: () => void;
}

export const ReelBottomInfo: React.FC<ReelBottomInfoProps> = ({
  store,
  description,
  isFollowing,
  onFollowPress,
  onStorePress,
  onDescriptionPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Store Info Row - Logo + Name + Follow */}
      <View style={styles.storeRow}>
        <TouchableOpacity style={styles.storeInfo} onPress={onStorePress}>
          <Image source={{ uri: store.logo }} style={styles.storeLogo} />
          <View style={styles.storeTextContainer}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeName}>{store.name}</Text>
              {store.isVerified && (
                <BadgeCheck size={14} color="#00BAFF" fill="#00BAFF" />
              )}
            </View>
            <Text style={styles.storeType}>{store.type}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={onFollowPress}
        >
          <Text
            style={[styles.followText, isFollowing && styles.followingText]}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description - Clickable */}
      <TouchableOpacity onPress={onDescriptionPress} activeOpacity={0.8}>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.moreText}>more</Text>
      </TouchableOpacity>

      {/* Audio Row */}
      <View style={styles.audioRow}>
        <Text style={styles.audioIcon}>🎵</Text>
        <Text style={styles.audioText} numberOfLines={1}>
          Original Audio • {store.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    zIndex: 5,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  storeTextContainer: {
    marginLeft: 10,
  },
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storeType: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  followBtn: {
    marginLeft: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fff",
  },
  followingBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  followText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  followingText: {
    color: "#fff",
  },
  description: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 80,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  moreText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
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

export default ReelBottomInfo;
