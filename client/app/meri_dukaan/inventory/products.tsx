// app/meri_dukaan/inventory/products.tsx
import { MyStoreProduct } from "@/src/context/AppContext";
import { colors, radius, spacing } from "@/src/theme/colors";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Package,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductsTab({
  products,
  onToggleStock,
  onRemove,
  onAdd,
  onUpdateStock,
}: {
  products: MyStoreProduct[];
  onToggleStock: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onUpdateStock: (id: string, quantity: number) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };
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
        products.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <View key={p.id}>
              <TouchableOpacity
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() => toggleExpand(p.id)}
              >
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
                        p.inStock
                          ? colors.brand.primary
                          : colors.ui.surfaceHover
                      }
                      onValueChange={() => onToggleStock(p.id)}
                      value={p.inStock}
                      style={{
                        transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
                      }}
                    />
                  </View>
                  <View style={styles.itemBottomRow}>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => onRemove(p.id)}
                    >
                      <Trash2 size={15} color={colors.status.error} />
                    </TouchableOpacity>
                    {isExpanded ? (
                      <ChevronUp size={16} color={colors.text.tertiary} />
                    ) : (
                      <ChevronDown size={16} color={colors.text.tertiary} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Inline Stock Manager */}
              {isExpanded && (
                <StockEditor product={p} onUpdateStock={onUpdateStock} />
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

// ========== INLINE STOCK EDITOR ==========
function StockEditor({
  product,
  onUpdateStock,
}: {
  product: MyStoreProduct;
  onUpdateStock: (id: string, quantity: number) => void;
}) {
  const [qty, setQty] = useState(String(product.quantity));

  const applyChange = (newQty: number) => {
    const clamped = Math.max(0, newQty);
    setQty(String(clamped));
    onUpdateStock(product.id, clamped);
  };

  const handleManualInput = (text: string) => {
    // Allow only digits
    const cleaned = text.replace(/[^0-9]/g, "");
    setQty(cleaned);
  };

  const handleManualSubmit = () => {
    const parsed = parseInt(qty, 10);
    const value = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setQty(String(value));
    onUpdateStock(product.id, value);
  };

  return (
    <View style={styles.stockEditor}>
      <Text style={styles.stockEditorTitle}>Manage Stock</Text>

      {/* Description */}
      {product.description && (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      )}

      <View style={styles.stockEditorRow}>
        {/* Decrement */}
        <TouchableOpacity
          style={styles.stockBtn}
          onPress={() => applyChange(product.quantity - 1)}
        >
          <Minus size={18} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Quick -10 */}
        <TouchableOpacity
          style={styles.stockQuickBtn}
          onPress={() => applyChange(product.quantity - 10)}
        >
          <Text style={styles.stockQuickBtnText}>−10</Text>
        </TouchableOpacity>

        {/* Direct input */}
        <TextInput
          style={styles.stockInput}
          value={qty}
          onChangeText={handleManualInput}
          onBlur={handleManualSubmit}
          onSubmitEditing={handleManualSubmit}
          keyboardType="numeric"
          selectTextOnFocus
        />

        {/* Quick +10 */}
        <TouchableOpacity
          style={styles.stockQuickBtn}
          onPress={() => applyChange(product.quantity + 10)}
        >
          <Text style={styles.stockQuickBtnText}>+10</Text>
        </TouchableOpacity>

        {/* Increment */}
        <TouchableOpacity
          style={styles.stockBtn}
          onPress={() => applyChange(product.quantity + 1)}
        >
          <Plus size={18} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.stockEditorHint}>
        Current: {product.quantity} {product.unit}
      </Text>
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
    paddingVertical: 9,
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
    gap: 7,
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
  itemBottomRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stockToggle: { alignItems: "flex-end" },
  stockLabel: { fontSize: 10, fontWeight: "600", marginBottom: 1 },
  removeBtn: {
    padding: 6,
    backgroundColor: colors.status.errorBorder,
    borderRadius: radius.sm,
  },

  /* Stock Editor */
  stockEditor: {
    backgroundColor: colors.brand.primary + "08",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.brand.primary + "20",
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    padding: spacing.md,
    marginBottom: 10,
    marginTop: -10,
  },
  stockEditorTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stockEditorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ui.surface,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stockQuickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  stockQuickBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  stockInput: {
    backgroundColor: colors.ui.surface,
    borderWidth: 1.5,
    borderColor: colors.brand.primary + "40",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    minWidth: 70,
  },
  stockEditorHint: {
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  descriptionBox: {
    backgroundColor: colors.ui.surface,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
});
