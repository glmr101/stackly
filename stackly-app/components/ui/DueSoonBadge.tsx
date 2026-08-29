import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface DueSoonBadgeProps {
  label: string;
  isOverdue?: boolean;
}

export function DueSoonBadge({ label, isOverdue = false }: DueSoonBadgeProps) {
  const pulseOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const mainColor = isOverdue ? '#FF897D' : '#FBBF24'; // Red for overdue, yellowish-amber for due soon
  const bgColor = isOverdue ? 'rgba(255, 137, 125, 0.14)' : 'rgba(251, 191, 36, 0.14)';
  const borderColor = isOverdue ? 'rgba(255, 137, 125, 0.35)' : 'rgba(251, 191, 36, 0.35)';

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
    >
      {/* Pulsing Dot */}
      <View className="relative items-center justify-center w-2 h-2">
        <Animated.View
          style={[
            animatedDotStyle,
            {
              backgroundColor: mainColor,
            },
          ]}
          className="absolute w-2 h-2 rounded-full"
        />
        <View
          style={{ backgroundColor: mainColor }}
          className="w-1.5 h-1.5 rounded-full"
        />
      </View>

      <MaterialIcons
        name={isOverdue ? 'error-outline' : 'schedule'}
        size={13}
        color={mainColor}
      />

      <Text
        style={{ color: mainColor }}
        className="text-[11px] font-extrabold tracking-tight"
      >
        {label}
      </Text>
    </View>
  );
}

export default DueSoonBadge;
