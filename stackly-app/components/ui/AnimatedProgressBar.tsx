import React, { useEffect, useRef } from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSegments } from 'expo-router';

export interface AnimatedProgressBarProps extends ViewProps {
  progress: number; // 0 to 100
  height?: number;
  barColor?: string;
  trackColor?: string;
  duration?: number;
  delay?: number;
  className?: string;
  barClassName?: string;
  style?: StyleProp<ViewStyle>;
  barStyle?: StyleProp<ViewStyle>;
}

const MODAL_ROUTES = new Set([
  'add-transaction',
  'add-account',
  'add-subscription',
  'settings',
  'currency-region',
]);

export function AnimatedProgressBar({
  progress,
  height = 8,
  barColor = '#3B82F6',
  trackColor = '#20283A',
  duration = 750,
  delay = 0,
  className,
  barClassName,
  style,
  barStyle,
  ...props
}: AnimatedProgressBarProps) {
  const isFocused = useIsFocused();
  const segments = useSegments();
  const animatedWidth = useSharedValue(0);
  // Only animate the fill on the FIRST time this screen is focused (app launch / initial visit)
  const hasAnimatedOnceRef = useRef(false);
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    const currentRoot = (segments[0] as string) ?? '';
    const isModal = MODAL_ROUTES.has(currentRoot);

    if (!isFocused || isModal) return;

    if (!hasAnimatedOnceRef.current) {
      // First visit — animate from 0 to target
      hasAnimatedOnceRef.current = true;
      animatedWidth.value = 0;
      animatedWidth.value = withDelay(
        delay,
        withTiming(clampedProgress, {
          duration,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      // Subsequent visits — just snap to current progress (handles value changes too)
      animatedWidth.value = withTiming(clampedProgress, { duration: 350, easing: Easing.out(Easing.ease) });
    }
  }, [isFocused, segments, clampedProgress, duration, delay]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      {...props}
      className={`w-full rounded-full overflow-hidden ${className || ''}`}
      style={[{ height, backgroundColor: trackColor }, style]}
    >
      <Animated.View
        className={`h-full rounded-full ${barClassName || ''}`}
        style={[{ backgroundColor: barColor }, animatedBarStyle, barStyle]}
      />
    </View>
  );
}

export default AnimatedProgressBar;
