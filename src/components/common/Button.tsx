import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "../../theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getButtonStyle = () => {
    if (disabled) return styles.disabled;
    switch (variant) {
      case "outline":
        return styles.outline;
      case "secondary":
        return styles.secondary;
      default:
        return styles.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return { color: colors.text.secondary };
    if (variant === "outline") return { color: colors.brand.primary };
    return { color: colors.text.inverse };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[styles.base, getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" ? colors.brand.primary : colors.text.inverse
          }
        />
      ) : (
        <Text style={[styles.text, getTextColor(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  primary: {
    backgroundColor: colors.brand.primary,
  },

  secondary: {
    backgroundColor: colors.brand.primaryLight,
  },

  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },

  disabled: {
    backgroundColor: colors.ui.border,
  },

  text: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "System",
  },
});
