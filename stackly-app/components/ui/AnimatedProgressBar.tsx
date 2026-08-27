import React, { useEffect } from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface AnimatedProgressBarProps extends ViewProps {
  progress: number; // 0 to 100
  height?: number;
  barColor?: string;
  trackColor?: string;
  duration?: number;
  className?: string;
  barClassName?: string;
  style?: StyleProp<ViewStyle>;
  barStyle?: StyleProp<ViewStyle>;
}

export function AnimatedProgressBar({
  progress,
  height = 8,
  barColor = '#3B82F6',
  trackColor = '#20283A',
  duration = 800,
  className,
  barClassName,
  style,
  barStyle,
  ...props
}: AnimatedProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, duration]);

  const animatedBarStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  return (
    <View
      {...props}
      className={`w-full rounded-full overflow-hidden ${className || ''}`}
      style={[
        { height, backgroundColor: trackColor },
        style,
      ]}
    >
      <Animated.View
        className={`h-full rounded-full ${barClassName || ''}`}
        style={[
          { backgroundColor: barColor },
          animatedBarStyle,
          barStyle,
        ]}
      />
    </View>
  );
}

export default AnimatedProgressBar;
