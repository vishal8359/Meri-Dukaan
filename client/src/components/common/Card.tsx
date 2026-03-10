// src/components/common/Card.tsx
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme/colors';

export const Card = ({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md, // Using md for card corners
    padding: spacing.sm,    // Slightly less padding for card content
    ...shadows.small,
  },
});