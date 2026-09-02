import React, { useEffect, useState } from 'react';
import { View, Text, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ScaleButton } from './ScaleButton';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[] | string[];
  selectedValue: T;
  onChange?: (value: T) => void;
  onSelect?: (value: T) => void;
  containerClassName?: string;
  activePillColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onChange,
  onSelect,
  containerClassName,
  activePillColor = '#7AA2F7',
  activeTextColor = '#0B0E14',
  inactiveTextColor = '#94A3B8',
  style,
}: SegmentedControlProps<T>) {
  const handleChange = (val: T) => {
    onChange?.(val);
    onSelect?.(val);
  };
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const formattedOptions: SegmentOption<T>[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt as T, label: opt } : opt
  );

  const selectedIndex = formattedOptions.findIndex((opt) => opt.value === selectedValue);
  const validIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const numOptions = formattedOptions.length;

  const segmentWidth = containerWidth > 0 ? (containerWidth - 8) / numOptions : 0;

  useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withSpring(validIndex * segmentWidth, {
        damping: 18,
        stiffness: 240,
        mass: 0.7,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validIndex, segmentWidth]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: segmentWidth,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      className={`bg-surface-container-low p-1 rounded-2xl flex-row items-center relative border border-outline-variant/30 ${
        containerClassName || ''
      }`}
      style={style}
    >
      {segmentWidth > 0 && (
        <Animated.View
          className="absolute top-1 bottom-1 left-1 rounded-xl shadow-md"
          style={[
            {
              backgroundColor: activePillColor,
            },
            animatedPillStyle,
          ]}
        />
      )}

      {formattedOptions.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <ScaleButton
            key={option.value}
            activeScale={0.96}
            className="flex-1 py-2.5 px-3 rounded-xl items-center justify-center flex-row gap-1.5 z-10"
            onPress={() => handleChange(option.value)}
          >
            {option.icon}
            <Text
              className={`text-sm font-semibold tracking-wide ${
                isSelected ? 'font-bold' : 'font-medium'
              }`}
              style={{
                color: isSelected ? activeTextColor : inactiveTextColor,
              }}
            >
              {option.label}
            </Text>
          </ScaleButton>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
