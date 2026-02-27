// src/features/dukaan/components/StoreReelsGrid.tsx
import { EnhancedReel } from "@/src/assets/mockData";
import { Eye, Play } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SPACING = 2;
const NUM_COLUMNS = 3;
const ITEM_WIDTH =
  (SCREEN_WIDTH - GRID_SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

interface StoreReelsGridProps {
  reels: EnhancedReel[];
  onReelPress: (reel: EnhancedReel, index: number) => void;
  isLoading?: boolean;
  onEndReached?: () => void;
  ListHeaderComponent?: React.ReactElement;
}

interface ReelThumbnailProps {
  reel: EnhancedReel;
  index: number;
  onPress: () => void;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
};

const ReelThumbnail: React.FC<ReelThumbnailProps> = React.memo(
  ({ reel, index, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Thumbnail Image - Using item image as poster */}
        <Image
          source={{ uri: reel.item.image }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Dark Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Play Icon */}
        <View style={styles.playIconContainer}>
          <Play size={24} color="#fff" fill="#fff" />
        </View>

        {/* Views Count */}
        <View style={styles.viewsContainer}>
          <Eye size={12} color="#fff" />
          <Text style={styles.viewsText}>{formatCount(reel.likesCount)}</Text>
        </View>

        {/* Product/Service Badge */}
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>
            {reel.item.type === "product" ? "🛍️" : "🛠️"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

export const StoreReelsGrid: React.FC<StoreReelsGridProps> = ({
  reels,
  onReelPress,
  isLoading = false,
  onEndReached,
  ListHeaderComponent,
}) => {
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT + GRID_SPACING,
      offset: (ITEM_HEIGHT + GRID_SPACING) * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: EnhancedReel; index: number }) => (
      <ReelThumbnail
        reel={item}
        index={index}
        onPress={() => onReelPress(item, index)}
      />
    ),
    [onReelPress],
  );

  const keyExtractor = useCallback((item: EnhancedReel) => item._id, []);

  const ListFooterComponent = useMemo(
    () =>
      isLoading ? (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : null,
    [isLoading],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎬</Text>
        <Text style={styles.emptyTitle}>No Reels Yet</Text>
        <Text style={styles.emptySubtitle}>
          This store hasn't uploaded any reels
        </Text>
      </View>
    ),
    [],
  );

  return (
    <FlatList
      data={reels}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={9}
      updateCellsBatchingPeriod={50}
      initialNumToRender={12}
      windowSize={5}
      getItemLayout={getItemLayout}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: GRID_SPACING / 2,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "flex-start",
    gap: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  thumbnailContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  playIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    opacity: 0.9,
  },
  viewsContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  itemBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  itemBadgeText: {
    fontSize: 12,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});

export default StoreReelsGrid;
