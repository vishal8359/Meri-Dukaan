// src/context/SettingsContext.tsx
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

// --- Types ---
export type AppLanguage = "en" | "hi";
export type AppTheme = "light" | "dark" | "system";

export interface NotificationPrefs {
  orders: boolean;
  promotions: boolean;
  chat: boolean;
  appUpdates: boolean;
}

interface SettingsContextType {
  // Language
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;

  // Theme / Dark Mode
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDark: boolean;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  notificationPrefs: NotificationPrefs;
  updateNotificationPref: (
    key: keyof NotificationPrefs,
    value: boolean,
  ) => void;

  // Location
  locationEnabled: boolean;
  setLocationEnabled: (v: boolean) => void;
}

// --- Translation Strings ---
const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Settings Screen
    "settings.title": "Settings",
    "settings.subtitle": "Manage your preferences",
    "settings.account": "Account",
    "settings.appearance": "Appearance",
    "settings.security": "Security & Privacy",
    "settings.data": "Data",
    "settings.dangerZone": "Danger Zone",

    // Account section
    "settings.notifications": "Notifications",
    "settings.notifications.desc": "Manage notification preferences",
    "settings.language": "Language",
    "settings.language.desc": "English",
    "settings.location": "Location Services",
    "settings.location.desc": "Allow app to access your location",

    // Appearance
    "settings.darkMode": "Dark Mode",
    "settings.darkMode.desc": "Switch between light and dark theme",
    "settings.theme": "Theme",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.system": "System",

    // Security
    "settings.changePassword": "Change Password",
    "settings.changePassword.desc": "Update your password",
    "settings.privacy": "Privacy Policy",
    "settings.privacy.desc": "Read our privacy policy",
    "settings.terms": "Terms of Service",
    "settings.terms.desc": "Read terms and conditions",

    // Data
    "settings.clearCache": "Clear Cache",
    "settings.clearCache.desc": "Free up storage space",

    // Danger
    "settings.deleteAccount": "Delete Account",

    // General
    "settings.version": "Sangam v1.0.0",
    "settings.build": "Build 2024.01.20",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.success": "Success",
    "common.error": "Error",

    // Language selection
    "language.title": "Select Language",
    "language.current": "Current Language",
    "language.english": "English",
    "language.hindi": "Hindi",
    "language.changed": "Language changed successfully!",

    // Notifications page
    "notifications.title": "Notification Preferences",
    "notifications.subtitle": "Choose what you want to be notified about",
    "notifications.master": "All Notifications",
    "notifications.master.desc": "Enable or disable all notifications",
    "notifications.orders": "Order Updates",
    "notifications.orders.desc": "Delivery status, order confirmations",
    "notifications.promotions": "Promotions & Offers",
    "notifications.promotions.desc": "Deals, discounts, and seasonal offers",
    "notifications.chat": "Chat Messages",
    "notifications.chat.desc": "Messages from stores and support",
    "notifications.appUpdates": "App Updates",
    "notifications.appUpdates.desc": "New features and improvements",

    // Appearance page
    "appearance.title": "Appearance",
    "appearance.subtitle": "Customize how Sangam looks",
    "appearance.themeMode": "Theme Mode",
    "appearance.preview": "Preview",

    // Change Password
    "password.title": "Change Password",
    "password.current": "Current Password",
    "password.new": "New Password",
    "password.confirm": "Confirm New Password",
    "password.requirements": "Password Requirements:",
    "password.req1": "At least 8 characters",
    "password.req2": "One uppercase letter",
    "password.req3": "One number",
    "password.req4": "One special character",
    "password.change": "Change Password",
    "password.forgot": "Forgot Password?",
    "password.success": "Password changed successfully!",
    "password.strength": "Password Strength",
    "password.weak": "Weak",
    "password.fair": "Fair",
    "password.good": "Good",
    "password.strong": "Strong",
  },
  hi: {
    // Settings Screen
    "settings.title": "सेटिंग्स",
    "settings.subtitle": "अपनी पसंद प्रबंधित करें",
    "settings.account": "खाता",
    "settings.appearance": "दिखावट",
    "settings.security": "सुरक्षा और गोपनीयता",
    "settings.data": "डेटा",
    "settings.dangerZone": "खतरनाक क्षेत्र",

    // Account section
    "settings.notifications": "सूचनाएं",
    "settings.notifications.desc": "सूचना प्राथमिकताएं प्रबंधित करें",
    "settings.language": "भाषा",
    "settings.language.desc": "हिन्दी",
    "settings.location": "स्थान सेवाएं",
    "settings.location.desc": "ऐप को आपका स्थान एक्सेस करने दें",

    // Appearance
    "settings.darkMode": "डार्क मोड",
    "settings.darkMode.desc": "लाइट और डार्क थीम के बीच स्विच करें",
    "settings.theme": "थीम",
    "settings.theme.light": "लाइट",
    "settings.theme.dark": "डार्क",
    "settings.theme.system": "सिस्टम",

    // Security
    "settings.changePassword": "पासवर्ड बदलें",
    "settings.changePassword.desc": "अपना पासवर्ड अपडेट करें",
    "settings.privacy": "गोपनीयता नीति",
    "settings.privacy.desc": "हमारी गोपनीयता नीति पढ़ें",
    "settings.terms": "सेवा की शर्तें",
    "settings.terms.desc": "नियम और शर्तें पढ़ें",

    // Data
    "settings.clearCache": "कैश साफ़ करें",
    "settings.clearCache.desc": "स्टोरेज स्पेस खाली करें",

    // Danger
    "settings.deleteAccount": "खाता हटाएं",

    // General
    "settings.version": "संगम v1.0.0",
    "settings.build": "बिल्ड 2024.01.20",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.back": "वापस",
    "common.success": "सफल",
    "common.error": "त्रुटि",

    // Language selection
    "language.title": "भाषा चुनें",
    "language.current": "वर्तमान भाषा",
    "language.english": "अंग्रेज़ी",
    "language.hindi": "हिन्दी",
    "language.changed": "भाषा सफलतापूर्वक बदल दी गई!",

    // Notifications page
    "notifications.title": "सूचना प्राथमिकताएं",
    "notifications.subtitle": "चुनें कि आपको किस बारे में सूचित किया जाए",
    "notifications.master": "सभी सूचनाएं",
    "notifications.master.desc": "सभी सूचनाएं सक्षम या अक्षम करें",
    "notifications.orders": "ऑर्डर अपडेट",
    "notifications.orders.desc": "डिलीवरी स्थिति, ऑर्डर पुष्टि",
    "notifications.promotions": "प्रमोशन और ऑफ़र",
    "notifications.promotions.desc": "डील, छूट और मौसमी ऑफ़र",
    "notifications.chat": "चैट संदेश",
    "notifications.chat.desc": "स्टोर और सपोर्ट से संदेश",
    "notifications.appUpdates": "ऐप अपडेट",
    "notifications.appUpdates.desc": "नई सुविधाएं और सुधार",

    // Appearance page
    "appearance.title": "दिखावट",
    "appearance.subtitle": "संगम का लुक कस्टमाइज़ करें",
    "appearance.themeMode": "थीम मोड",
    "appearance.preview": "पूर्वावलोकन",

    // Change Password
    "password.title": "पासवर्ड बदलें",
    "password.current": "वर्तमान पासवर्ड",
    "password.new": "नया पासवर्ड",
    "password.confirm": "नया पासवर्ड पुष्टि करें",
    "password.requirements": "पासवर्ड आवश्यकताएं:",
    "password.req1": "कम से कम 8 अक्षर",
    "password.req2": "एक बड़ा अक्षर",
    "password.req3": "एक संख्या",
    "password.req4": "एक विशेष अक्षर",
    "password.change": "पासवर्ड बदलें",
    "password.forgot": "पासवर्ड भूल गए?",
    "password.success": "पासवर्ड सफलतापूर्वक बदल दिया गया!",
    "password.strength": "पासवर्ड की मजबूती",
    "password.weak": "कमज़ोर",
    "password.fair": "ठीक",
    "password.good": "अच्छा",
    "password.strong": "मजबूत",
  },
};

// --- Context ---
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    {
      orders: true,
      promotions: true,
      chat: true,
      appUpdates: true,
    },
  );
  const [locationEnabled, setLocationEnabled] = useState(true);

  const isDark = theme === "dark";

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    // In production: persist to AsyncStorage
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    // In production: persist to AsyncStorage
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] || translations.en[key] || key;
    },
    [language],
  );

  const updateNotificationPref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      theme,
      setTheme,
      isDark,
      notificationsEnabled,
      setNotificationsEnabled,
      notificationPrefs,
      updateNotificationPref,
      locationEnabled,
      setLocationEnabled,
    }),
    [
      language,
      setLanguage,
      t,
      theme,
      setTheme,
      isDark,
      notificationsEnabled,
      notificationPrefs,
      updateNotificationPref,
      locationEnabled,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
