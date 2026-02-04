import { colors, radius, shadows } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Camera,
    ChevronLeft,
    Edit2,
    Plus,
    Star,
    Trash2
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyDukaanScreen() {
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Mock Store Data State
  const [storeData, setStoreData] = useState({
    name: "Vishal's Fresh Farm",
    type: "Vegetables & Fruits",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
    address: "Mysuru, Karnataka",
    rating: 4.8, // Read-only
    followers: 1205,
  });

  // Mock Inventory State
  const [products, setProducts] = useState([
    { id: 1, name: "Fresh Tomatoes", price: "40", stock: true, image: "🍅" },
    { id: 2, name: "Onions", price: "30", stock: true, image: "🧅" },
    { id: 3, name: "Potatoes", price: "25", stock: false, image: "🥔" },
  ]);

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    // TODO: API Call to update store profile
    Alert.alert("Success", "Store profile updated successfully!");
  };

  const toggleStock = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: !p.stock } : p)),
    );
  };

  const handleDeleteProduct = (id: number) => {
    Alert.alert("Delete Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setProducts((prev) => prev.filter((p) => p.id !== id)),
      },
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
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dukaan</Text>
        <TouchableOpacity
          onPress={() =>
            isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)
          }
          style={styles.actionTextBtn}
        >
          {isEditingProfile ? (
            <Text style={{ color: colors.status.success, fontWeight: "700" }}>
              Save
            </Text>
          ) : (
            <Edit2 size={20} color={colors.brand.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Store Profile Section --- */}
        <View style={styles.profileSection}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: storeData.image }}
              style={styles.storeImage}
            />
            {isEditingProfile && (
              <TouchableOpacity style={styles.cameraBtn}>
                <Camera size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Store Name</Text>
              {isEditingProfile ? (
                <TextInput
                  value={storeData.name}
                  onChangeText={(t) => setStoreData({ ...storeData, name: t })}
                  style={styles.input}
                />
              ) : (
                <Text style={styles.valueText}>{storeData.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              {isEditingProfile ? (
                <TextInput
                  value={storeData.type}
                  onChangeText={(t) => setStoreData({ ...storeData, type: t })}
                  style={styles.input}
                />
              ) : (
                <Text style={styles.valueText}>{storeData.type}</Text>
              )}
            </View>

            {/* Read Only Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Star size={14} color="#E9C46A" fill="#E9C46A" />
                <Text style={styles.statText}>{storeData.rating} Rating</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: "#e0f2fe" }]}>
                <Ionicons name="people" size={14} color="#0284c7" />
                <Text style={[styles.statText, { color: "#0284c7" }]}>
                  {storeData.followers} Followers
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- Inventory Management Section --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inventoryList}>
          {products.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productIcon}>
                <Text style={{ fontSize: 24 }}>{item.image}</Text>
              </View>

              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price}/kg</Text>
              </View>

              <View style={styles.actions}>
                <View style={styles.switchWrapper}>
                  <Text
                    style={[
                      styles.stockLabel,
                      {
                        color: item.stock
                          ? colors.status.success
                          : colors.text.light,
                      },
                    ]}
                  >
                    {item.stock ? "In Stock" : "No Stock"}
                  </Text>
                  <Switch
                    trackColor={{
                      false: "#e2e8f0",
                      true: colors.brand.primaryLight,
                    }}
                    thumbColor={item.stock ? colors.brand.primary : "#f4f3f4"}
                    onValueChange={() => toggleStock(item.id)}
                    value={item.stock}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteProduct(item.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ui.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    backgroundColor: colors.ui.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  iconBtn: { padding: 8 },
  actionTextBtn: { padding: 8 },
  scrollContent: { padding: 16 },

  // Profile
  profileSection: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
    ...shadows.small,
  },
  imageWrapper: {
    height: 150,
    width: "100%",
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  storeImage: { width: "100%", height: "100%" },
  cameraBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: radius.full,
  },
  formContainer: { gap: 12 },
  inputGroup: { gap: 4 },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  valueText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "600",
    paddingVertical: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.brand.primary,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 4,
  },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 6,
  },
  statText: { fontSize: 12, fontWeight: "700", color: "#854d0e" },

  // Inventory
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    gap: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  inventoryList: { gap: 12 },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.ui.background,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  productName: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  productPrice: { fontSize: 13, color: colors.text.secondary },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchWrapper: { alignItems: "flex-end" },
  stockLabel: { fontSize: 10, fontWeight: "600", marginBottom: 2 },
  deleteBtn: {
    padding: 8,
    backgroundColor: "#fee2e2",
    borderRadius: radius.sm,
  },
});
