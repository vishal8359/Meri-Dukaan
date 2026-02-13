import { useApp } from "@/src/context/AppContext";
import { colors, radius } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ChevronLeft,
    Heart,
    MapPin,
    Share2,
    ShoppingCart
} from "lucide-react-native";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  displayPrice: string;
  stock: string;
  image: string;
  status: "active" | "out-of-stock";
  description?: string;
  images?: string[];
  storeId?: string;
  storeName?: string;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useApp();
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Mock product data - in production, fetch from API based on ID
  const product: Product = {
    id: id as string,
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price: 40,
    displayPrice: "₹40/kg",
    stock: "50 kg",
    image:
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=500",
    status: "active",
    description:
      "Fresh, organic tomatoes sourced directly from local farmers. Rich in lycopene and vitamin C. Perfect for salads, cooking, or making juices. Hand-picked to ensure quality and freshness.",
    images: [
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=500",
      "https://images.unsplash.com/photo-1649620407859-bfa6aba76e4f?q=80&w=500",
      "https://images.unsplash.com/photo-1592063786241-8b7c1fe79f17?q=80&w=500",
    ],
    storeId: "1",
    storeName: "Sharma Kirana",
  };

  // Related products mock data
  const relatedProducts: Product[] = [
    {
      id: "2",
      name: "Onions",
      category: "Vegetables",
      price: 30,
      displayPrice: "₹30/kg",
      stock: "80 kg",
      image:
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=300",
      status: "active",
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
      status: "out-of-stock",
    },
    {
      id: "4",
      name: "Potatoes",
      category: "Vegetables",
      price: 25,
      displayPrice: "₹25/kg",
      stock: "100 kg",
      image:
        "https://images.unsplash.com/photo-1590841795199-c70b8abb5166?q=80&w=300",
      status: "active",
    },
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeName: product.storeName || "Store",
      storeId: product.storeId,
    });
    // Show success message or toast
    alert("Added to cart");
  };

  const handleNavigateToProduct = (productId: string) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: productId },
    } as any);
  };

  const RelatedProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => handleNavigateToProduct(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.relatedImage} />
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.relatedPrice}>{item.displayPrice}</Text>
        <View
          style={[
            styles.relatedStatus,
            item.status === "active"
              ? styles.statusActive
              : styles.statusOutOfStock,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "active" ? "Available" : "Out of Stock"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images?.[mainImageIndex] || product.image }}
            style={styles.mainImage}
          />

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <FlatList
              horizontal
              data={product.images}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.thumbnail,
                    mainImageIndex === index && styles.activeThumbnail,
                  ]}
                  onPress={() => setMainImageIndex(index)}
                >
                  <Image source={{ uri: item }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.thumbnailContainer}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              product.status === "active"
                ? styles.badgeSuccess
                : styles.badgeError,
            ]}
          >
            <Text style={styles.badgeText}>
              {product.status === "active" ? "Available" : "Out of Stock"}
            </Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Category */}
          <Text style={styles.category}>{product.category}</Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{product.displayPrice}</Text>
            <Text style={styles.stock}>Stock: {product.stock}</Text>
          </View>

          {/* Store Info */}
          <View style={styles.storeSection}>
            <MapPin size={16} color={colors.brand.primary} />
            <Text style={styles.storeName}>{product.storeName}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Heart size={20} color={colors.brand.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Share2 size={20} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Product Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Availability:</Text>
            <Text style={styles.detailValue}>{product.stock}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text
              style={[
                styles.detailValue,
                product.status === "active"
                  ? styles.statusSuccess
                  : styles.statusError,
              ]}
            >
              {product.status === "active" ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>

        {/* Related Products */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Products</Text>
          <FlatList
            horizontal
            data={relatedProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RelatedProductCard item={item} />}
            contentContainerStyle={styles.relatedList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomButton}>
        {product.status === "active" ? (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  imageSection: {
    marginBottom: 16,
  },
  mainImage: {
    width: "100%",
    height: 300,
    borderRadius: radius.md,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  thumbnailContainer: {
    paddingBottom: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  activeThumbnail: {
    borderColor: colors.brand.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeError: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  stock: {
    fontSize: 13,
    color: "#64748b",
  },
  storeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 21,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  statusSuccess: {
    color: "#166534",
  },
  statusError: {
    color: "#991b1b",
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedList: {
    paddingRight: 8,
  },
  relatedCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    width: 140,
    marginRight: 12,
    overflow: "hidden",
  },
  relatedImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f1f5f9",
  },
  relatedInfo: {
    padding: 12,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
  },
  relatedPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primary,
    marginBottom: 6,
  },
  relatedStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusOutOfStock: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#166534",
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  addToCartButton: {
    backgroundColor: colors.brand.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  outOfStockButton: {
    backgroundColor: "#cbd5e1",
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
