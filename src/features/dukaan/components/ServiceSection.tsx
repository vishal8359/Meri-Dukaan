// src/features/dukaan/components/ServicesSection.tsx
import { colors } from "@/src/theme/colors";
import { Plus, Store } from "lucide-react-native";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Service {
  id: string;
  name: string;
  description: string;
  active: boolean;
  price: number;
}

interface ServicesSectionProps {
  services: Service[];
  onBookService?: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onBookService,
}) => {
  const ServiceCard = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceNameRow}>
            <Store size={16} color="#6366f1" />
            <Text style={styles.serviceName}>{item.name}</Text>
          </View>
          <Text style={styles.serviceDescription}>{item.description}</Text>
          {item.price > 0 && (
            <Text style={styles.servicePrice}>₹{item.price}</Text>
          )}
        </View>

        <View
          style={[
            styles.statusBadge,
            item.active ? styles.badgeActive : styles.badgeInactive,
          ]}
        >
          <Text style={styles.statusText}>
            {item.active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      {/* Book Service Button */}
      {item.active && (
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => onBookService?.(item)}
        >
          <Plus size={16} color="#FFF" />
          <Text style={styles.bookText}>Book Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard item={item} />}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services available</Text>
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
  servicesList: {
    gap: 12,
  },
  serviceCard: {
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
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  serviceDescription: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: "#e2e8f0",
  },
  badgeInactive: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#6366f1",
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookText: {
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
