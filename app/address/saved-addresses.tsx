// app/address/saved-addresses.tsx
import { AddressFormModal } from "@/src/components/common/AddressFormModal";
import { useApp, UserAddress } from "@/src/context/AppContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import {
    Check,
    ChevronLeft,
    Edit3,
    MapPin,
    Plus,
    Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SavedAddressesScreen() {
  const router = useRouter();
  const {
    savedAddresses,
    selectedAddressId,
    addAddress,
    updateAddress,
    removeAddress,
    setSelectedAddressId,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<
    UserAddress | undefined
  >();

  const handleAdd = (data: Omit<UserAddress, "id">) => {
    const newAddr: UserAddress = {
      ...data,
      id: `addr_${Date.now()}`,
    };
    addAddress(newAddr);
  };

  const handleEdit = (data: Omit<UserAddress, "id">) => {
    if (editingAddress) {
      updateAddress(editingAddress.id, data);
      setEditingAddress(undefined);
    }
  };

  const handleDelete = (addr: UserAddress) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to remove "${addr.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeAddress(addr.id),
        },
      ],
    );
  };

  const handleSelect = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ui.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingAddress(undefined);
            setShowForm(true);
          }}
        >
          <Plus size={20} color={colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {savedAddresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color={colors.ui.disabled} />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptySubtitle}>
              Add an address to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => {
                setEditingAddress(undefined);
                setShowForm(true);
              }}
            >
              <Plus size={18} color={colors.text.inverse} />
              <Text style={styles.emptyAddBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedAddresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <TouchableOpacity
                key={addr.id}
                style={[
                  styles.addressCard,
                  isSelected && styles.addressCardSelected,
                ]}
                onPress={() => handleSelect(addr)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLabelRow}>
                    <View
                      style={[
                        styles.pinIcon,
                        isSelected && styles.pinIconSelected,
                      ]}
                    >
                      <MapPin
                        size={16}
                        color={
                          isSelected
                            ? colors.text.inverse
                            : colors.brand.primary
                        }
                      />
                    </View>
                    <Text style={styles.cardLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Check size={16} color={colors.text.inverse} />
                    </View>
                  )}
                </View>

                <Text style={styles.cardAddress} numberOfLines={2}>
                  {addr.address}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""} - {addr.pincode}
                </Text>
                {addr.phone ? (
                  <Text style={styles.cardPhone}>{addr.phone}</Text>
                ) : null}

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => {
                      setEditingAddress(addr);
                      setShowForm(true);
                    }}
                  >
                    <Edit3 size={14} color={colors.brand.primary} />
                    <Text style={styles.cardActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => handleDelete(addr)}
                  >
                    <Trash2 size={14} color={colors.status.error} />
                    <Text
                      style={[
                        styles.cardActionText,
                        { color: colors.status.error },
                      ]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <AddressFormModal
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(undefined);
        }}
        onSave={editingAddress ? handleEdit : handleAdd}
        initial={editingAddress}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.ui.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ui.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ui.background,
  },
  list: { flex: 1 },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm + 4,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  // Address card
  addressCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  addressCardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: "#F0F4FA",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pinIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.ui.background,
    alignItems: "center",
    justifyContent: "center",
  },
  pinIconSelected: {
    backgroundColor: colors.brand.primary,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.status.successDark,
  },
  selectedIndicator: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAddress: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginLeft: 38,
  },
  cardPhone: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginLeft: 38,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm + 4,
    marginLeft: 38,
  },
  cardActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
  },
});
