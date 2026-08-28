import React, { useEffect, useRef, useState } from 'react';
import { Text, TextProps, StyleProp, TextStyle, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSegments } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

export interface AnimatedCounterProps extends TextProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  transitionDuration?: number;
  formatter?: (val: number) => string;
  showDecimalsSmall?: boolean;
  className?: string;
  decimalClassName?: string;
  style?: StyleProp<TextStyle>;
  decimalStyle?: StyleProp<TextStyle>;
}

/**
 * Calculates the base starting point for screen transitions so that
 * only the hundreds / sub-thousands animate while high-order digits remain stable.
 */
function getHundredsBase(val: number): number {
  if (val <= 0) return 0;
  if (val >= 1000) {
    // Keep thousands intact, animate the hundreds (e.g. $12,450 -> starts from $12,000)
    return Math.floor(val / 1000) * 1000;
  }
  if (val >= 100) {
    // For values under 1000, start from the lower hundred (e.g. $450 -> starts from $400)
    return Math.floor(val / 100) * 100;
  }
  return 0;
}

/**
 * Framer Motion easeOutExpo easing curve:
 * Produces crisp, snappy initial movement that decelerates smoothly into place.
 */
function framerEaseOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animated number counter component
 * - Full 0-to-target count up on initial mount only
 * - Subtle tens/hundreds place transition on screen tab switches
 * - Smooth delta animation on value change
 * - No reload animation when opening/closing a modal
 */
const MODAL_ROUTES = [
  'add-transaction',
  'add-account',
  'add-subscription',
  'settings',
  'currency-region',
];

export function AnimatedCounter({
  value,
  prefix = '$',
  suffix = '',
  decimals = 2,
  duration = 400,
  transitionDuration = 240,
  formatter,
  showDecimalsSmall = false,
  className,
  decimalClassName,
  style,
  decimalStyle,
  ...textProps
}: AnimatedCounterProps) {
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || '$';
  const resolvedPrefix = prefix.replace('$', currencySymbol);

  const isFocused = useIsFocused();
  const segments = useSegments();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValueRef = useRef<number>(value);
  const targetValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastValueRef = useRef<number>(value);

  const startAnimation = (from: number, to: number, animDuration: number) => {
    if (reqIdRef.current) {
      cancelAnimationFrame(reqIdRef.current);
      reqIdRef.current = null;
    }

    if (from === to || animDuration <= 0) {
      setDisplayValue(to);
      return;
    }

    startValueRef.current = from;
    targetValueRef.current = to;
    startTimeRef.current = null;
    setDisplayValue(from);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animDuration, 1);

      const easeProgress = framerEaseOutExpo(progress);
      const current =
        startValueRef.current +
        (targetValueRef.current - startValueRef.current) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        reqIdRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValueRef.current);
        reqIdRef.current = null;
      }
    };

    reqIdRef.current = requestAnimationFrame(animate);
  };

  const lostFocusToModalRef = useRef(false);

  useEffect(() => {
    const currentRoot = (segments[0] as string) ?? '';
    const isModal = MODAL_ROUTES.includes(currentRoot);

    if (!isFocused) {
      if (isModal) {
        lostFocusToModalRef.current = true;
      }
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
        reqIdRef.current = null;
      }
      return;
    }

    // Focused — decide how to animate
    const wasModal = lostFocusToModalRef.current;
    lostFocusToModalRef.current = false;

    if (wasModal) {
      // Coming back from a modal: just update if value changed, no big count-up
      if (lastValueRef.current !== value) {
        const prev = lastValueRef.current;
        lastValueRef.current = value;
        startAnimation(prev, value, 300);
      } else {
        setDisplayValue(value);
      }
    } else {
      // Every other focus gain (initial, tab switch, navigation): full count-up from 0
      lastValueRef.current = value;
      startAnimation(0, value, duration);
    }

    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
        reqIdRef.current = null;
      }
    };
  }, [isFocused, segments, value, duration]);

  const formatNumber = (num: number): { whole: string; decimal: string; full: string } => {
    if (formatter) {
      const formatted = formatter(num);
      return { whole: formatted, decimal: '', full: formatted };
    }

    const isNegative = num < 0;
    const absVal = Math.abs(num);
    const fixedStr = absVal.toFixed(decimals);
    const [wholePart, decPart] = fixedStr.split('.');

    // Add comma grouping (e.g. 12,450)
    const withCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedWhole = `${isNegative ? '-' : ''}${resolvedPrefix}${withCommas}`;
    const formattedDecimal = decPart !== undefined && decimals > 0 ? `.${decPart}` : '';

    return {
      whole: formattedWhole,
      decimal: formattedDecimal,
      full: `${formattedWhole}${formattedDecimal}${suffix}`,
    };
  };

  const { whole, decimal, full } = formatNumber(displayValue);

  if (showDecimalsSmall && decimal) {
    return (
      <View className="flex-row items-baseline">
        <Text {...textProps} className={className} style={style}>
          {whole}
        </Text>
        <Text
          {...textProps}
          className={decimalClassName || 'text-sm opacity-80 font-medium'}
          style={decimalStyle || style}
        >
          {decimal}
          {suffix}
        </Text>
      </View>
    );
  }

  return (
    <Text {...textProps} className={className} style={style}>
      {full}
    </Text>
  );
}

export default AnimatedCounter;
