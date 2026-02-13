import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { Search, ShoppingCart } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  displayPrice: string;
  stock: string;
  image: string;
  status: "active" | "out-of-stock";
}

interface ProductsSectionProps {
  storeId: string;
  products: Product[];
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  storeId,
  products,
}) => {
  const router = useRouter();
  const { addToCart } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: `${storeId}-${product.id}`,
      name: product.name,
      price: product.price,
      image: product.image,
      storeName: "Store Name",
      storeId: storeId,
    });
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: product.id, storeId: storeId },
    } as any);
  };

  const ProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productRow}>
        <View style={styles.productImageContainer}>
          {item.image.startsWith("http") ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <Text style={styles.productEmoji}>{item.image}</Text>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                item.status === "active"
                  ? styles.badgeSuccess
                  : styles.badgeError,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === "active"
                    ? styles.textSuccess
                    : styles.textError,
                ]}
              >
                {item.status === "active" ? "Available" : "Out of Stock"}
              </Text>
            </View>
          </View>

          <Text style={styles.productCategory}>{item.category}</Text>

          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{item.displayPrice}</Text>
            <Text style={styles.productStock}>Stock: {item.stock}</Text>
          </View>
        </View>
      </View>

      {item.status === "active" && (
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => handleAddToCart(item)}
        >
          <ShoppingCart size={16} color="#FFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.productsList}
        // --- FIXES ---
        // 1. Disable inner scrolling so the parent FlatList handles it
        scrollEnabled={false}
        // 2. Add visual spacing between cards
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        // -------------

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  productsList: {
    // We use paddingBottom to ensure the last card isn't cut off
    paddingBottom: 20,
  },
  separator: {
    height: 16, // This creates the 16px gap between cards
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    // Add marginHorizontal if you want them away from the screen edges
    marginHorizontal: 2,
  },
  productRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  productImageContainer: {
    width: 64, // Slightly larger for better look
    height: 64,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productEmoji: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeError: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textSuccess: {
    color: "#166534",
  },
  textError: {
    color: "#991b1b",
  },
  productCategory: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  productStock: {
    fontSize: 12,
    color: "#94a3b8",
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brand.primaryLight,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
