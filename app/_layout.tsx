import { AppProvider } from "@/src/context/AppContext";
import { ReelProvider } from "@/src/context/ReelContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AppProvider>
      <ReelProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 1. Register the Drawer */}
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

          {/* 3. Register Cart Screen - Path: app/cart/cart.tsx */}
          <Stack.Screen
            name="cart/cart"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 4. Register Notifications Screen - Path: app/notification/notifications.tsx */}
          <Stack.Screen
            name="notification/notifications"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 5. Register Orders Screen - Path: app/myorders/orders.tsx */}
          <Stack.Screen
            name="myorders/orders"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 6. Register Wishlist Screen - Path: app/wishlist/wishlist.tsx */}
          <Stack.Screen
            name="wishlist/wishlist"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 7. Register Edit Profile Screen - Path: app/Profile/edit-profile.tsx */}
          <Stack.Screen
            name="Profile/edit-profile"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 8. Register Settings Screen - Path: app/Settings/settings.tsx */}
          <Stack.Screen
            name="Settings/settings"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 9. Register Help & Support Screen - Path: app/HelpCenter/help-support.tsx */}
          <Stack.Screen
            name="HelpCenter/help-support"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 10. Register My Dukaan Screen - Path: app/meri_dukaan/my-dukaan.tsx */}
          <Stack.Screen
            name="meri_dukaan/my-dukaan"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          {/* 11. Register Transporter Screen - Path: app/Transporter/transporter.tsx */}
          <Stack.Screen
            name="Transporter/transporter"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
        </Stack>
      </ReelProvider>
    </AppProvider>
  );
}
