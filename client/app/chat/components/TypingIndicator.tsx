import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  type SharedValue,
} from "react-native-reanimated";
import { colors } from "../../../src/theme/colors";

export default function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const anim = (sv: SharedValue<number>, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          true
        )
      );
    };
    anim(dot1, 0);
    anim(dot2, 150);
    anim(dot3, 300);
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const style3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, style1]} />
        <Animated.View style={[styles.dot, style2]} />
        <Animated.View style={[styles.dot, style3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
    opacity: 0.5,
  },
});
