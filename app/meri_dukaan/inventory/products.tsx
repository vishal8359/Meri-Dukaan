// app/meri_dukaan/inventory/products.tsx
import { MyStoreProduct } from "@/src/context/AppContext";
import { colors, radius, spacing } from "@/src/theme/colors";
import { Package, Plus, Trash2 } from "lucide-react-native";
import React from "react";
import {
    Image,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductsTab({
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

const styles = StyleSheet.create({
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
    borderRadius: 999,
    gap: 5,
  },
  addItemBtnText: {
    color: colors.text.inverse,
    fontWeight: "600",
    fontSize: 12,
  },
  emptyTab: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: "700", color: colors.text.secondary },
  emptySubtext: { fontSize: 13, color: colors.text.tertiary },
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
});
