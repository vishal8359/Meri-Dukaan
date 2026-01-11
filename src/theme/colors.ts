/**
 * Sangam Design System - Theme Configuration
 * Aesthetic: Modern Indian Hyperlocal
 */

export const colors = {
  // Brand Identity
  brand: {
    primary: '#ADC178',      // Sage Green
    primaryLight: '#DDE5B6', // Pale Lime
    secondary: '#A98467',    // Earthy Brown (Added for a complete hyperlocal feel)
    accent: '#6C584C',       // Dark Wood
  },

  // Interface Colors
  ui: {
    background: '#F0EAD2',   // Creamy Beige
    surface: '#FFFFFF',      // White Cards
    border: '#E9ECEF',       // Soft Dividers
    overlay: 'rgba(7, 59, 76, 0.5)',
  },

  // Typography
  text: {
    primary: '#073B4C',      // Deep Navy
    secondary: '#6C757D',    // Muted Gray
    light: '#F8F9FA',        // For dark backgrounds
    inverse: '#FFFFFF',
  },

  // Status Feedback
  status: {
    success: '#52B788',
    error: '#E63946',
    warning: '#FFB703',
    info: '#118AB2',
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
  full: 9999,
};

// Added Elevation (Shadows) for the "Dukaan" cards
export const shadows = {
  small: {
    shadowColor: '#073B4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#073B4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};