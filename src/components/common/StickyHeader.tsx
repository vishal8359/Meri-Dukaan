// src/components/common/StickyHeader.tsx
import { useApp } from "@/src/context/AppContext";
import { SearchResult, useDebounceSearch } from "@/src/hooks/useDebounceSearch";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import {
  Bell,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadows, spacing } from "../../theme/colors";

export const StickyHeader = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart } = useApp();

  const {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
    defaultSuggestions,
  } = useDebounceSearch(300);
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Cart badge count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Open the full-screen search modal
  const openSearch = useCallback(() => {
    setSearchActive(true);
    // Auto-focus after modal opens
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  // Close search modal
  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    clearSearch();
    setSearchActive(false);
  }, [clearSearch]);

  const handleSearchResultPress = useCallback(
    (result: SearchResult) => {
      closeSearch();
      if (result.type === "store") {
        router.push(`/dukaan/${result.id}` as any);
      } else if (result.category) {
        router.push({
          pathname: "/category/[id]",
          params: { id: result.category },
        } as any);
      } else {
        router.push({
          pathname: "/product/[id]",
          params: { id: result.id },
        } as any);
      }
    },
    [closeSearch, router],
  );

  return (
    <>
      <View style={[styles.container, { paddingTop: (insets.top || 10) + 12 }]}>
        {/* Row 1 — Logo + Actions */}
        <View style={styles.topRow}>
          {/* Logo */}
          <Image
            source={require("../../assets/mybusz_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Right Actions */}
          <View style={styles.actionsRow}>
            {/* Notification */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/notification/notifications" as any)}
            >
              <Bell size={22} color="#fff" />
              <View style={styles.notifDot} />
            </TouchableOpacity>

            {/* Cart */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/cart/cart" as any)}
            >
              <ShoppingCart size={22} color="#fff" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Menu */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Menu size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2 — Search Bar (tap to open modal) */}
        <Pressable style={styles.searchBarTrigger} onPress={openSearch}>
          <Search size={17} color="#94a3b8" />
          <Text style={styles.searchPlaceholder}>
            Search products, stores, services...
          </Text>
        </Pressable>
      </View>

      {/* ═══ Full-screen Search Modal ═══ */}
      <Modal
        visible={searchActive}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top || 10 }]}>
          {/* Modal Header — Search input */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalBackBtn} onPress={closeSearch}>
              <X size={22} color="#0f172a" />
            </TouchableOpacity>
            <View style={styles.modalSearchBar}>
              <Search size={18} color={colors.brand.primary} />
              <TextInput
                ref={searchInputRef}
                style={styles.modalSearchInput}
                placeholder="Search products, stores..."
                placeholderTextColor="#94a3b8"
                value={query}
                onChangeText={setQuery}
                autoFocus
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    clearSearch();
                    searchInputRef.current?.focus();
                  }}
                >
                  <X size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
              {isSearching && (
                <View style={styles.searchingIndicator}>
                  <View style={styles.searchingDot} />
                </View>
              )}
            </View>
          </View>

          {/* Search Results */}
          <ScrollView
            style={styles.resultsContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Suggestions Header */}
            {query.length > 0 && results.length > 0 && (
              <Text style={styles.resultsHeader}>
                Showing results for "{query}"
              </Text>
            )}

            {/* No Results */}
            {query.length > 0 && !isSearching && results.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different keyword or category
                </Text>
              </View>
            )}

            {/* Result Cards — Flipkart-style */}
            {results.map((item, index) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={[
                  styles.resultCard,
                  index === results.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleSearchResultPress(item)}
                activeOpacity={0.6}
              >
                {/* Product / Store Image */}
                <View style={styles.resultImageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.resultImage}
                  />
                  {/* Type icon overlay */}
                  <View
                    style={[
                      styles.typeIconOverlay,
                      {
                        backgroundColor:
                          item.type === "store" ? "#3b82f6" : "#10b981",
                      },
                    ]}
                  >
                    {item.type === "store" ? (
                      <MapPin size={8} color="#fff" />
                    ) : (
                      <ShoppingCart size={8} color="#fff" />
                    )}
                  </View>
                </View>

                {/* Info */}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>

                {/* Badge */}
                <View
                  style={[
                    styles.resultBadge,
                    {
                      backgroundColor:
                        item.type === "store" ? "#eff6ff" : "#f0fdf4",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultBadgeText,
                      {
                        color: item.type === "store" ? "#2563eb" : "#16a34a",
                      },
                    ]}
                  >
                    {item.type === "store" ? "Store" : "Product"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Default suggestions — before typing */}
            {query.length === 0 && (
              <>
                <Text style={styles.suggestionsHeader}>Popular near you</Text>
                {defaultSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`default-${item.type}-${item.id}`}
                    style={[
                      styles.resultCard,
                      index === defaultSuggestions.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                    onPress={() => handleSearchResultPress(item)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.resultImageWrapper}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.resultImage}
                      />
                      <View
                        style={[
                          styles.typeIconOverlay,
                          {
                            backgroundColor:
                              item.type === "store" ? "#3b82f6" : "#10b981",
                          },
                        ]}
                      >
                        {item.type === "store" ? (
                          <MapPin size={8} color="#fff" />
                        ) : (
                          <ShoppingCart size={8} color="#fff" />
                        )}
                      </View>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.resultSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.resultBadge,
                        {
                          backgroundColor:
                            item.type === "store" ? "#eff6ff" : "#f0fdf4",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.resultBadgeText,
                          {
                            color:
                              item.type === "store" ? "#2563eb" : "#16a34a",
                          },
                        ]}
                      >
                        {item.type === "store" ? "Store" : "Product"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  /* ═══ HEADER CONTAINER ═══ */
  container: {
    backgroundColor: colors.brand.primary,
    paddingBottom: 12,
    ...shadows.medium,
  },

  /* ── Row 1: Logo + Actions ───────────────── */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 36,
    marginLeft: -30,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  cartBadge: {
    position: "absolute",
    top: 1,
    right: 1,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  cartBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#fff",
  },

  /* ── Row 2: Search Trigger ───────────────── */
  searchBarTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: spacing.md,
    paddingHorizontal: 14,
    height: 42,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },

  /* ═══ SEARCH MODAL ═══ */
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSearchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.brand.primary + "30",
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
    paddingVertical: 0,
  },
  searchingIndicator: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
    opacity: 0.6,
  },

  /* ── Results ─────────────────────────────── */
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  /* ── Result Card ─────────────────────────── */
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  resultImageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
    marginRight: 12,
    position: "relative",
  },
  resultImage: {
    width: 52,
    height: 52,
  },
  typeIconOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  resultInfo: {
    flex: 1,
    marginRight: 8,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 3,
  },
  resultSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  /* ── Empty / Suggestions ──────────────────── */
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  suggestionsHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
