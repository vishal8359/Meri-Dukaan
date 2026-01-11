// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This will automatically look for an index file in this folder */}
      <Stack.Screen name="index" />
    </Stack>
  );
}