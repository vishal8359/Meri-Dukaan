// app/meri_dukaan/my-dukaan.tsx
import {
    MyStore,
    MyStoreProduct,
    MyStoreReel,
    MyStoreService,
    useApp,
} from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Eye,
    Film,
    Heart,
    MessageCircle,
    Package,
    Plus,
    Settings,
    Star,
    Store,
    Trash2,
    Upload,
    Wrench,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

type DashboardTab = "products" | "services" | "reels";

// ========== NO STORE STATE ==========
function NoStoreView({ onCreateStore }: { onCreateStore: () => void }) {
  return (
    <View style={styles.noStoreWrap}>
      <View style={styles.noStoreIcon}>
        <Store size={48} color={colors.brand.primary} />
      </View>
      <Text style={styles.noStoreTitle}>You don't have a store yet</Text>
      <Text style={styles.noStoreSubtitle}>
        Create your dukaan and start selling your products & services to the
        community
      </Text>
      <TouchableOpacity style={styles.createStoreBtn} onPress={onCreateStore}>
        <Plus size={18} color={colors.text.inverse} />
        <Text style={styles.createStoreBtnText}>Create Your Dukaan</Text>
      </TouchableOpacity>
    </View>
  );
}

// ========== STORE PROFILE HEADER ==========
function StoreHeader({ store }: { store: MyStore }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.profileCard}>
      {/* Images carousel */}
      {store.images.length > 0 && (
        <View>
          <FlatList
            data={store.images}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH,
              offset: CARD_WIDTH * index,
              index,
            })}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.coverImage} />
            )}
          />
          {store.images.length > 1 && (
            <View style={styles.dotsRow}>
              {store.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}
      <View style={styles.profileInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeCategory}>
          {store.category} •{" "}
          {store.businessType === "both"
            ? "Products & Services"
            : store.businessType === "products"
              ? "Products"
              : "Services"}
        </Text>
        <Text style={styles.storeLocation}>📍 {store.location}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Star
              size={13}
              color={colors.brand.star}
              fill={colors.brand.star}
            />
            <Text style={styles.statText}>{store.rating.toFixed(1)}</Text>
          </View>
          <View
            style={[
              styles.statBadge,
              { backgroundColor: colors.tint.blueLight },
            ]}
          >
            <Ionicons name="people" size={13} color={colors.status.info} />
            <Text style={[styles.statText, { color: colors.status.info }]}>
              {store.followers.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statBadge,
              { backgroundColor: colors.tint.greenLight },
            ]}
          >
            <Package size={13} color={colors.status.success} />
            <Text style={[styles.statText, { color: colors.status.success }]}>
              {store.products.length} items
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ========== TAB BAR ==========
function TabBar({
  activeTab,
  onTabChange,
  businessType,
  reelCount,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  businessType: MyStore["businessType"];
  reelCount: number;
}) {
  const tabs: { key: DashboardTab; label: string; icon: any; show: boolean }[] =
    [
      {
        key: "products",
        label: "Products",
        icon: Package,
        show: businessType === "products" || businessType === "both",
      },
      {
        key: "services",
        label: "Services",
        icon: Wrench,
        show: businessType === "services" || businessType === "both",
      },
      {
        key: "reels",
        label: `Reels (${reelCount})`,
        icon: Film,
        show: true,
      },
    ];

  return (
    <View style={styles.tabBar}>
      {tabs
        .filter((t) => t.show)
        .map((tab) => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
            >
              <Icon
                size={16}
                color={active ? colors.brand.primary : colors.text.tertiary}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

// ========== PRODUCTS TAB ==========
function ProductsTab({
  products,
  onToggleStock,
  onRemove,
  onAdd,
}: {
  products: MyStoreProduct[];
  onToggleStock: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <View>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>
          {products.length} Product{products.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity style={styles.addItemBtn} onPress={onAdd}>
          <Plus size={14} color={colors.text.inverse} />
          <Text style={styles.addItemBtnText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyTab}>
          <Package size={32} color={colors.ui.muted} />
          <Text style={styles.emptyText}>No products yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first product to start selling
          </Text>
        </View>
      ) : (
        products.map((p) => (
          <View key={p.id} style={styles.itemCard}>
            <Image source={{ uri: p.images[0] }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{p.name}</Text>
              <Text style={styles.itemPrice}>
                ₹{p.price}/{p.unit}
              </Text>
              <Text style={styles.itemMeta}>
                Stock: {p.quantity} {p.unit}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <View style={styles.stockToggle}>
                <Text
                  style={[
                    styles.stockLabel,
                    {
                      color: p.inStock
                        ? colors.status.success
                        : colors.text.light,
                    },
                  ]}
                >
                  {p.inStock ? "In Stock" : "Out"}
                </Text>
                <Switch
                  trackColor={{
                    false: colors.ui.border,
                    true: colors.brand.primaryLight,
                  }}
                  thumbColor={
                    p.inStock ? colors.brand.primary : colors.ui.surfaceHover
                  }
                  onValueChange={() => onToggleStock(p.id)}
                  value={p.inStock}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(p.id)}
              >
                <Trash2 size={15} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

// ========== SERVICES TAB ==========
function ServicesTab({
  services,
  onToggleAvailable,
  onRemove,
  onAdd,
}: {
  services: MyStoreService[];
  onToggleAvailable: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <View>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>
          {services.length} Service{services.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity style={styles.addItemBtn} onPress={onAdd}>
          <Plus size={14} color={colors.text.inverse} />
          <Text style={styles.addItemBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyTab}>
          <Wrench size={32} color={colors.ui.muted} />
          <Text style={styles.emptyText}>No services yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first service to get bookings
          </Text>
        </View>
      ) : (
        services.map((s) => (
          <View key={s.id} style={styles.itemCard}>
            <Image source={{ uri: s.images[0] }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{s.name}</Text>
              <Text style={styles.itemPrice}>₹{s.price}</Text>
              <Text style={styles.itemMeta}>⏱ {s.duration}</Text>
            </View>
            <View style={styles.itemActions}>
              <View style={styles.stockToggle}>
                <Text
                  style={[
                    styles.stockLabel,
                    {
                      color: s.available
                        ? colors.status.success
                        : colors.text.light,
                    },
                  ]}
                >
                  {s.available ? "Available" : "Off"}
                </Text>
                <Switch
                  trackColor={{
                    false: colors.ui.border,
                    true: colors.brand.primaryLight,
                  }}
                  thumbColor={
                    s.available ? colors.brand.primary : colors.ui.surfaceHover
                  }
                  onValueChange={() => onToggleAvailable(s.id)}
                  value={s.available}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(s.id)}
              >
                <Trash2 size={15} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

// ========== REELS TAB ==========
function ReelsTab({
  reels,
  onUpload,
  onRemove,
  canUpload,
}: {
  reels: MyStoreReel[];
  onUpload: () => void;
  onRemove: (id: string) => void;
  canUpload: boolean;
}) {
  // Engagement totals
  const totalViews = reels.reduce((s, r) => s + r.views, 0);
  const totalLikes = reels.reduce((s, r) => s + r.likes, 0);
  const totalComments = reels.reduce((s, r) => s + r.comments, 0);

  return (
    <View>
      {/* Upload button + daily limit */}
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>
          {reels.length} Reel{reels.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity
          style={[styles.addItemBtn, !canUpload && { opacity: 0.5 }]}
          onPress={onUpload}
          disabled={!canUpload}
        >
          <Upload size={14} color={colors.text.inverse} />
          <Text style={styles.addItemBtnText}>
            {canUpload ? "Upload Reel" : "Done for Today"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Engagement Summary */}
      {reels.length > 0 && (
        <View style={styles.engagementCard}>
          <Text style={styles.engagementTitle}>Total Engagement</Text>
          <View style={styles.engagementRow}>
            <View style={styles.engagementStat}>
              <Eye size={16} color={colors.brand.primary} />
              <Text style={styles.engagementNum}>
                {totalViews.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Views</Text>
            </View>
            <View style={styles.engagementStat}>
              <Heart size={16} color={colors.status.error} />
              <Text style={styles.engagementNum}>
                {totalLikes.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Likes</Text>
            </View>
            <View style={styles.engagementStat}>
              <MessageCircle size={16} color={colors.status.info} />
              <Text style={styles.engagementNum}>
                {totalComments.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Comments</Text>
            </View>
          </View>
        </View>
      )}

      {reels.length === 0 ? (
        <View style={styles.emptyTab}>
          <Film size={32} color={colors.ui.muted} />
          <Text style={styles.emptyText}>No reels yet</Text>
          <Text style={styles.emptySubtext}>
            Upload your first reel to boost engagement
          </Text>
        </View>
      ) : (
        <View style={styles.reelGrid}>
          {reels.map((r) => (
            <View key={r.id} style={styles.reelCard}>
              {/* Reel thumbnail or placeholder */}
              <View style={styles.reelThumb}>
                {r.thumbnail ? (
                  <Image
                    source={{ uri: r.thumbnail }}
                    style={styles.reelThumbImg}
                  />
                ) : (
                  <View style={styles.reelThumbPlaceholder}>
                    <Film size={24} color={colors.ui.muted} />
                  </View>
                )}
                {/* Remove button */}
                <TouchableOpacity
                  style={styles.reelRemoveBtn}
                  onPress={() => onRemove(r.id)}
                >
                  <Trash2 size={10} color="#fff" />
                </TouchableOpacity>
              </View>
              {/* Caption */}
              <Text style={styles.reelCaption} numberOfLines={2}>
                {r.caption || "No caption"}
              </Text>
              {/* Per-reel stats */}
              <View style={styles.reelStats}>
                <View style={styles.miniStat}>
                  <Eye size={10} color={colors.text.tertiary} />
                  <Text style={styles.miniStatNum}>{r.views}</Text>
                </View>
                <View style={styles.miniStat}>
                  <Heart size={10} color={colors.text.tertiary} />
                  <Text style={styles.miniStatNum}>{r.likes}</Text>
                </View>
                <View style={styles.miniStat}>
                  <MessageCircle size={10} color={colors.text.tertiary} />
                  <Text style={styles.miniStatNum}>{r.comments}</Text>
                </View>
              </View>
              {/* Date */}
              <Text style={styles.reelDate}>
                {new Date(r.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ========== MAIN DASHBOARD ==========
export default function MyDukaanScreen() {
  const router = useRouter();
  const {
    myStore,
    updateMyProduct,
    removeMyProduct,
    updateMyService,
    removeMyService,
    removeMyReel,
    canUploadReelToday,
  } = useApp();

  const defaultTab: DashboardTab =
    myStore?.businessType === "services" ? "services" : "products";
  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab);

  // Product stock toggle
  const handleToggleStock = (id: string) => {
    const prod = myStore?.products.find((p) => p.id === id);
    if (prod) updateMyProduct(id, { inStock: !prod.inStock });
  };

  // Remove product
  const handleRemoveProduct = (id: string) => {
    Alert.alert("Remove Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMyProduct(id),
      },
    ]);
  };

  // Service available toggle
  const handleToggleAvailable = (id: string) => {
    const svc = myStore?.services.find((s) => s.id === id);
    if (svc) updateMyService(id, { available: !svc.available });
  };

  // Remove service
  const handleRemoveService = (id: string) => {
    Alert.alert("Remove Service", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMyService(id),
      },
    ]);
  };

  // Remove reel
  const handleRemoveReel = (id: string) => {
    Alert.alert("Remove Reel", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeMyReel(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.ui.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dukaan</Text>
        {myStore ? (
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/meri_dukaan/create-store" as any)}
          >
            <Settings size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Main Content */}
      {!myStore ? (
        <NoStoreView
          onCreateStore={() => router.push("/meri_dukaan/create-store" as any)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Store Profile */}
          <StoreHeader store={myStore} />

          {/* Tab Bar */}
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            businessType={myStore.businessType}
            reelCount={myStore.reels.length}
          />

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "products" && (
              <ProductsTab
                products={myStore.products}
                onToggleStock={handleToggleStock}
                onRemove={handleRemoveProduct}
                onAdd={() => router.push("/meri_dukaan/add-product" as any)}
              />
            )}
            {activeTab === "services" && (
              <ServicesTab
                services={myStore.services}
                onToggleAvailable={handleToggleAvailable}
                onRemove={handleRemoveService}
                onAdd={() => router.push("/meri_dukaan/add-service" as any)}
              />
            )}
            {activeTab === "reels" && (
              <ReelsTab
                reels={myStore.reels}
                onUpload={() => router.push("/meri_dukaan/upload-reel" as any)}
                onRemove={handleRemoveReel}
                canUpload={canUploadReelToday()}
              />
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ========== STYLES ==========
const REEL_CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    ...shadows.small,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  settingsBtn: { padding: 8 },

  scroll: { padding: spacing.md },

  /* No Store */
  noStoreWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  noStoreIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand.primary + "0F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  noStoreTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  noStoreSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  createStoreBtn: {
    flexDirection: "row",
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.lg,
    alignItems: "center",
    gap: 8,
    ...shadows.medium,
  },
  createStoreBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.small,
  },
  coverImage: {
    width: CARD_WIDTH,
    height: 160,
    backgroundColor: colors.ui.backgroundAlt,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  profileInfo: { padding: spacing.md },
  storeName: { fontSize: 20, fontWeight: "800", color: colors.text.primary },
  storeCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  storeLocation: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  statsRow: { flexDirection: "row", gap: 10, marginTop: spacing.sm },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.warningDark,
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 5,
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.brand.primary + "10" },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.text.tertiary },
  tabTextActive: { color: colors.brand.primary },

  /* Tab Content */
  tabContent: { minHeight: 200 },

  /* Tab Header */
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  tabHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    gap: 5,
  },
  addItemBtnText: {
    color: colors.text.inverse,
    fontWeight: "600",
    fontSize: 12,
  },

  /* Empty state */
  emptyTab: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: "700", color: colors.text.secondary },
  emptySubtext: { fontSize: 13, color: colors.text.tertiary },

  /* Product / Service Card */
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginBottom: 10,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.ui.backgroundAlt,
  },
  itemInfo: { flex: 1, paddingHorizontal: 10 },
  itemName: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
    marginTop: 1,
  },
  itemMeta: { fontSize: 11, color: colors.text.tertiary, marginTop: 1 },
  itemActions: { alignItems: "flex-end", gap: 6 },
  stockToggle: { alignItems: "flex-end" },
  stockLabel: { fontSize: 10, fontWeight: "600", marginBottom: 1 },
  removeBtn: {
    padding: 6,
    backgroundColor: colors.status.errorBorder,
    borderRadius: radius.sm,
  },

  /* Engagement Card */
  engagementCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  engagementTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  engagementRow: { flexDirection: "row", justifyContent: "space-around" },
  engagementStat: { alignItems: "center", gap: 4 },
  engagementNum: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  engagementLabel: { fontSize: 11, color: colors.text.tertiary },

  /* Reel Grid */
  reelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  reelCard: {
    width: REEL_CARD_WIDTH,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  reelThumb: { position: "relative" },
  reelThumbImg: { width: "100%", height: 140 },
  reelThumbPlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: colors.ui.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  reelRemoveBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  reelCaption: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  reelStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 3 },
  miniStatNum: { fontSize: 10, color: colors.text.tertiary, fontWeight: "600" },
  reelDate: {
    fontSize: 10,
    color: colors.text.light,
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 8,
  },
});
