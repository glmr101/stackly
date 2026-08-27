import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { ScaleButton } from "./ScaleButton";

export interface ToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

export function Toggle({
  value,
  onValueChange,
  activeColor = "#3B82F6",
  inactiveColor = "#262A35",
  thumbColor = "#FFFFFF",
}: ToggleProps) {
  const offset = useSharedValue(value ? 20 : 0);
  const colorProgress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    offset.value = withSpring(value ? 20 : 0, {
      damping: 15,
      stiffness: 280,
    });
    colorProgress.value = withSpring(value ? 1 : 0, {
      damping: 18,
      stiffness: 240,
    });
  }, [value]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [inactiveColor, activeColor]
      ),
    };
  });

  return (
    <ScaleButton
      activeScale={0.92}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View
        className="w-12 h-7 rounded-full justify-center px-1 border border-outline-variant/30 shadow-inner"
        style={animatedTrackStyle}
      >
        <Animated.View
          className="w-5 h-5 rounded-full shadow-md"
          style={[{ backgroundColor: thumbColor }, animatedThumbStyle]}
        />
      </Animated.View>
    </ScaleButton>
  );
}

export default Toggle;
