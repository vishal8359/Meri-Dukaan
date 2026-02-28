// src/features/dhindora/components/ReelSidebar.tsx
import { colors } from "@/src/theme/colors";
import {
    Bookmark,
    Briefcase,
    Heart,
    MessageCircle,
    MoreVertical,
    Send,
    ShoppingBag,
} from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ReelProduct, ReelService } from "../types";

interface ReelSidebarProps {
  // Like state
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;

  // Comment
  commentsCount: number;
  onComment: () => void;

  // Share
  sharesCount: number;
  onShare: () => void;

  // Save/Bookmark
  isSaved: boolean;
  onSave: () => void;

  // More options
  onMoreOptions: () => void;

  // Product/Service
  item: ReelProduct | ReelService;
  onItemPress: () => void;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
};

export const ReelSidebar: React.FC<ReelSidebarProps> = ({
  isLiked,
  likesCount,
  onLike,
  commentsCount,
  onComment,
  sharesCount,
  onShare,
  isSaved,
  onSave,
  onMoreOptions,
  item,
  onItemPress,
}) => {
  const isProduct = item.type === "product";
  const ItemIcon = isProduct ? ShoppingBag : Briefcase;

  return (
    <View style={styles.container}>
      {/* Product/Service Icon at top - clickable to navigate */}
      <TouchableOpacity style={styles.itemContainer} onPress={onItemPress}>
        <View style={styles.itemImageWrapper}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemIconBadge}>
            <ItemIcon size={10} color={colors.text.inverse} />
          </View>
        </View>
        <Text style={styles.itemLabel} numberOfLines={1}>
          {isProduct ? "Product" : "Service"}
        </Text>
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
        <Heart
          size={32}
          color={colors.text.inverse}
          fill={isLiked ? colors.brand.dhindoraAccent : "none"}
          strokeWidth={isLiked ? 0 : 2}
        />
        <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity style={styles.actionBtn} onPress={onComment}>
        <MessageCircle size={32} color={colors.text.inverse} strokeWidth={2} />
        <Text style={styles.actionCount}>{formatCount(commentsCount)}</Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
        <Send size={32} color={colors.text.inverse} strokeWidth={2} />
        <Text style={styles.actionCount}>{formatCount(sharesCount)}</Text>
      </TouchableOpacity>

      {/* Save/Bookmark Button */}
      <TouchableOpacity style={styles.actionBtn} onPress={onSave}>
        <Bookmark
          size={30}
          color={colors.text.inverse}
          fill={isSaved ? colors.text.inverse : "none"}
          strokeWidth={2}
        />
      </TouchableOpacity>

      {/* More Options */}
      <TouchableOpacity style={styles.actionBtn} onPress={onMoreOptions}>
        <MoreVertical size={28} color={colors.text.inverse} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 12,
    bottom: 90,
    alignItems: "center",
    zIndex: 10,
  },
  itemContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  itemImageWrapper: {
    position: "relative",
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.text.inverse,
  },
  itemIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.dhindoraAccent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.text.inverse,
  },
  itemLabel: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionBtn: {
    alignItems: "center",
    marginBottom: 20,
  },
  actionCount: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default ReelSidebar;
