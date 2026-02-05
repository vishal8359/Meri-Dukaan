// app/dukaan/[id].tsx
import { useApp } from "@/src/context/AppContext";
import { colors, radius } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Heart,
  MapPin,
  Phone,
  Plus,
  Search,
  Share2,
  Store as StoreIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getStoreById, addToCart } = useApp();

  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );

  // Get the store from context using the ID
  const store = getStoreById(id as string);

  // Mock products and services (in real app, these would come from the store data)
  const products = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: 40,
      displayPrice: "₹40/kg",
      stock: "50 kg",
      image: "🍅",
      status: "active",
    },
    {
      id: 2,
      name: "Onions",
      category: "Vegetables",
      price: 30,
      displayPrice: "₹30/kg",
      stock: "80 kg",
      image: "🧅",
      status: "active",
    },
    {
      id: 3,
      name: "Green Chilies",
      category: "Vegetables",
      price: 60,
      displayPrice: "₹60/kg",
      stock: "0 kg",
      image: "🌶️",
      status: "out-of-stock",
    },
    {
      id: 4,
      name: "Potatoes",
      category: "Vegetables",
      price: 25,
      displayPrice: "₹25/kg",
      stock: "120 kg",
      image: "🥔",
      status: "active",
    },
  ];

  const services = [
    {
      id: 1,
      name: "Home Delivery",
      description: "Free over ₹500",
      active: true,
      price: 0,
    },
    {
      id: 2,
      name: "Same Day Delivery",
      description: "Order before 5 PM",
      active: true,
      price: 50,
    },
    {
      id: 3,
      name: "Bulk Orders",
      description: "Special pricing for bulk",
      active: false,
      price: 0,
    },
  ];

  const handleAddToCart = (product: (typeof products)[0]) => {
    addToCart({
      id: `${store?.id}-${product.id}`,
      name: product.name,
      price: product.price,
    });
    // You can add a toast/snackbar notification here
  };

  const handleBookService = (service: (typeof services)[0]) => {
    // Navigate to booking page or show booking modal
    console.log("Booking service:", service.name);
    // You can implement booking logic here
  };

  // If store not found
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

  // Helper Component for Stats Card
  const StatCard = ({
    value,
    label,
  }: {
    value: string | number;
    label: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{store.type}</Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={14} color="#64748b" />
                <Text style={styles.infoText}>{store.distance} away</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="star" size={14} color="#E9C46A" />
                <Text style={styles.infoText}>{store.rating} rating</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
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

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <StatCard value={store.followers} label="Followers" />
          <StatCard value={products.length} label="Products" />
          <StatCard value={services.length} label="Services" />
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "products" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("products")}
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
            onPress={() => setActiveTab("services")}
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

        {/* PRODUCTS TAB CONTENT */}
        {activeTab === "products" && (
          <View>
            {/* Search */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <Search size={18} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search products..."
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Products List */}
            <View style={{ gap: 12 }}>
              {products.map((product) => (
                <View key={product.id} style={styles.card}>
                  <View style={styles.productRow}>
                    <View style={styles.productImage}>
                      <Text style={{ fontSize: 28 }}>{product.image}</Text>
                    </View>

                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text style={styles.cardTitle}>{product.name}</Text>
                      <Text style={styles.subText}>{product.category}</Text>
                      <Text style={styles.priceText}>
                        {product.displayPrice}
                      </Text>
                      <Text style={styles.stockText}>
                        Stock: {product.stock}
                      </Text>
                    </View>

                    <View style={styles.rightActionContainer}>
                      <View
                        style={[
                          styles.badge,
                          product.status === "active"
                            ? styles.badgeSuccess
                            : styles.badgeDestructive,
                          { marginBottom: 8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            product.status === "active"
                              ? styles.textSuccess
                              : styles.textDestructive,
                          ]}
                        >
                          {product.status === "active" ? "In Stock" : "Out"}
                        </Text>
                      </View>

                      {product.status === "active" && (
                        <TouchableOpacity
                          style={styles.addToCartBtnSmall}
                          onPress={() => handleAddToCart(product)}
                        >
                          <Plus size={16} color="#FFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SERVICES TAB CONTENT */}
        {activeTab === "services" && (
          <View style={{ gap: 12 }}>
            {services.map((service) => (
              <View key={service.id} style={styles.card}>
                <View style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <StoreIcon size={16} color={colors.brand.primaryLight} />
                      <Text style={styles.cardTitle}>{service.name}</Text>
                    </View>
                    <Text style={styles.subText} numberOfLines={1}>
                      {service.description}
                    </Text>
                    {service.price > 0 && (
                      <Text style={styles.servicePriceText}>
                        ₹{service.price}
                      </Text>
                    )}
                  </View>

                  <View style={styles.rightActionContainer}>
                    <View
                      style={[
                        styles.badge,
                        service.active
                          ? styles.badgeDefault
                          : styles.badgeSecondary,
                        { marginBottom: 8 },
                      ]}
                    >
                      <Text style={styles.badgeTextSmall}>
                        {service.active ? "Active" : "Off"}
                      </Text>
                    </View>
                    {service.active && (
                      <TouchableOpacity
                        style={styles.bookServiceBtnSmall}
                        onPress={() => handleBookService(service)}
                      >
                        <Plus size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  // Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  storeHeaderRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  storeImageContainer: {
    height: 80,
    width: 80,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  storeImage: {
    width: "100%",
    height: "100%",
  },
  rightActionContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 60,
  },
  addToCartBtnSmall: {
    backgroundColor: colors.brand.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  bookServiceBtnSmall: {
    backgroundColor: colors.brand.primaryLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  typeBadge: {
    backgroundColor: "#B7DEE540",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#143e47",
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#64748b",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  // Buttons
  outlineBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    gap: 4,
    flex: 1,
    justifyContent: "center",
  },
  btnTextSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },

  addToCartText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },

  bookServiceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  // Search
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  // Products/Services Items
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productImage: {
    height: 56,
    width: 56,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  stockText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  servicePriceText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
    marginTop: 4,
  },
  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeSuccess: { backgroundColor: "#dcfce7" },
  badgeDestructive: { backgroundColor: "#fee2e2" },
  badgeDefault: { backgroundColor: "#e2e8f0" },
  badgeSecondary: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  textSuccess: { color: "#166534" },
  textDestructive: { color: "#991b1b" },
  badgeTextSmall: { fontSize: 11, color: "#334155" },
});
