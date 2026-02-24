// app/(drawer)/_layout.tsx
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter, type Href } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  ChevronRight,
  Heart,
  Languages,
  LogOut,
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
import { colors, radius, shadows, spacing } from "../../src/theme/colors";

const { width } = Dimensions.get("window");

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { user, logout } = useApp();

  const accountItems: {
    label: string;
    icon: any;
    color: string;
    route: Href;
  }[] = [
    {
      label: "My Profile",
      icon: User,
      color: colors.brand.primary,
      route: "/(drawer)/(tabs)/profile",
    },
    {
      label: "My Orders",
      icon: ShoppingBag,
      color: colors.brand.primary,
      route: "/myorders/orders",
    },
    {
      label: "Wishlist",
      icon: Heart,
      color: colors.brand.primary,
      route: "/wishlist/wishlist",
    },
  ];

  const businessItems: {
    label: string;
    icon: any;
    color: string;
    route: Href;
  }[] = [
    {
      label: "My Dukaan",
      icon: Store,
      color: colors.brand.primaryLight,
      route: "/meri_dukaan/my-dukaan",
    },
    {
      label: "Join as Transporter",
      icon: Truck,
      color: colors.brand.accent,
      route: "/Transporter/transporter",
    },
  ];

  const handleNavigation = (route: Href) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
    // Optionally navigate to login screen if you have one
    // router.replace("/login");
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
      scrollEnabled={false} // Optimized for single screen feel
    >
      {/* --- Profile Card Section --- */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
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
            <Text style={styles.roleText}>Customer</Text>
          </View>
        </View>
      </MotiView>

      <View style={styles.navSection}>
        {/* --- Navigation Group: Account --- */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.sectionLabel}
        >
          Account Settings
        </MotiText>

        {accountItems.map((item, index) => (
          <MotiView
            key={item.label}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 100 + index * 50 }}
          >
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.navItemLeft}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: colors.ui.background },
                  ]}
                >
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.navLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </MotiView>
        ))}

        {/* --- Navigation Group: Business --- */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={[styles.sectionLabel, { marginTop: spacing.xl }]}
        >
          Sangam Business
        </MotiText>

        {businessItems.map((item, index) => (
          <MotiView
            key={item.label}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 300 + index * 50 }}
          >
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.navItemLeft}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: colors.brand.primaryLight + "15" },
                  ]}
                >
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.navLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>

      {/* --- Bottom Utility Section --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerAction}>
          <Languages size={18} color={colors.brand.accent} />
          <Text style={styles.footerActionText}>English (India)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerAction, styles.logoutAction]}
          onPress={handleLogout}
        >
          <LogOut size={18} color={colors.status.error} />
          <Text
            style={[styles.footerActionText, { color: colors.status.error }]}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
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
            width: width * 0.8,
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
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 0 : spacing.xl,
  },
  profileCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.medium,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: colors.text.light,
    fontSize: 20,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.success,
    borderWidth: 2,
    borderColor: colors.ui.surface,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.ui.background,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand.accent,
    textTransform: "uppercase",
  },
  navSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  navItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  footer: {
    marginTop: "auto",
    padding: spacing.lg,
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    gap: spacing.md,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  footerActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  logoutAction: {
    marginTop: spacing.xs,
  },
});
