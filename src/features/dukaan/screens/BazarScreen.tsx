// src/features/dukaan/screens/BazarScreen.tsx

import { useApp } from "@/src/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { STORE_TYPES } from "../../../assets/mockData";
import { radius, spacing } from "../../../theme/colors";
import { StoreCardGrid } from "../components/StoreCardVertical";

export default function BazarScreen() {
  const router = useRouter();
  const { allStores } = useApp();

  // States
  const [selectedType, setSelectedType] = useState("All");
  const [distLimit, setDistLimit] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Lazy Loading States
  const [limit, setLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter Categories for the Modal
  const searchedCategories = useMemo(() => {
    if (!categorySearch) return STORE_TYPES;
    return STORE_TYPES.filter((type) =>
      type.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [categorySearch]);

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

  const selectCategory = (type: string) => {
    setSelectedType(type);
    setCategorySearch("");
    setIsModalVisible(false);
  };

  // Navigate to individual store detail page
  const navigateToStore = (storeId: string) => {
    router.push(`/dukaan/${storeId}`);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
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
      </LinearGradient>

      {/* Filter Bar */}
      <View style={styles.filterHeader}>
        <TouchableOpacity
          style={styles.mainFilterBtn}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="filter-outline" size={18} color="#FFF" />
          <Text style={styles.mainFilterText} numberOfLines={1}>
            {selectedType === "All" ? "All Categories" : selectedType}
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

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {filteredData.length} {filteredData.length === 1 ? "store" : "stores"}{" "}
          found
        </Text>
        {(selectedType !== "All" || distLimit) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedType("All");
              setDistLimit(null);
            }}
          >
            <Text style={styles.clearFilterText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* POP-UP MODAL WITH SEARCH */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                placeholder="Search category (e.g. Pizza, Gym)"
                style={styles.searchInput}
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholderTextColor="#94a3b8"
              />
              {categorySearch !== "" && (
                <TouchableOpacity onPress={() => setCategorySearch("")}>
                  <Ionicons name="close-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Show "All Stores" only if it matches search or search is empty */}
              {(!categorySearch ||
                "all stores".includes(categorySearch.toLowerCase())) && (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedType === "All" && styles.categoryItemSelected,
                  ]}
                  onPress={() => selectCategory("All")}
                >
                  <View style={styles.categoryItemContent}>
                    <Ionicons name="apps-outline" size={20} color="#0f172a" />
                    <Text style={styles.categoryLabel}>All Stores</Text>
                  </View>
                  {selectedType === "All" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#3b82f6"
                    />
                  )}
                </TouchableOpacity>
              )}

              {searchedCategories.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.categoryItem,
                    selectedType === type && styles.categoryItemSelected,
                  ]}
                  onPress={() => selectCategory(type)}
                >
                  <View style={styles.categoryItemContent}>
                    <Ionicons
                      name="storefront-outline"
                      size={20}
                      color="#0f172a"
                    />
                    <Text style={styles.categoryLabel}>{type}</Text>
                  </View>
                  {selectedType === type && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#3b82f6"
                    />
                  )}
                </TouchableOpacity>
              ))}

              {searchedCategories.length === 0 && (
                <Text style={styles.noResultText}>
                  No categories found matching "{categorySearch}"
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              color="#3b82f6"
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
            <Text style={styles.emptyText}>
              No shops found in this category
            </Text>
            <Text style={styles.emptySubText}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
    color: "#cbd5e1",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
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
    backgroundColor: "#FFF",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  mainFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 8,
    flex: 1,
    marginRight: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  mainFilterText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  distRow: { flexDirection: "row", gap: 6 },
  distBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeDistBtn: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  distBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  activeDistBtnText: {
    color: "#3b82f6",
  },
  resultsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#FFF",
  },
  resultsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3b82f6",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "75%",
    paddingTop: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalScroll: { paddingBottom: 40, paddingHorizontal: spacing.md },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryItemSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: "#3b82f6",
  },
  categoryItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
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
    color: "#64748b",
  },
  emptySubText: {
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#0f172a",
  },
  noResultText: {
    textAlign: "center",
    marginTop: 30,
    color: "#94a3b8",
    fontSize: 14,
  },
});
