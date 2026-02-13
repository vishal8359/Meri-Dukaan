import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Fixed: Using react-native-safe-area-context instead of react-native
import { useApp } from "@/src/context/AppContext";
import { ProductsSection } from "@/src/features/dukaan/components/ProductsSection";
import { ServicesSection } from "@/src/features/dukaan/components/ServiceSection";
import { colors, radius } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, MapPin, Phone, Search, Share2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getStoreById } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const store = getStoreById(id as string);

  // Mock data preserved
  const products = [
    {
      id: "1",
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: 40,
      displayPrice: "₹40/kg",
      stock: "50 kg",
      image:
        "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=300",
      status: "active" as const,
    },
    {
      id: "2",
      name: "Onions",
      category: "Vegetables",
      price: 30,
      displayPrice: "₹30/kg",
      stock: "80 kg",
      image:
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=300",
      status: "active" as const,
    },
    {
      id: "3",
      name: "Green Chilies",
      category: "Vegetables",
      price: 60,
      displayPrice: "₹60/kg",
      stock: "0 kg",
      image:
        "https://images.unsplash.com/photo-1583846499862-bf1c00b4c7ed?q=80&w=300",
      status: "out-of-stock" as const,
    },
  ];

  const services = [
    {
      id: "1",
      name: "Home Delivery",
      description: "Free over ₹500",
      active: true,
      price: 0,
    },
    {
      id: "2",
      name: "Same Day Delivery",
      description: "Order before 5 PM",
      active: true,
      price: 50,
    },
    {
      id: "3",
      name: "Bulk Orders",
      description: "Special pricing for bulk",
      active: false,
      price: 0,
    },
  ];

  const handleBookService = (service: any) => {
    console.log("Booking service:", service.name);
  };

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#94a3b8" />
          <Text style={styles.errorText}>Store not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // This renders everything ABOVE the product/service list
  const renderHeader = () => (
    <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
      {/* Store Header Card */}
      <View style={styles.card}>
        <View style={styles.storeHeaderRow}>
          <View style={styles.storeImageContainer}>
            <Image
              source={
                typeof store.image === "string"
                  ? { uri: store.image }
                  : store.image
              }
              style={styles.storeImage}
              resizeMode="cover"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{store.name}</Text>
            <View style={styles.typeBadgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{store.type}</Text>
              </View>
              <View style={styles.followersBadge}>
                <Ionicons name="heart" size={11} color="#fff" />
                <Text style={styles.followersCount}>{store.followers}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.infoText}>{store.distance}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="star" size={14} color="#E9C46A" />
              <Text style={styles.infoText}>{store.rating} rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.outlineBtnSmall}>
            <Heart size={14} color="#ef4444" />
            <Text style={styles.btnTextSmall}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtnSmall}>
            <Share2 size={14} color="#333" />
            <Text style={styles.btnTextSmall}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtnSmall}>
            <Phone size={14} color="#22c55e" />
            <Text style={styles.btnTextSmall}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "products" && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab("products");
            setSearchQuery("");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "services" && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab("services");
            setSearchQuery("");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "services" && styles.activeTabText,
            ]}
          >
            Services
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Sticky Search Bar - Only show when on products tab */}
      {activeTab === "products" && (
        <Animated.View
          style={[
            styles.stickySearch,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, Dimensions.get("window").height],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          <View style={styles.searchContainer}>
            <Search size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="Search products..."
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>
      )}

      {/* The Main Content: Using a FlatList as the main container. */}
      <FlatList
        data={[1]} // Dummy data to allow the list to render
        renderItem={() => (
          <View style={styles.tabContent}>
            {activeTab === "products" ? (
              <ProductsSection
                storeId={id as string}
                products={products}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            ) : (
              <ServicesSection
                services={services}
                onBookService={handleBookService}
              />
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={() => "main-content"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#fce7f3",
  },
  storeHeaderRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  storeImageContainer: {
    height: 100,
    width: 100,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  storeImage: {
    width: "100%",
    height: "100%",
  },
  typeBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  followersBadge: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followersCount: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  storeName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  outlineBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  btnTextSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.brand.primaryLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.brand.primaryLight,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "700",
    fontSize: 15,
  },
  tabContent: {
    minHeight: 400,
    marginBottom: 20,
  },
  stickySearch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
});
