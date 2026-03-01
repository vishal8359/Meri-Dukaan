// app/(drawer)/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StickyHeader } from "../../../src/components/common/StickyHeader";
import { colors } from "../../../src/theme/colors";

export default function TabLayout() {
  return (
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
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bazar"
        options={{
          title: "Bazar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mybusz"
        options={{
          title: "myBusz",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag-handle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dhindora"
        options={{
          title: "Dhindora",
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
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
