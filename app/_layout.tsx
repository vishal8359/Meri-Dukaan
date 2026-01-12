// app/_layout.tsx
import { AppProvider } from '@/src/context/AppContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. Register the Drawer (which contains your Tabs) */}
        <Stack.Screen name="(drawer)" />

        {/* 2. Register the Dynamic Store Route */}
        {/* We set headerShown: true so you get a 'Back' button automatically */}
        <Stack.Screen 
          name="dukaan/[id]" 
          options={{ 
            headerShown: true, 
            title: 'Store Details' 
          }} 
        />
      </Stack>
    </AppProvider>
  );
}