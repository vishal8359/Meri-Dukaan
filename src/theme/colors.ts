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
  },

  // Interface Colors
  ui: {
    background: "#F5F7FA", // Cool off-white
    surface: "#FFFFFF", // White Cards
    border: "#E2E8F0", // Slate dividers
    overlay: "rgba(27, 46, 75, 0.5)",
  },

  // Typography
  text: {
    primary: "#0F172A", // Near-black
    secondary: "#64748B", // Slate gray
    light: "#F8FAFC", // For dark backgrounds
    inverse: "#FFFFFF",
  },

  // Status Feedback
  status: {
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
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
