import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ScaleButton } from './ScaleButton';

export interface UndoToastProps {
  visible: boolean;
  message: string;
  duration?: number; // duration in ms, default 5000
  bottomOffset?: number; // custom bottom offset in px
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({
  visible,
  message,
  duration = 5000,
  bottomOffset,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  const insets = useSafeAreaInsets();
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(duration / 1000));
  const progress = useSharedValue(1);
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      const initialSeconds = Math.ceil(duration / 1000);
      setSecondsRemaining(initialSeconds);

      // Reset animation values
      progress.value = 1;
      translateY.value = 80;
      opacity.value = 0;

      // Entrance animation
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 220,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 250 });

      // Progress bar animation
      progress.value = withTiming(0, {
        duration,
        easing: Easing.linear,
      });

      // Countdown interval
      let currentSec = initialSeconds;
      intervalRef.current = setInterval(() => {
        currentSec -= 1;
        if (currentSec >= 0) {
          setSecondsRemaining(currentSec);
        }
      }, 1000);

      // Auto-dismiss timeout
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    } else {
      clearTimers();
      translateY.value = withTiming(80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }

    return () => {
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration]);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleDismiss = () => {
    clearTimers();
    translateY.value = withTiming(80, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  const handleUndoPress = () => {
    clearTimers();
    translateY.value = withTiming(80, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onUndo)();
      }
    });
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progress.value * 100))}%`,
  }));

  if (!visible) return null;

  const computedBottom =
    bottomOffset !== undefined ? bottomOffset : insets.bottom + 84;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: computedBottom },
        containerAnimatedStyle,
      ]}
      className="absolute left-4 right-4 z-50 rounded-[22px] bg-[#1B1F2B] border border-primary/30 shadow-2xl overflow-hidden"
    >
      <View className="p-4 flex-row items-center justify-between gap-3">
        {/* Left Icon and Message */}
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-9 h-9 rounded-xl bg-primary/15 items-center justify-center border border-primary/20">
            <MaterialIcons name="restore" size={20} color="#B2C5FF" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>
              {message}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <Text className="text-xs text-on-surface-variant font-medium">
                Tap Undo within {secondsRemaining}s
              </Text>
            </View>
          </View>
        </View>

        {/* Right Actions: Undo Button + Dismiss */}
        <View className="flex-row items-center gap-2">
          <ScaleButton
            activeScale={0.92}
            className="bg-primary px-3.5 py-2 rounded-xl flex-row items-center gap-1 shadow-sm"
            onPress={handleUndoPress}
          >
            <MaterialIcons name="undo" size={16} color="#002C72" />
            <Text className="text-xs font-extrabold text-on-primary">
              Undo
            </Text>
          </ScaleButton>

          <ScaleButton
            activeScale={0.88}
            className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center"
            onPress={handleDismiss}
          >
            <MaterialIcons name="close" size={16} color="#8D909F" />
          </ScaleButton>
        </View>
      </View>

      {/* 5-Second Progress Countdown Bar */}
      <View className="h-1 w-full bg-white/5">
        <Animated.View
          style={[progressAnimatedStyle]}
          className="h-full bg-primary"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
});

export default UndoToast;
