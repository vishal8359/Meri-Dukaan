// src/features/auth/screens/ProfileScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Award,
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
    Star,
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
import { colors, radius, shadows, spacing } from "../../../theme/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, wishlist } = useApp();

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

  // Enhanced Stat Box Component
  const EnhancedStatBox = ({ icon: Icon, number, label, color }: any) => (
    <View style={styles.enhancedStatBox}>
      <View style={[styles.statIconBg, { backgroundColor: `${color}15` }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={styles.enhancedStatNumber}>{number}</Text>
      <Text style={styles.enhancedStatLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Header Section with Gradient Background */}
      <LinearGradient
        colors={[
          colors.gradient.navyStart,
          colors.gradient.navyEnd,
          colors.brand.primaryLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
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
          <Text style={styles.memberSince}>Premium Member since Jan 2024</Text>

          <View style={styles.ratingRow}>
            <Star
              size={14}
              color={colors.brand.star}
              fill={colors.brand.star}
            />
            <Text style={styles.ratingText}>4.8 • Verified Member</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/Profile/edit-profile")}
          >
            <Edit3 size={16} color="#FFF" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Stats Row */}
      <View style={styles.statsContainer}>
        <EnhancedStatBox
          icon={Package}
          number="12"
          label="Orders"
          color="#3b82f6"
        />
        <EnhancedStatBox
          icon={Heart}
          number={String(wishlist.length)}
          label="Wishlist"
          color="#ef4444"
        />
        <EnhancedStatBox
          icon={Users}
          number="5"
          label="Following"
          color="#10b981"
        />
        <EnhancedStatBox
          icon={Award}
          number="3"
          label="Badges"
          color="#f59e0b"
        />
      </View>

      {/* Account Details Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <Card style={styles.detailsCard}>
          <InfoRow
            icon={MapPin}
            label="Address"
            value="Rajendra Nagar, Patna - 800016"
          />
          <View style={styles.divider} />
          <InfoRow icon={Phone} label="Phone" value="+91 98765 43210" />
          <View style={styles.divider} />
          <InfoRow
            icon={Mail}
            label="Email"
            value={user?.email || "user@example.com"}
          />
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsGrid}
        >
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaIconBg}>
              <Package size={24} color={colors.status.info} />
            </View>
            <Text style={styles.qaLabel}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaIconBg}>
              <Heart size={24} color={colors.status.error} />
            </View>
            <Text style={styles.qaLabel}>Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaIconBg}>
              <MapPin size={24} color={colors.tint.green} />
            </View>
            <Text style={styles.qaLabel}>Addresses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaIconBg}>
              <Settings size={24} color={colors.status.warning} />
            </View>
            <Text style={styles.qaLabel}>Preferences</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Menu List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More Options</Text>
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/Settings/settings")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: colors.status.warningLight },
                ]}
              >
                <Settings size={18} color={colors.status.warning} />
              </View>
              <View>
                <Text style={styles.menuItemText}>Settings</Text>
                <Text style={styles.menuItemDesc}>Manage preferences</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/HelpCenter/help-support")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: colors.status.infoLight },
                ]}
              >
                <HelpCircle size={18} color={colors.status.info} />
              </View>
              <View>
                <Text style={styles.menuItemText}>Help & Support</Text>
                <Text style={styles.menuItemDesc}>Get help anytime</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutBtnMenu]}
            onPress={logout}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: colors.status.errorBorder },
                ]}
              >
                <LogOut size={18} color={colors.status.error} />
              </View>
              <View>
                <Text
                  style={[styles.menuItemText, { color: colors.status.error }]}
                >
                  Logout
                </Text>
                <Text style={styles.menuItemDesc}>Sign out from app</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  } as ViewStyle,
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 40,
  } as ViewStyle,
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  avatarWrapper: {
    marginBottom: spacing.md,
    position: "relative",
  } as ViewStyle,
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ui.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.ui.surface,
    ...shadows.medium,
  } as ViewStyle,
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.brand.primary,
  } as TextStyle,
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.status.info,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.ui.surface,
  } as ViewStyle,
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text.inverse,
    marginBottom: 4,
  } as TextStyle,
  memberSince: {
    fontSize: 14,
    color: colors.ui.disabled,
    marginBottom: 10,
    fontWeight: "500",
  } as TextStyle,
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  } as ViewStyle,
  ratingText: {
    fontSize: 12,
    color: colors.status.warningLight,
    fontWeight: "600",
  } as TextStyle,
  editBtn: {
    marginTop: spacing.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.text.inverse,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  } as ViewStyle,
  editBtnText: {
    color: colors.text.inverse,
    fontWeight: "700",
    fontSize: 15,
  } as TextStyle,

  // Enhanced Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.ui.surface,
    marginHorizontal: spacing.md,
    marginTop: -20,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  } as ViewStyle,
  enhancedStatBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  } as ViewStyle,
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  } as ViewStyle,
  enhancedStatNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 2,
  } as TextStyle,
  enhancedStatLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: "600",
  } as TextStyle,

  // Section Styles
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,

  // Details Card
  detailsCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  } as ViewStyle,
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  divider: {
    height: 1,
    backgroundColor: colors.ui.borderLight,
    marginVertical: spacing.md,
  } as ViewStyle,
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,
  infoTextWrapper: {
    flex: 1,
  } as ViewStyle,
  infoLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
  infoValue: {
    fontSize: 14,
    color: colors.text.caption,
    fontWeight: "600",
    marginTop: 2,
  } as TextStyle,

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as ViewStyle,
  quickActionCard: {
    width: 120,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    ...shadows.small,
  } as ViewStyle,
  qaIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.tint.blueLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  } as ViewStyle,
  qaLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.caption,
  } as TextStyle,

  // Menu List
  menuList: {
    gap: spacing.sm,
  } as ViewStyle,
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadows.small,
  } as ViewStyle,
  logoutBtnMenu: {
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.status.errorBorder,
  } as ViewStyle,
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  } as ViewStyle,
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  menuItemText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  } as TextStyle,
  menuItemDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  } as TextStyle,
});
