// src/components/common/SplashOverlay.tsx
// Branded splash overlay — Blinkit-style animated transition
// Renders on top of all content, fades out once auth + navigation are ready.

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

const { width, height } = Dimensions.get("window");

// Duration (ms) the overlay stays visible after being told to hide
const FADE_OUT_DURATION = 400;
// Small delay before starting the fade so the underlying screen settles
const HIDE_DELAY = 150;

interface SplashOverlayProps {
  /** Set to true once auth + navigation are resolved */
  visible: boolean;
}

export default function SplashOverlay({ visible }: SplashOverlayProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const [unmounted, setUnmounted] = useState(false);

  // ─── Logo entrance + pulse loop ───
  useEffect(() => {
    // Scale the logo in
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Fade in tagline
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Pulsing dots (loading indicator)
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Gentle pulse on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [logoScale, logoPulse, taglineOpacity, dotScale]);

  // ─── Fade-out when no longer visible ───
  useEffect(() => {
    if (visible) return;

    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setUnmounted(true);
      });
    }, HIDE_DELAY);

    return () => clearTimeout(timeout);
  }, [visible, opacity]);

  if (unmounted) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <LinearGradient
        colors={["#1B2E4B", "#203659", "#2C4A72"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {/* ── Logo ── */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: Animated.multiply(logoScale, logoPulse) },
              ],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* ── App Name ── */}
        <Animated.View style={[styles.textContainer, { opacity: taglineOpacity }]}>
          <Text style={styles.appName}>Sangam</Text>
          <Text style={styles.tagline}>Your Neighbourhood, Online</Text>
        </Animated.View>

        {/* ── Loading Dots ── */}
        <Animated.View style={[styles.dotsContainer, { opacity: taglineOpacity }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      scale: dotScale.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: i === 1 ? [1, 0.3] : [0.3, 1],
                      }),
                    },
                  ],
                  opacity: dotScale.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: i === 1 ? [1, 0.4] : [0.4, 1],
                  }),
                },
              ]}
            />
          ))}
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Logo
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.2)",
    // Soft glow
    shadowColor: "#F0A050",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 70,
    height: 70,
  },

  // Text
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.8,
  },

  // Loading dots
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    bottom: height * 0.12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.secondary, // warm gold
  },
});
