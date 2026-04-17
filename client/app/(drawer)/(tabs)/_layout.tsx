// app/(drawer)/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { StickyHeader } from "../../../src/components/common/StickyHeader";
import { useSettings } from "../../../src/context/SettingsContext";
import { colors } from "../../../src/theme/colors";

export default function TabLayout() {
  const { t } = useSettings();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          header: () => <StickyHeader />,
          tabBarActiveTintColor: colors.brand.primary,
          tabBarStyle: { height: 65, paddingBottom: 10 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tab.home"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bazar"
          options={{
            title: t("tab.bazar"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="cart" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mybusz"
          options={{
            title: t("tab.mybusz"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="bag-handle" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="dhindora"
          options={{
            title: t("tab.dhindora"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="megaphone" size={24} color={color} />
            ),
            header: () => null, // Hide header for Dhindora screen
          }}
        />
        {/* Profile hidden from tab bar but still accessible via drawer */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // Hides from tab bar
            title: t("tab.profile"),
          }}
        />
      </Tabs>

      {/* Floating AI Chat Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 85,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.brand.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: colors.brand.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 6,
        }}
        activeOpacity={0.8}
        onPress={() => router.push("/chat" as any)}
      >
        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
