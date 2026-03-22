// src/features/auth/screens/ProfileScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Award,
    Bell,
    ChevronRight,
    CreditCard,
    Edit3,
    Heart,
    LogOut,
    Mail,
    MapPin,
    Package,
    Phone,
    Star,
    Store,
    Truck,
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
import { useSettings } from "../../../context/SettingsContext";
import { colors, radius, shadows, spacing } from "../../../theme/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, wishlist, getFollowedStores } = useApp();
  const { t } = useSettings();
  const followedStores = getFollowedStores();

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
                {user?.name?.charAt(0) || "G"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => router.push("/Profile/edit-profile")}
            >
              <Edit3 size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
          <Text style={styles.memberSince}>{t("profile.premiumMember")}</Text>

          <View style={styles.ratingRow}>
            <Star
              size={14}
              color={colors.brand.star}
              fill={colors.brand.star}
            />
            <Text style={styles.ratingText}>
              4.8 • {t("profile.verifiedMember")}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/Profile/edit-profile")}
          >
            <Edit3 size={16} color="#FFF" />
            <Text style={styles.editBtnText}>{t("profile.editProfile")}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Stats Row */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => router.push("/myorders/orders")}
        >
          <EnhancedStatBox
            icon={Package}
            number="12"
            label={t("profile.orders")}
            color="#3b82f6"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => router.push("/wishlist/wishlist")}
        >
          <EnhancedStatBox
            icon={Heart}
            number={String(wishlist.length)}
            label={t("profile.wishlist")}
            color="#ef4444"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => router.push("/dukaan/following")}
        >
          <EnhancedStatBox
            icon={Users}
            number={String(followedStores.length)}
            label={t("profile.following")}
            color="#10b981"
          />
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => {}}>
          <EnhancedStatBox
            icon={Award}
            number="3"
            label={t("profile.badges")}
            color="#f59e0b"
          />
        </TouchableOpacity>
      </View>

      {/* Account Details Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.accountDetails")}</Text>
        <Card style={styles.detailsCard}>
          <InfoRow
            icon={MapPin}
            label={t("profile.address")}
            value={user?.address || "Not set"}
          />
          <View style={styles.divider} />
          <InfoRow
            icon={Phone}
            label={t("profile.phone")}
            value={user?.phone || "Not set"}
          />
          <View style={styles.divider} />
          <InfoRow
            icon={Mail}
            label={t("profile.email")}
            value={user?.email || "Not set"}
          />
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.quickActions")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsGrid}
        >
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/myorders/orders")}
          >
            <View style={styles.qaIconBg}>
              <Package size={24} color={colors.status.info} />
            </View>
            <Text style={styles.qaLabel}>{t("profile.myOrders")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/wishlist/wishlist")}
          >
            <View style={styles.qaIconBg}>
              <Heart size={24} color={colors.status.error} />
            </View>
            <Text style={styles.qaLabel}>{t("profile.wishlist")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/meri_dukaan/my-dukaan")}
          >
            <View style={styles.qaIconBg}>
              <Store size={24} color={colors.tint.green} />
            </View>
            <Text style={styles.qaLabel}>{t("profile.myDukaan")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/notification/notifications")}
          >
            <View style={styles.qaIconBg}>
              <Bell size={24} color={colors.status.warning} />
            </View>
            <Text style={styles.qaLabel}>{t("profile.notifications")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Menu List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.moreOptions")}</Text>
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/myorders/orders")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: colors.status.infoLight },
                ]}
              >
                <Package size={18} color={colors.status.info} />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("profile.myOrders")}</Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.trackOrders")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/wishlist/wishlist")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[styles.menuIconWrapper, { backgroundColor: "#fde8e8" }]}
              >
                <Heart size={18} color={colors.status.error} />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("profile.wishlist")}</Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.wishlistDesc")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/meri_dukaan/my-dukaan")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: colors.status.successLight || "#e6f9ef" },
                ]}
              >
                <Store size={18} color={colors.tint.green} />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("profile.myDukaan")}</Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.manageStore")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/payments/history")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: colors.status.warningLight },
                ]}
              >
                <CreditCard size={18} color={colors.status.warning} />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("profile.payments")}</Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.paymentsDesc")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/Transporter/transporter")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[styles.menuIconWrapper, { backgroundColor: "#e0e7ff" }]}
              >
                <Truck size={18} color={colors.brand.accent} />
              </View>
              <View>
                <Text style={styles.menuItemText}>
                  {t("profile.transporter")}
                </Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.transporterDesc")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.ui.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/notification/notifications")}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[styles.menuIconWrapper, { backgroundColor: "#fef3c7" }]}
              >
                <Bell size={18} color={colors.status.warning} />
              </View>
              <View>
                <Text style={styles.menuItemText}>
                  {t("profile.notifications")}
                </Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.notificationsDesc")}
                </Text>
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
                  {t("profile.logout")}
                </Text>
                <Text style={styles.menuItemDesc}>
                  {t("profile.logoutDesc")}
                </Text>
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
