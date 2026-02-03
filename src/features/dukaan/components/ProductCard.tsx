import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius, spacing } from "../../../theme/colors"; // Import your theme

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  onAddToCart: (productId: string) => void;
  onPress: (productId: string) => void; // To navigate to product details
}

export const ProductCard = ({
  id,
  name,
  price,
  imageUrl,
  onAddToCart,
  onPress,
}: ProductCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      activeOpacity={0.8}
      style={styles.touchableWrapper}
    >
      {/* <Card style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.price}>₹{price.toFixed(2)}</Text>
          <Button
            title="Add to Cart"
            onPress={() => onAddToCart(id)}
            variant="primary"
            style={styles.addToCartButton}
            textStyle={styles.addToCartButtonText}
          />
        </View>
      </Card> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableWrapper: {
    width: "48%", // For a 2-column grid, adjust as needed
    marginVertical: spacing.sm,
    marginHorizontal: "1%", // Gives some space between cards
  },
  card: {
    flex: 1, // Ensures card expands within wrapper
    alignItems: "stretch",
    padding: spacing.xs, // Slightly less padding for inner card content
  },
  image: {
    width: "100%",
    height: 120, // Fixed height for consistent look
    borderRadius: radius.sm, // Smaller radius for image
    marginBottom: spacing.sm,
    backgroundColor: colors.ui.border, // Placeholder background
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: spacing.xs,
    justifyContent: "space-between", // Pushes button to bottom
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary, // Using primary for price, or brand.secondary
    marginBottom: spacing.sm,
  },
  addToCartButton: {
    paddingVertical: spacing.sm, // Make button smaller for cards
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm, // Smaller button radius
    marginTop: spacing.sm, // Space above button
  },
  addToCartButtonText: {
    fontSize: 14,
  },
});
