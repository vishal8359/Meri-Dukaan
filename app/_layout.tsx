// app/_layout.tsx
import { AppProvider } from "@/src/context/AppContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. Register the Drawer (which contains your Tabs) */}
        <Stack.Screen name="(drawer)" />

        {/* 2. Register the Dynamic Store Route */}
        <Stack.Screen
          name="dukaan/[id]"
          options={{
            headerShown: true,
            title: "Store Details",
            presentation: "card",
          }}
        />

        {/* 3. Register Orders Screen */}
        <Stack.Screen
          name="orders"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />

        {/* 4. Register Wishlist Screen */}
        <Stack.Screen
          name="wishlist"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />

        {/* 5. Register My Dukaan Screen (if you have it) */}
        <Stack.Screen
          name="my-dukaan"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />

        {/* 6. Register Transporter Screen (optional) */}
        <Stack.Screen
          name="transporter"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
      </Stack>
    </AppProvider>
  );
}
