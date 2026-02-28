/**
 * Sangam Design System - Theme Configuration
 * Aesthetic: Deep Navy · Bold & Professional
 * Complements the warm mybusz logo palette
 */
// src/theme/colors.ts
export const colors = {
  // Brand Identity — deep navy palette
  brand: {
    primary: "#1B2E4B", // Deep Navy
    primaryLight: "#2C4A72", // Lighter Navy
    secondary: "#F0A050", // Warm Gold (logo accent)
    accent: "#E8734A", // Burnt Orange (logo complement)
    star: "#e5ba70", // Star / rating gold
    like: "#EF4444", // Like / heart red
    verified: "#3B82F6", // Verified blue
    dhindoraAccent: "#ff4081", // Dhindora pink (likes, hashtags)
    dhindoraVerified: "#00BAFF", // Dhindora verified badge
    whatsapp: "#25D366", // WhatsApp brand green
    messenger: "#0084FF", // Messenger brand blue
  },

  // Interface Colors
  ui: {
    background: "#F5F7FA", // Cool off-white
    backgroundAlt: "#F1F5F9", // Slightly darker alt bg
    surface: "#FFFFFF", // White Cards
    surfaceHover: "#F8FAFC", // Light surface on hover/press
    border: "#E2E8F0", // Slate dividers
    borderLight: "#F1F5F9", // Lighter divider
    divider: "#E2E8F0", // Same as border, semantic alias
    overlay: "rgba(27, 46, 75, 0.5)",
    muted: "#94A3B8", // Muted/placeholder icons
    disabled: "#CBD5E1", // Disabled state
  },

  // Typography
  text: {
    primary: "#0F172A", // Near-black
    secondary: "#64748B", // Slate gray
    tertiary: "#94A3B8", // Lighter gray
    light: "#F8FAFC", // For dark backgrounds
    inverse: "#FFFFFF",
    heading: "#1E293B", // Slightly softer than primary
    caption: "#475569", // For small text / captions
  },

  // Status Feedback
  status: {
    success: "#22C55E",
    successDark: "#16A34A",
    successLight: "#DCFCE7",
    error: "#EF4444",
    errorDark: "#991B1B",
    errorLight: "#FEF2F2",
    errorBorder: "#FECACA",
    warning: "#F59E0B",
    warningDark: "#B45309",
    warningLight: "#FEF3C7",
    info: "#3B82F6",
    infoLight: "#DBEAFE",
    infoBorder: "#BFDBFE",
    infoDark: "#1E40AF",
  },

  // Semantic / Contextual tints
  tint: {
    purple: "#8B5CF6",
    purpleLight: "#EDE9FE",
    green: "#10B981",
    greenLight: "#F0FDF4",
    blue: "#3B82F6",
    blueLight: "#EFF6FF",
    gold: "#F59E0B",
    goldLight: "#FEF3C7",
    orange: "#E8734A",
    orangeLight: "#FFFBEB",
    pink: "#EC4899",
    pinkLight: "#FCE7F3",
  },

  // Gradient presets (for backgrounds)
  gradient: {
    navyStart: "#1B2E4B",
    navyEnd: "#2C4A72",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
};

// Elevation (Shadows) — cool navy-toned
export const shadows = {
  small: {
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
