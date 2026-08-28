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

const MODAL_ROUTES = new Set([
  'add-transaction',
  'add-account',
  'add-subscription',
  'settings',
  'currency-region',
]);

export function ScreenTransition({
  children,
  style,
  className = 'flex-1',
  preset = 'fade-slide',
  duration = 240,
}: ScreenTransitionProps) {
  const isFocused = useIsFocused();
  const segments = useSegments();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const scale = useSharedValue(0.985);

  const lostFocusToModalRef = useRef(false);

  const triggerTransition = () => {
    opacity.value = 0;
    translateY.value = 10;
    scale.value = 0.985;

    opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
    translateY.value = withSpring(0, { damping: 22, stiffness: 240, mass: 0.8 });
    scale.value = withSpring(1, { damping: 22, stiffness: 240, mass: 0.8 });
  };

  useEffect(() => {
    const currentRoot = (segments[0] as string) ?? '';
    const isModal = MODAL_ROUTES.has(currentRoot);

    if (!isFocused) {
      if (isModal) {
        lostFocusToModalRef.current = true;
      } else {
        // Pre-reset while hidden so re-entry always starts clean
        opacity.value = 0;
        translateY.value = 10;
        scale.value = 0.985;
      }
      return;
    }

    const wasModal = lostFocusToModalRef.current;
    lostFocusToModalRef.current = false;

    if (wasModal) {
      // Coming back from a modal — snap to visible instantly
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
    } else {
      // Every other focus gain — animate in
      triggerTransition();
    }
  }, [isFocused, segments]);

  const animatedStyle = useAnimatedStyle(() => {
    if (preset === 'fade') return { opacity: opacity.value };
    if (preset === 'fade-scale') return { opacity: opacity.value, transform: [{ scale: scale.value }] };
    return { opacity: opacity.value, transform: [{ translateY: translateY.value }] };
  });

  return (
    <Animated.View className={className} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default ScreenTransition;
