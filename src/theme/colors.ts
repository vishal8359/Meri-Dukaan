/**
 * Sangam Design System - Theme Configuration
 * Aesthetic: Modern Indian Hyperlocal
 */
// src/theme/colors.ts
export const colors = {
  // Brand Identity
  brand: {
    primaryLight: "#99bfc1", // Soft Clay
    secondary: "#2E2E2E", // Charcoal
    accent: "#43526b", // Earth Brown
    primary: "#2f5d60",
    // primary: "#005F73",
    // primaryLight: "#131b1c", // Soft Aqua
    // secondary: "#E9C46A", // Muted Gold
    // accent: "#0A3A40", // Deep Teal
  },

  // Interface Colors
  ui: {
    background: "#F7F4EF", // Warn off white
    surface: "#FFFFFF", // White Cards
    border: "#E9ECEF", // Soft Dividers
    overlay: "rgba(7, 59, 76, 0.5)",
  },

  // Typography
  text: {
    primary: "#1F2937", // Charcoal
    secondary: "#6C757D", // Muted Gray
    light: "#F8F9FA", // For dark backgrounds
    inverse: "#FFFFFF",
  },

  // Status Feedback
  status: {
    success: "#52B788",
    error: "#E63946",
    warning: "#FFB703",
    info: "#118AB2",
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
  lg: 20, // Sangam signature rounded look
  xl: 24,
  full: 9999,
};

// Added Elevation (Shadows) for the "Dukaan" cards
export const shadows = {
  small: {
    shadowColor: "#073B4C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#073B4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: "#073B4C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
