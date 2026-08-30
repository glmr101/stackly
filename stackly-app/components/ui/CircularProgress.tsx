import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

interface CircularProgressProps {
  progress: number; // 0 to 100+
  size?: number; // diameter in px
  strokeWidth?: number; // border thickness
  color?: string; // active progress color
  trackColor?: string; // background track color
  children?: React.ReactNode;
  duration?: number;
}

export function CircularProgress({
  progress,
  size = 56,
  strokeWidth = 5,
  color = "#4DE082",
  trackColor = "#171B26",
  children,
  duration = 800,
}: CircularProgressProps) {
  const animatedProgress = useSharedValue(0);

  // Clamp progress for the ring rendering (0 to 100)
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, duration]);

  // First half (0 - 50% -> 0 - 180 deg)
  const rightHalfAnimatedStyle = useAnimatedStyle(() => {
    const deg = interpolate(
      animatedProgress.value,
      [0, 50, 100],
      [-135, 45, 45]
    );
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
  });

  // Second half (50 - 100% -> 180 - 360 deg)
  const leftHalfAnimatedStyle = useAnimatedStyle(() => {
    const deg = interpolate(
      animatedProgress.value,
      [0, 50, 100],
      [-135, -135, 45]
    );
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
  });

  const halfSize = size / 2;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
      ]}
    >
      {/* Background Track Circle */}
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: trackColor,
          },
        ]}
      />

      {/* Right Half Container (0% to 50%) */}
      <View
        style={[
          styles.halfContainer,
          {
            width: halfSize,
            height: size,
            right: 0,
            top: 0,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: "transparent",
              borderTopColor: color,
              borderRightColor: color,
              right: 0,
              top: 0,
            },
            rightHalfAnimatedStyle,
          ]}
        />
      </View>

      {/* Left Half Container (50% to 100%) */}
      <View
        style={[
          styles.halfContainer,
          {
            width: halfSize,
            height: size,
            left: 0,
            top: 0,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: "transparent",
              borderBottomColor: color,
              borderLeftColor: color,
              left: 0,
              top: 0,
            },
            leftHalfAnimatedStyle,
          ]}
        />
      </View>

      {/* Centered Children (Icon, percentage text, etc.) */}
      {children && (
        <View style={styles.centerContent}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "absolute",
  },
  halfContainer: {
    position: "absolute",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
