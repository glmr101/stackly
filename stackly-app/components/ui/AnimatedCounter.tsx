import React, { useEffect, useRef, useState } from 'react';
import { Text, TextProps, StyleProp, TextStyle, View } from 'react-native';

export interface AnimatedCounterProps extends TextProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  formatter?: (val: number) => string;
  showDecimalsSmall?: boolean;
  className?: string;
  decimalClassName?: string;
  style?: StyleProp<TextStyle>;
  decimalStyle?: StyleProp<TextStyle>;
}

export function AnimatedCounter({
  value,
  prefix = '$',
  suffix = '',
  decimals = 2,
  duration = 900,
  formatter,
  showDecimalsSmall = false,
  className,
  decimalClassName,
  style,
  decimalStyle,
  ...textProps
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const targetValueRef = useRef<number>(value);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    startValueRef.current = displayValue;
    targetValueRef.current = value;
    startTimeRef.current = null;

    if (startValueRef.current === value) {
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (targetValueRef.current - startValueRef.current) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        reqIdRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValueRef.current);
      }
    };

    reqIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
    };
  }, [value, duration]);

  const formatNumber = (num: number): { whole: string; decimal: string; full: string } => {
    if (formatter) {
      const formatted = formatter(num);
      return { whole: formatted, decimal: '', full: formatted };
    }

    const isNegative = num < 0;
    const absVal = Math.abs(num);
    const fixedStr = absVal.toFixed(decimals);
    const [wholePart, decPart] = fixedStr.split('.');
    
    // Add commas
    const withCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedWhole = `${isNegative ? '-' : ''}${prefix}${withCommas}`;
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
