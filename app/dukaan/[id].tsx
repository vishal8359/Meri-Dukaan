import React, { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
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
import { Heart, MapPin, Phone, Share2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getStoreById } = useApp();

  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );

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

  // This renders everything ABOVE the product/service list
  const renderHeader = () => (
    <View>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* The Fix: Using a FlatList as the main container. 
        Since ProductsSection/ServicesSection likely contain lists, 
        we pass them as the only item in the data array or 
        render them inside the footer/header.
      */}
      <FlatList
        data={[1]} // Dummy data to allow the list to render
        renderItem={() => (
          <View style={styles.tabContent}>
            {activeTab === "products" ? (
              <ProductsSection storeId={id as string} products={products} />
            ) : (
              <ServicesSection
                services={services}
                onBookService={handleBookService}
              />
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
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
  tabContent: {
    minHeight: 400,
  },
});
