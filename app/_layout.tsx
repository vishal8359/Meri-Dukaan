import { AppProvider } from "@/src/context/AppContext";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { NotificationProvider } from "@/src/context/NotificationContext";
import { ReelProvider } from "@/src/context/ReelContext";
import { SettingsProvider } from "@/src/context/SettingsContext";
import { useNotificationBridge } from "@/src/hooks/useNotificationBridge";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

/** Thin wrapper that activates the order→notification bridge */
function NotificationBridge({ children }: { children: React.ReactNode }) {
  useNotificationBridge();
  return <>{children}</>;
}

/**
 * AuthGate — watches auth state and silently redirects:
 *   • Logged in  → (drawer) HomeScreen  (no visible loading UI)
 *   • Logged out → auth/mobile
 * While isLoading, returns null so the native splash screen stays — zero custom loading.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = (segments[0] as string) === "auth";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/mobile" as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(drawer)/(tabs)/" as any);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // While checking AsyncStorage, render nothing (native splash stays)
  if (isLoading) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppProvider>
          <NotificationProvider>
            <NotificationBridge>
              <ReelProvider>
                <AuthGate>
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Auth Screens */}
                    <Stack.Screen
                      name="auth/mobile"
                      options={{ headerShown: false, animation: "fade" }}
                    />
                    <Stack.Screen
                      name="auth/otp"
                      options={{
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="auth/personal-details"
                      options={{
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="auth/email-otp"
                      options={{
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />

                    {/* 1. Register the Drawer */}
                    <Stack.Screen name="(drawer)" />

                    {/* 2. Dynamic Store Route */}
                    <Stack.Screen
                      name="dukaan/[id]"
                      options={{
                        headerShown: true,
                        title: "Store Details",
                        presentation: "card",
                      }}
                    />

                    {/* Category Products Page */}
                    <Stack.Screen
                      name="category/[id]"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 3. Cart Screen */}
                    <Stack.Screen
                      name="cart/cart"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 4. Notifications Screen */}
                    <Stack.Screen
                      name="notification/notifications"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 5. Orders Screen */}
                    <Stack.Screen
                      name="myorders/orders"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* Order Detail Screen */}
                    <Stack.Screen
                      name="myorders/[id]"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* Following Stores Screen */}
                    <Stack.Screen
                      name="dukaan/following"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 6. Wishlist Screen */}
                    <Stack.Screen
                      name="wishlist/wishlist"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 7. Edit Profile Screen */}
                    <Stack.Screen
                      name="Profile/edit-profile"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 8. Settings Screen */}
                    <Stack.Screen
                      name="Settings/settings"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 9. Help & Support Screen */}
                    <Stack.Screen
                      name="HelpCenter/help-support"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 10. My Dukaan Screens */}
                    <Stack.Screen
                      name="meri_dukaan/my-dukaan"
                      options={{ headerShown: false, presentation: "card" }}
                    />
                    <Stack.Screen
                      name="meri_dukaan/create-store"
                      options={{ headerShown: false, presentation: "card" }}
                    />
                    <Stack.Screen
                      name="meri_dukaan/inventory/add-product"
                      options={{ headerShown: false, presentation: "card" }}
                    />
                    <Stack.Screen
                      name="meri_dukaan/inventory/add-service"
                      options={{ headerShown: false, presentation: "card" }}
                    />
                    <Stack.Screen
                      name="meri_dukaan/reels/upload-reel"
                      options={{ headerShown: false, presentation: "card" }}
                    />
                    <Stack.Screen
                      name="meri_dukaan/economics"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* 11. Transporter Screen */}
                    <Stack.Screen
                      name="Transporter/transporter"
                      options={{ headerShown: false, presentation: "card" }}
                    />

                    {/* Booked Services Screen */}
                    <Stack.Screen
                      name="bookings/services"
                      options={{ headerShown: false, presentation: "card" }}
                    />
                  </Stack>
                  <Toast />
                </AuthGate>
              </ReelProvider>
            </NotificationBridge>
          </NotificationProvider>
        </AppProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
