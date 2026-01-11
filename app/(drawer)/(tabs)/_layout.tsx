// app/(drawer)/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StickyHeader } from '../../../src/components/common/StickyHeader';
import { colors } from '../../../src/theme/colors';

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
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bazar"
        options={{
          title: 'Bazar',
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
        }}
      />
      {/* Moving Dhindora and Profile next to each other */}
      <Tabs.Screen
        name="dhindora"
        options={{
          title: 'Dhindora',
          tabBarIcon: ({ color }) => <Ionicons name="megaphone" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}