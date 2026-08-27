import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

export interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  preset?: 'fade-slide' | 'fade-scale' | 'fade';
  duration?: number;
}

export function ScreenTransition({
  children,
  style,
  className = 'flex-1',
  preset = 'fade-slide',
  duration = 240,
}: ScreenTransitionProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0;
      translateY.value = 10;
      scale.value = 0.985;

      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withSpring(0, {
        damping: 22,
        stiffness: 240,
        mass: 0.8,
      });

      scale.value = withSpring(1, {
        damping: 22,
        stiffness: 240,
        mass: 0.8,
      });
    }
  }, [isFocused, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    if (preset === 'fade') {
      return {
        opacity: opacity.value,
      };
    }

    if (preset === 'fade-scale') {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    }

    // Default: fade-slide
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View className={className} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default ScreenTransition;
