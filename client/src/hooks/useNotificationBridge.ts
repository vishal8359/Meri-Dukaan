// src/hooks/useNotificationBridge.ts
//
// Handles:
// 1. Push notification permission + FCM device token registration
// 2. Incoming push notification handling (foreground + tap response)
// 3. Refreshes the notification list on incoming push events

import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import * as notificationApi from "../api/notifications";

/* expo-notifications + expo-device are optional peer deps.
   If not installed or running in Expo Go (SDK 53+), push registration
   is silently skipped and the client falls back to polling. */
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require("expo-notifications");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Device = require("expo-device");
  } catch {
    // Push notifications unavailable — client falls back to polling
  }
}

async function registerPushToken(authToken: string) {
  if (!Notifications || !Device) return;
  if (!Device.isDevice) return; // emulators can't receive push

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B35",
    });
  }

  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const platform = Platform.OS === "ios" ? "ios" : "android";
    await notificationApi.registerDevice(authToken, tokenData.data, platform);
  } catch (err) {
    console.warn("[push] Token registration failed:", err);
  }
}

/**
 * Drop this hook into any top-level component that is inside both
 * AuthProvider and NotificationProvider.
 *
 * It registers the device for push notifications and listens for
 * incoming pushes to refresh the notification list.
 */
export function useNotificationBridge() {
  const { authToken, isAuthenticated } = useAuth();
  const { refresh } = useNotifications();
  const registeredRef = useRef(false);

  // Register FCM device token once after authentication
  useEffect(() => {
    if (!isAuthenticated || !authToken || registeredRef.current) return;
    registeredRef.current = true;
    registerPushToken(authToken);
  }, [isAuthenticated, authToken]);

  // Listen for incoming push notifications → refresh notification list
  useEffect(() => {
    if (!Notifications || !isAuthenticated) return;

    // Foreground push received
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      refresh();
    });

    // User tapped a push notification
    const responseSub =
      Notifications.addNotificationResponseReceivedListener(() => {
        refresh();
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [isAuthenticated, refresh]);
}
