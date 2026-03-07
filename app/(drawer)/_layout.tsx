// app/(drawer)/_layout.tsx
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Film,
  Heart,
  HelpCircle,
  Languages,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  User,
} from "lucide-react-native";
import { MotiText, MotiView } from "moti";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import your theme configuration
import { useApp } from "../../src/context/AppContext";
import { useSettings } from "../../src/context/SettingsContext";
import { colors, radius, shadows, spacing } from "../../src/theme/colors";

const { width } = Dimensions.get("window");

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { user, logout } = useApp();
  const { t } = useSettings();

  const accountItems: {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    route: Href;
  }[] = [
    {
      label: t("drawer.myProfile"),
      icon: User,
      color: colors.brand.primary,
      bgColor: colors.tint.blueLight,
      route: "/(drawer)/(tabs)/profile",
    },
    {
      label: t("drawer.myOrders"),
      icon: ShoppingBag,
      color: colors.tint.purple,
      bgColor: colors.tint.purpleLight,
      route: "/myorders/orders",
    },
    {
      label: "Booked Services",
      icon: Calendar,
      color: colors.tint.green,
      bgColor: colors.tint.greenLight,
      route: "/bookings/services",
    },
    {
      label: t("drawer.wishlist"),
      icon: Heart,
      color: colors.brand.like,
      bgColor: colors.tint.pinkLight,
      route: "/wishlist/wishlist",
    },
  ];

  const businessItems: {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    route: Href;
  }[] = [
    {
      label: t("drawer.myDukaan"),
      icon: Store,
      color: colors.tint.green,
      bgColor: colors.tint.greenLight,
      route: "/meri_dukaan/my-dukaan",
    },
    {
      label: "My Ads",
      icon: Film,
      color: colors.brand.primary,
      bgColor: colors.tint.blueLight,
      route: "/meri_dukaan/reels/dashboard",
    },
    {
      label: "Store Economics",
      icon: BarChart3,
      color: colors.tint.purple,
      bgColor: colors.tint.purpleLight,
      route: "/meri_dukaan/economics",
    },
    {
      label: t("drawer.transporter"),
      icon: Truck,
      color: colors.brand.accent,
      bgColor: colors.tint.orangeLight,
      route: "/Transporter/transporter",
    },
  ];

  const supportItems: {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    route: Href;
  }[] = [
    {
      label: t("drawer.settings"),
      icon: Settings,
      color: colors.status.warning,
      bgColor: colors.status.warningLight,
      route: "/Settings/settings",
    },
    {
      label: t("drawer.help"),
      icon: HelpCircle,
      color: colors.status.info,
      bgColor: colors.status.infoLight,
      route: "/HelpCenter/help-support",
    },
  ];

  const handleNavigation = (route: Href) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
  };

  const renderNavItem = (
    item: {
      label: string;
      icon: any;
      color: string;
      bgColor: string;
      route: Href;
    },
    index: number,
    baseDelay: number,
  ) => (
    <MotiView
      key={item.label}
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: baseDelay + index * 60 }}
    >
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.65}
        onPress={() => handleNavigation(item.route)}
      >
        <View style={styles.navItemLeft}>
          <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
            <item.icon size={19} color={item.color} strokeWidth={2.2} />
          </View>
          <Text style={styles.navLabel}>{item.label}</Text>
        </View>
        <View style={styles.chevronCircle}>
          <ChevronRight size={14} color={colors.text.tertiary} />
        </View>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* --- Profile Header with Gradient --- */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <LinearGradient
          colors={[colors.gradient.navyStart, colors.gradient.navyEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {user?.name?.charAt(0) || "V"}
              </Text>
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Vishal Kumar"}</Text>
            <Text style={styles.userEmail}>
              {user?.email || "vishal@sangam.in"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{t("drawer.customer")}</Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>

      {/* --- Navigation Sections --- */}
      <View style={styles.navSection}>
        {/* Account */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 80 }}
          style={styles.sectionLabel}
        >
          {t("drawer.account")}
        </MotiText>
        <View style={styles.navGroup}>
          {accountItems.map((item, i) => renderNavItem(item, i, 100))}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Sangam Business */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 280 }}
          style={styles.sectionLabel}
        >
          {t("drawer.business")}
        </MotiText>
        <View style={styles.navGroup}>
          {businessItems.map((item, i) => renderNavItem(item, i, 300))}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Support & Settings */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 450 }}
          style={styles.sectionLabel}
        >
          {t("drawer.support")}
        </MotiText>
        <View style={styles.navGroup}>
          {supportItems.map((item, i) => renderNavItem(item, i, 470))}
        </View>
      </View>

      {/* --- Footer --- */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600 }}
        style={styles.footer}
      >
        <TouchableOpacity style={styles.footerAction} activeOpacity={0.7}>
          <View
            style={[
              styles.footerIconBg,
              { backgroundColor: colors.tint.purpleLight },
            ]}
          >
            <Languages size={16} color={colors.tint.purple} />
          </View>
          <Text style={styles.footerActionText}>{t("drawer.langLabel")}</Text>
        </TouchableOpacity>

        <View style={styles.footerDivider} />

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <LogOut size={17} color={colors.status.error} />
          <Text style={styles.logoutText}>{t("drawer.logout")}</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Bottom spacing */}
      <View style={{ height: spacing.xl }} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerPosition: "right",
          headerShown: false,
          drawerStyle: {
            width: width * 0.82,
            backgroundColor: colors.ui.background,
            borderTopLeftRadius: radius.xl,
            borderBottomLeftRadius: radius.xl,
          },
          overlayColor: colors.ui.overlay,
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Main" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    paddingTop: Platform.OS === "ios" ? 0 : spacing.sm,
    paddingBottom: spacing.lg,
  },

  // Profile Card
  profileCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.medium,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.success,
    borderWidth: 2.5,
    borderColor: colors.gradient.navyStart,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 3,
    fontWeight: "500",
  },
  roleBadge: {
    marginTop: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.full,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Navigation
  navSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  navGroup: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.small,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  navItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  navLabel: {
    fontSize: 14.5,
    fontWeight: "600",
    color: colors.text.primary,
    letterSpacing: 0.1,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ui.background,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.ui.borderLight,
    marginVertical: spacing.lg,
    marginHorizontal: spacing.sm,
  },

  // Footer
  footer: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  footerIconBg: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  footerActionText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.ui.borderLight,
    marginVertical: spacing.sm,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.status.errorBorder,
    backgroundColor: colors.status.errorLight,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.status.error,
  },
});
