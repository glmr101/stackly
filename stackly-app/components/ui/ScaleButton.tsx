import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ScaleButtonProps extends PressableProps {
  activeScale?: number;
  damping?: number;
  stiffness?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function ScaleButton({
  activeScale = 0.94,
  damping = 15,
  stiffness = 320,
  onPressIn,
  onPressOut,
  style,
  className,
  children,
  disabled,
  ...props
}: ScaleButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = (event: any) => {
    if (!disabled) {
      scale.value = withSpring(activeScale, { damping, stiffness, mass: 0.8 });
      opacity.value = withSpring(0.92, { damping, stiffness });
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (!disabled) {
      scale.value = withSpring(1, { damping, stiffness, mass: 0.8 });
      opacity.value = withSpring(1, { damping, stiffness });
    }
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      className={className}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}

export default ScaleButton;
