import React, { useEffect } from 'react';
import { StyleProp, ViewStyle, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

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
  duration = 360,
  direction = 'up',
  offset = 14,
  className,
  style,
  ...props
}: AnimatedBoxProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const initialX = direction === 'left' ? -offset : direction === 'right' ? offset : 0;
  const initialY = direction === 'up' ? offset : direction === 'down' ? -offset : 0;

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0;
      translateX.value = initialX;
      translateY.value = initialY;

      const timeout = setTimeout(() => {
        opacity.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.cubic),
        });

        translateX.value = withSpring(0, {
          damping: 22,
          stiffness: 220,
          mass: 0.8,
        });

        translateY.value = withSpring(0, {
          damping: 22,
          stiffness: 220,
          mass: 0.8,
        });
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [isFocused, delay, duration, initialX, initialY]);

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
