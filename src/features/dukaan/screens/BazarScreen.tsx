// src/features/dukaan/screens/BazarScreen.tsx

import { useApp } from "@/src/context/AppContext";
import { useSettings } from "@/src/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors, radius, spacing } from "../../../theme/colors";
import { CategoryPickerModal } from "../components/CategoryPickerModal";
import { StoreCardGrid } from "../components/StoreCardVertical";

export default function BazarScreen() {
  const router = useRouter();
  const { allStores } = useApp();
  const { t } = useSettings();

  // States
  const [selectedType, setSelectedType] = useState("All");
  const [distLimit, setDistLimit] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lazy Loading States
  const [limit, setLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter Store Logic
  const filteredData = useMemo(() => {
    return allStores.filter((store) => {
      const matchType = selectedType === "All" || store.type === selectedType;
      const storeDist = parseFloat(store.distance);
      const matchDist = distLimit ? storeDist <= distLimit : true;
      return matchType && matchDist;
    });
  }, [selectedType, distLimit, allStores]);

  const displayData = useMemo(
    () => filteredData.slice(0, limit),
    [filteredData, limit],
  );

  useEffect(() => {
    setLimit(10);
  }, [selectedType, distLimit]);

  const handleLoadMore = () => {
    if (limit < filteredData.length && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setLimit((prev) => prev + 10);
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const selectCategory = useCallback((type: string) => {
    setSelectedType(type);
    setIsModalVisible(false);
  }, []);

  // Navigate to individual store detail page
  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}`);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      {/* <LinearGradient
        colors={["#0f172a", "#143e47"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Explore</Text>
            <Text style={styles.headerTitle}>Nearby Stores</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="storefront-outline" size={24} color="#FFF" />
          </View>
        </View>
      </LinearGradient> */}

      {/* Filter Bar */}
      <View style={styles.filterHeader}>
        <TouchableOpacity
          style={styles.mainFilterBtn}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="filter-outline" size={18} color="#FFF" />
          <Text style={styles.mainFilterText} numberOfLines={1}>
            {selectedType === "All" ? t("bazar.allCategories") : selectedType}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.distRow}>
          {[0.5, 1, 3].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDistLimit(distLimit === d ? null : d)}
              style={[styles.distBtn, distLimit === d && styles.activeDistBtn]}
            >
              <Text
                style={[
                  styles.distBtnText,
                  distLimit === d && styles.activeDistBtnText,
                ]}
              >
                {d < 1 ? "500m" : d + "km"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Filter Chip */}
      {(selectedType !== "All" || distLimit) && (
        <View style={styles.activeFilterBar}>
          <TouchableOpacity
            style={styles.clearFilterChip}
            onPress={() => {
              setSelectedType("All");
              setDistLimit(null);
            }}
          >
            <Ionicons
              name="close-circle"
              size={14}
              color={colors.brand.primaryLight}
            />
            <Text style={styles.clearFilterText}>
              {t("bazar.clearFilters")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Picker Modal */}
      <CategoryPickerModal
        visible={isModalVisible}
        selectedType={selectedType}
        onSelectCategory={selectCategory}
        onClose={() => setIsModalVisible(false)}
        t={t}
      />

      {/* STORE GRID */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <StoreCardGrid
            store={item}
            onPress={() => navigateToStore(item.id)}
          />
        )}
        contentContainerStyle={styles.listPadding}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.brand.primaryLight}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color="#cbd5e1"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyText}>{t("bazar.noShops")}</Text>
            <Text style={styles.emptySubText}>{t("bazar.adjustFilters")}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  gradientHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerGreeting: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ui.disabled,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text.inverse,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.ui.surface,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  mainFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 8,
    flex: 1,
    marginRight: 10,
    shadowColor: colors.brand.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  mainFilterText: {
    color: colors.text.inverse,
    fontWeight: "700",
    fontSize: 13,
  },
  distRow: { flexDirection: "row", gap: 6 },
  distBtn: {
    backgroundColor: colors.ui.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  activeDistBtn: {
    backgroundColor: colors.status.infoLight,
    borderColor: colors.brand.primaryLight,
  },
  distBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  activeDistBtnText: {
    color: colors.brand.primaryLight,
  },
  activeFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.surface,
  },
  clearFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.tint.blueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.primaryLight,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand.primaryLight,
  },

  // List Styles
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listPadding: { paddingTop: spacing.sm, paddingBottom: 100 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  emptySubText: {
    textAlign: "center",
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 4,
  },
});
