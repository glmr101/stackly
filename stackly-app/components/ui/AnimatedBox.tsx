import React, { useEffect, useRef } from 'react';
import { StyleProp, ViewStyle, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useIsFocused } from '@/hooks/useIsFocused';
import { useSegments } from 'expo-router';

export interface AnimatedBoxProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  offset?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const MODAL_ROUTES = new Set([
  'add-transaction',
  'add-account',
  'add-subscription',
  'settings',
  'currency-region',
]);

export function AnimatedBox({
  children,
  delay = 0,
  duration = 280,
  direction = 'up',
  offset = 12,
  className,
  style,
  ...props
}: AnimatedBoxProps) {
  const isFocused = useIsFocused();
  const segments = useSegments();

  const initialX = direction === 'left' ? -offset : direction === 'right' ? offset : 0;
  const initialY = direction === 'up' ? offset : direction === 'down' ? -offset : 0;

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);

  // Track whether focus was lost due to a modal overlay
  const lostFocusToModalRef = useRef(false);
  const prevFocusedRef = useRef<boolean | null>(null);

  const runEntranceAnimation = () => {
    opacity.value = 0;
    translateX.value = initialX;
    translateY.value = initialY;

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );

    if (initialX !== 0) {
      translateX.value = withDelay(delay, withSpring(0, { damping: 22, stiffness: 220, mass: 0.8 }));
    }

    if (initialY !== 0) {
      translateY.value = withDelay(delay, withSpring(0, { damping: 22, stiffness: 220, mass: 0.8 }));
    }
  };

  useEffect(() => {
    const currentRoot = (segments[0] as string) ?? '';
    const isModal = MODAL_ROUTES.has(currentRoot);

    if (!isFocused) {
      // Track why we lost focus
      if (isModal) {
        lostFocusToModalRef.current = true;
      }
      // Pre-reset while not visible (only when not modal) so return plays clean
      if (!isModal) {
        opacity.value = 0;
        translateX.value = initialX;
        translateY.value = initialY;
      }
      prevFocusedRef.current = false;
      return;
    }

    // We are now focused
    const wasModal = lostFocusToModalRef.current;
    lostFocusToModalRef.current = false;
    prevFocusedRef.current = true;

    if (wasModal) {
      // Coming back from a modal — snap to visible with no animation delay
      opacity.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    } else {
      // Every other focus gain (initial mount, tab switch, stack navigation) — animate in
      runEntranceAnimation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, segments]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View className={className} style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
}

export default AnimatedBox;
