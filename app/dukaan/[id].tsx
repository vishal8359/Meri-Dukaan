import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Circle,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Share2,
  ShoppingBag,
  Star,
} from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 240;

export default function StoreDetailsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "dhindora">(
    "products",
  );
  const [isExpanded, setIsExpanded] = useState(true); // Toggle State

  const store = {
    name: "Laxmi Organic Store",
    type: "Premium Grocery",
    category: "Groceries & Essentials",
    rating: 4.8,
    distance: "1.2 km",
    address: "Shop No. 42, HSR Sector 2, Bengaluru, KA 560102",
    timing: "9:00 AM - 9:00 PM",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
  };
  // 1. Insta-style Dashboard for Dhindora
  const renderDhindoraGrid = () => (
    <View style={styles.dhindoraGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <TouchableOpacity
          key={i}
          style={styles.reelThumbnail}
          onPress={() => {
            /* Navigate to Full Reel Player */
          }}
        >
          <Image
            source={{ uri: `https://picsum.photos/400/600?sig=${i + 20}` }}
            style={styles.thumbImage}
          />
          <View style={styles.playOverlay}>
            <Play size={18} color="#fff" fill="#fff" />
          </View>
          {/* Mock view count like Insta */}
          <View style={styles.viewCountBadge}>
            <Play size={10} color="#fff" />
            <Text style={styles.viewCountText}>
              {Math.floor(Math.random() * 500)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 2. Clean Commerce Grid for Products
  const renderProductGrid = () => (
    <View style={styles.productGrid}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} style={styles.productCard}>
          <Image
            source={{ uri: `https://picsum.photos/300/300?sig=${item}` }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              Premium Item {item}
            </Text>
            <Text style={styles.productPrice}>₹{item * 45 + 100}</Text>

            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* 1. Hero Header */}
        <View style={styles.header}>
          <Image source={{ uri: store.image }} style={styles.heroImage} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color={colors.text.primary} size={28} />
          </TouchableOpacity>
        </View>

        {/* 2. Interactive Collapsible Info Card */}
        <MotiView
          animate={{ height: isExpanded ? "auto" : 85 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.infoCard}
        >
          {/* Toggle Button */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.8}
          >
            {isExpanded ? (
              <ChevronDown size={24} color={colors.text.secondary} />
            ) : (
              <ChevronUp size={24} color={colors.text.secondary} />
            )}
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <View style={styles.nameRow}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              {!isExpanded && (
                <View style={styles.ratingBoxSmall}>
                  <Star
                    size={12}
                    fill={colors.status.warning}
                    color="transparent"
                  />
                  <Text style={styles.ratingTextSmall}>{store.rating}</Text>
                </View>
              )}
            </View>
            <Text style={styles.storeType}>{store.type}</Text>
          </View>

          {/* This section disappears when collapsed */}
          <AnimatePresence>
            {isExpanded && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: store.isOpen ? "#ECFDF5" : "#FEF2F2" },
                    ]}
                  >
                    <Circle
                      size={8}
                      fill={
                        store.isOpen
                          ? colors.status.success
                          : colors.status.error
                      }
                      color="transparent"
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: store.isOpen
                            ? colors.status.success
                            : colors.status.error,
                        },
                      ]}
                    >
                      {store.isOpen ? "Open Now" : "Closed"}
                    </Text>
                  </View>
                  <Text style={styles.distanceText}>{store.distance} away</Text>
                </View>

                <View style={styles.addressBox}>
                  <MapPin size={14} color={colors.text.secondary} />
                  <Text style={styles.addressText}>{store.address}</Text>
                </View>

                <View style={styles.divider} />

                {/* Actions Grid */}
                <View style={styles.actionGrid}>
                  <ActionButton
                    icon={Phone}
                    label="Call"
                    color={colors.status.success}
                  />
                  <ActionButton
                    icon={MessageCircle}
                    label="Chat"
                    color={colors.brand.primary}
                  />
                  <ActionButton
                    icon={MapPin}
                    label="Route"
                    color={colors.brand.primaryLight}
                  />
                  <ActionButton
                    icon={Share2}
                    label="Share"
                    color={colors.brand.accent}
                  />
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </MotiView>

        {/* 3. Section Toggles (Stays accessible) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "products" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("products")}
          >
            <LayoutGrid
              size={20}
              color={
                activeTab === "products"
                  ? colors.brand.primaryLight
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "products" && styles.activeTabLabel,
              ]}
            >
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "dhindora" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("dhindora")}
          >
            <Play
              size={20}
              color={
                activeTab === "dhindora"
                  ? colors.brand.primaryLight
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "dhindora" && styles.activeTabLabel,
              ]}
            >
              Dhindora
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Scrollable Content */}
        <View style={styles.contentArea}>
          {activeTab === "products"
            ? renderProductGrid()
            : renderDhindoraGrid()}
        </View>
      </ScrollView>

      {/* 5. Floating Action Bar */}
      <View style={styles.floatingCart}>
        <TouchableOpacity style={styles.cartMain}>
          <ShoppingBag size={20} color="#fff" />
          <Text style={styles.cartText}>View Dukaan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ActionButton = ({ icon: Icon, label, color }: any) => (
  <TouchableOpacity style={styles.actionButton}>
    <View style={[styles.actionIcon, { backgroundColor: color + "12" }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  header: { height: HEADER_HEIGHT, width: "100%" },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.small,
  },
  infoCard: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.medium,
    overflow: "hidden",
  },
  toggleBtn: {
    alignSelf: "center",
    width: 40,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: { marginBottom: spacing.md },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    flex: 1,
  },
  storeType: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  ratingBoxSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingTextSmall: { fontSize: 12, fontWeight: "700", color: "#B08900" },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  addressBox: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
    marginTop: 8,
  },
  addressText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  distanceText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.md,
  },
  actionGrid: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: { alignItems: "center", gap: 6 },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { fontSize: 11, fontWeight: "700", color: colors.text.primary },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.brand.primaryLight,
  },
  tabLabel: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  activeTabLabel: { color: colors.brand.primaryLight },
  contentArea: { padding: spacing.md },
  floatingCart: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  cartMain: {
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: radius.full,
    gap: 12,
    ...shadows.medium,
  },
  cartText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  // --- Dhindora Dashboard Styles ---
  dhindoraGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2, // Tight gap like Instagram
    paddingBottom: 100,
  },
  reelThumbnail: {
    width: (width - spacing.md * 2 - 4) / 3, // Perfect 3-column grid
    height: (width / 3) * 1.5,
    backgroundColor: colors.brand.secondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%", opacity: 0.9 },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  viewCountBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewCountText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  // --- Product Grid Styles ---
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 120,
  },
  productCard: {
    width: (width - spacing.md * 3) / 2,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadows.small,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: colors.ui.background,
  },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand.primaryLight,
    marginBottom: 10,
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: colors.brand.primaryLight,
    borderRadius: radius.sm,
    paddingVertical: 6,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.brand.primaryLight,
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
});
