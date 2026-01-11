// app/_layout.tsx
import { AppProvider } from '@/src/context/AppContext';
import { Stack } from 'expo-router';
export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* We use (tabs) as the main route */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProvider>
  );
}