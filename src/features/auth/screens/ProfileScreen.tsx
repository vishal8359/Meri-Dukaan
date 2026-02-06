// src/features/auth/screens/ProfileScreen.tsx
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Edit3,
  Heart,
  HelpCircle,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Settings,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Card } from "../../../components/common/Card";
import { useApp } from "../../../context/AppContext";
import { colors, radius, spacing } from "../../../theme/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useApp();

  // Sub-component for Info Rows
  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.iconWrapper}>
        <Icon size={18} color={colors.brand.primary} />
      </View>
      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || "V"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBadge}
            onPress={() => router.push("/Profile/edit-profile")}
          >
            <Edit3 size={14} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name || "Vishal Kumar"}</Text>
        <Text style={styles.memberSince}>Member since Jan 2024</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/Profile/edit-profile")}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Package size={20} color={colors.text.primary} />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <Heart size={20} color={colors.text.primary} />
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
        <View style={styles.statBox}>
          <Users size={20} color={colors.text.primary} />
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* 3. Contact & Address Card */}
      <Card style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Account Details</Text>

        <InfoRow
          icon={MapPin}
          label="Address"
          value="Rajendra Nagar, Patna - 800016"
        />
        <InfoRow icon={Phone} label="Phone" value="+91 98765 43210" />
        <InfoRow
          icon={Mail}
          label="Email"
          value={user?.email || "user@example.com"}
        />
      </Card>

      {/* 4. Menu List */}
      <View style={styles.menuList}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/Settings/settings")}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIconWrapper}>
              <Settings size={18} color={colors.brand.primary} />
            </View>
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <ChevronRight size={20} color={colors.ui.border} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/HelpCenter/help-support")}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIconWrapper}>
              <HelpCircle size={18} color={colors.brand.primary} />
            </View>
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color={colors.ui.border} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={18} color={colors.status.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  } as ViewStyle,
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  } as ViewStyle,
  avatarWrapper: {
    marginBottom: spacing.md,
  } as ViewStyle,
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#F1F5F9",
  } as ViewStyle,
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFF",
  } as TextStyle,
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#143e47",
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#FFF",
  } as ViewStyle,
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
  } as TextStyle,
  memberSince: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  } as TextStyle,
  editBtn: {
    marginTop: spacing.md,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  } as ViewStyle,
  editBtnText: {
    color: colors.brand.primary,
    fontWeight: "700",
    fontSize: 14,
  } as TextStyle,

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    elevation: 1,
  } as ViewStyle,
  statBox: {
    flex: 1,
    alignItems: "center",
  } as ViewStyle,
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F1F5F9",
  } as ViewStyle,
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 4,
  } as TextStyle,
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  } as TextStyle,

  // Details Card
  detailsCard: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  } as ViewStyle,
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: spacing.md,
  } as TextStyle,
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  } as ViewStyle,
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,
  infoTextWrapper: {
    flex: 1,
  } as ViewStyle,
  infoLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  } as TextStyle,
  infoValue: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    marginTop: 2,
  } as TextStyle,

  // Menu List
  menuList: {
    margin: spacing.md,
    gap: spacing.sm,
  } as ViewStyle,
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: spacing.md,
    borderRadius: radius.md,
  } as ViewStyle,
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  } as ViewStyle,
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  } as TextStyle,
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    gap: 8,
  } as ViewStyle,
  logoutText: {
    color: colors.status.error,
    fontWeight: "700",
    fontSize: 16,
  } as TextStyle,
});
