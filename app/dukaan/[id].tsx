import {
  BarChart3,
  Edit,
  Menu,
  Plus,
  Search,
  Settings,
  Store,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Mock Navigation (Replace with useRouter() from expo-router or useNavigation())
const useNavigation = () => {
  return { navigate: (path: string) => console.log("Navigating to:", path) };
};

export default function MyDukaanScreen() {
  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );
  const navigation = useNavigation();

  const products = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: "₹40/kg",
      stock: "50 kg",
      image: "🍅",
      status: "active",
    },
    {
      id: 2,
      name: "Onions",
      category: "Vegetables",
      price: "₹30/kg",
      stock: "80 kg",
      image: "🧅",
      status: "active",
    },
    {
      id: 3,
      name: "Green Chilies",
      category: "Vegetables",
      price: "₹60/kg",
      stock: "0 kg",
      image: "🌶️",
      status: "out-of-stock",
    },
    {
      id: 4,
      name: "Potatoes",
      category: "Vegetables",
      price: "₹25/kg",
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
    },
    {
      id: 2,
      name: "Same Day Delivery",
      description: "Order before 5 PM",
      active: true,
    },
    {
      id: 3,
      name: "Bulk Orders",
      description: "Special pricing for bulk",
      active: false,
    },
  ];

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

      {/* Header Placeholder */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Menu color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dukaan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Header Card */}
        <View style={styles.card}>
          <View style={styles.storeHeaderRow}>
            <View style={styles.storeIconContainer}>
              <Text style={{ fontSize: 32 }}>🏪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>Sharma Kirana</Text>
              <Text style={styles.storeCategory}>
                Grocery & Daily Essentials
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.outlineBtnSmall}>
                  <Settings size={14} color="#333" />
                  <Text style={styles.btnTextSmall}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.outlineBtnSmall}
                  onPress={() => navigation.navigate("/vendor-dashboard")}
                >
                  <BarChart3 size={14} color="#333" />
                  <Text style={styles.btnTextSmall}>Analytics</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <StatCard value={products.length} label="Products" />
          <StatCard value={services.length} label="Services" />
          <StatCard value="2.5K" label="Followers" />
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
            {/* Search & Add */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <Search size={18} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search products..."
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity style={styles.primaryBtn}>
                <Plus size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Products List */}
            <View style={{ gap: 12 }}>
              {products.map((product) => (
                <View key={product.id} style={styles.card}>
                  <View style={styles.productRow}>
                    <View style={styles.productImage}>
                      <Text style={{ fontSize: 28 }}>{product.image}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.spaceBetween}>
                        <Text style={styles.cardTitle}>{product.name}</Text>
                        <View
                          style={[
                            styles.badge,
                            product.status === "active"
                              ? styles.badgeSuccess
                              : styles.badgeDestructive,
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
                            {product.status === "active"
                              ? "Active"
                              : "Out of Stock"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.subText}>{product.category}</Text>
                      <View style={styles.spaceBetween}>
                        <Text style={styles.priceText}>{product.price}</Text>
                        <Text style={styles.stockText}>
                          Stock: {product.stock}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]}>
                      <Edit size={14} color="#333" />
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.outlineBtnDestructive}>
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SERVICES TAB CONTENT */}
        {activeTab === "services" && (
          <View>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginBottom: 16, width: "100%" }]}
            >
              <Plus size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Add Service</Text>
            </TouchableOpacity>

            <View style={{ gap: 12 }}>
              {services.map((service) => (
                <View key={service.id} style={styles.card}>
                  <View style={styles.spaceBetween}>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Store size={16} color="#6366f1" />
                        <Text style={styles.cardTitle}>{service.name}</Text>
                      </View>
                      <Text style={styles.subText}>{service.description}</Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        service.active
                          ? styles.badgeDefault
                          : styles.badgeSecondary,
                      ]}
                    >
                      <Text style={styles.badgeTextSmall}>
                        {service.active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]}>
                      <Edit size={14} color="#333" />
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: service.active ? "#ef4444" : "#6366f1",
                        }}
                      >
                        {service.active ? "Deactivate" : "Activate"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  storeHeaderRow: {
    flexDirection: "row",
    gap: 16,
  },
  storeIconContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#e0e7ff", // Light indigo
    justifyContent: "center",
    alignItems: "center",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  // Buttons
  outlineBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    gap: 4,
  },
  btnTextSmall: {
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111", // Primary black/dark
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    gap: 6,
  },
  outlineBtnDestructive: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#fee2e2",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
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
    color: "#0f172a", // Dark blue/slate
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
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
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
