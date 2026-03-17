// app/meri_dukaan/inventory/services.tsx
import { MyStoreService } from "@/src/context/AppContext";
import { colors, radius, spacing } from "@/src/theme/colors";
import { Plus, Trash2, Wrench } from "lucide-react-native";
import React from "react";
import {
    Image,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ServicesTab({
  services,
  onToggleAvailable,
  onRemove,
  onAdd,
}: {
  services: MyStoreService[];
  onToggleAvailable: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <View>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>
          {services.length} Service{services.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity style={styles.addItemBtn} onPress={onAdd}>
          <Plus size={14} color={colors.text.inverse} />
          <Text style={styles.addItemBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyTab}>
          <Wrench size={32} color={colors.ui.muted} />
          <Text style={styles.emptyText}>No services yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first service to get bookings
          </Text>
        </View>
      ) : (
        services.map((s) => (
          <View key={s.id} style={styles.itemCard}>
            <Image source={{ uri: s.images[0] }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{s.name}</Text>
              <Text style={styles.itemPrice}>₹{s.price}</Text>
              <Text style={styles.itemMeta}>⏱ {s.duration}</Text>
              {s.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {s.description}
                </Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <View style={styles.stockToggle}>
                <Text
                  style={[
                    styles.stockLabel,
                    {
                      color: s.available
                        ? colors.status.success
                        : colors.text.light,
                    },
                  ]}
                >
                  {s.available ? "Available" : "Off"}
                </Text>
                <Switch
                  trackColor={{
                    false: colors.ui.border,
                    true: colors.brand.primaryLight,
                  }}
                  thumbColor={
                    s.available ? colors.brand.primary : colors.ui.surfaceHover
                  }
                  onValueChange={() => onToggleAvailable(s.id)}
                  value={s.available}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(s.id)}
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
  itemDescription: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 15,
  },
  itemActions: { alignItems: "flex-end", gap: 6 },
  stockToggle: { alignItems: "flex-end" },
  stockLabel: { fontSize: 10, fontWeight: "600", marginBottom: 1 },
  removeBtn: {
    padding: 6,
    backgroundColor: colors.status.errorBorder,
    borderRadius: radius.sm,
  },
});
