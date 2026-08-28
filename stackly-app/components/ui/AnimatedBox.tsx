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
import { useIsFocused } from '@react-navigation/native';
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

export function AnimatedBox({
  children,
  delay = 0,
  duration = 240,
  direction = 'up',
  offset = 10,
  className,
  style,
  ...props
}: AnimatedBoxProps) {
  const isFocused = useIsFocused();
  const segments = useSegments();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const initialX = direction === 'left' ? -offset : direction === 'right' ? offset : 0;
  const initialY = direction === 'up' ? offset : direction === 'down' ? -offset : 0;

  const isInitialMount = useRef(true);
  const wasTabSwitchRef = useRef(false);

  useEffect(() => {
    const isModalOrRootScreen = segments.length > 0 && segments[0] !== '(tabs)';

    // If a modal or root screen is presented over this tab, do NOT re-trigger entrance
    if (isModalOrRootScreen) {
      return;
    }

    if (!isFocused) {
      wasTabSwitchRef.current = true;
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      triggerEntrance();
    } else if (wasTabSwitchRef.current) {
      wasTabSwitchRef.current = false;
      triggerEntrance();
    } else {
      // Returning after modal dismissal or maintaining state: keep fully visible immediately
      opacity.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    }

    function triggerEntrance() {
      opacity.value = 0;
      translateX.value = initialX;
      translateY.value = initialY;

      const animDuration = Math.min(duration, 260);

      opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: animDuration,
          easing: Easing.out(Easing.cubic),
        })
      );

      if (initialX !== 0) {
        translateX.value = withDelay(
          delay,
          withSpring(0, {
            damping: 24,
            stiffness: 260,
            mass: 0.8,
          })
        );
      } else {
        translateX.value = 0;
      }

      if (initialY !== 0) {
        translateY.value = withDelay(
          delay,
          withSpring(0, {
            damping: 24,
            stiffness: 260,
            mass: 0.8,
          })
        );
      } else {
        translateY.value = 0;
      }
    }
  }, [isFocused, segments, delay, duration, initialX, initialY]);

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
