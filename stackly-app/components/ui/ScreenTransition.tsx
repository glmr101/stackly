import React, { useEffect, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSegments } from 'expo-router';

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
  duration = 220,
}: ScreenTransitionProps) {
  const isFocused = useIsFocused();
  const segments = useSegments();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const isInitialMount = useRef(true);
  const wasTabSwitchRef = useRef(false);

  useEffect(() => {
    const isModalOrRootScreen = segments.length > 0 && segments[0] !== '(tabs)';

    // If modal is open over this screen, do not run screen transitions
    if (isModalOrRootScreen) {
      return;
    }

    if (!isFocused) {
      wasTabSwitchRef.current = true;
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      triggerTransition();
    } else if (wasTabSwitchRef.current) {
      wasTabSwitchRef.current = false;
      triggerTransition();
    } else {
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
    }

    function triggerTransition() {
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
  }, [isFocused, segments, duration]);

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
