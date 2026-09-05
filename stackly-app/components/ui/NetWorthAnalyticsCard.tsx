import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Line,
  Ellipse,
  Text as SvgText,
} from "react-native-svg";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { Transaction, Account } from "@/types";
import { useFocusEffect } from "expo-router";

interface MonthDataPoint {
  shortName: string;
  fullName: string;
  monthIndex: number;
  year: number;
  income: number;
  expenses: number;
  overall: number; // Monthly cash flow
  netWorth: number; // Actual Net Worth at the end of the month
  netRatio: number; // 0.0 to 1.0 (netWorth relative to max netWorth)
  incomeRatio: number;
  expenseRatio: number;
  isCurrentRealTimeMonth: boolean;
}

interface WeeklyDayPoint {
  shortName: string; // "MON", "TUE", ...
  fullName: string; // "Monday, Sep 1"
  dayOfMonth: number;
  weekIndex: number; // 0..3
  dayIndex: number; // 0..6
  income: number;
  expenses: number;
  overall: number; // Daily cash flow
  incomeRatio: number; // 0.05 .. 0.95
  expenseRatio: number; // 0.05 .. 0.95
  isToday: boolean;
}

interface WeekData {
  weekIndex: number;
  label: string; // "Week 1"
  dateRange: string; // "Sep 1 - 7"
  days: WeeklyDayPoint[];
  incomeSpline: {
    points: { x: number; y: number; data: WeeklyDayPoint }[];
    linePath: string;
    areaPath: string;
    baselineY: number;
  };
  expenseSpline: {
    points: { x: number; y: number; data: WeeklyDayPoint }[];
    linePath: string;
    areaPath: string;
  };
}

interface MonthlyPageData {
  pageIndex: number;
  months: MonthDataPoint[];
  incomeSpline: {
    points: { x: number; y: number; data: MonthDataPoint }[];
    linePath: string;
    areaPath: string;
    baselineY: number;
  };
  expenseSpline: {
    points: { x: number; y: number; data: MonthDataPoint }[];
    linePath: string;
    areaPath: string;
    baselineY: number;
  };
}

interface NetWorthAnalyticsCardProps {
  totalNetWorth: number;
  currencySymbol?: string;
  transactions?: Transaction[];
  accounts?: Account[];
  title?: string;
  periodLabel?: string;
  onPeriodChange?: (period: "Monthly" | "Weekly" | "Trend") => void;
}

const PERIODS: ("Weekly" | "Monthly" | "Trend")[] = [
  "Weekly",
  "Monthly",
  "Trend",
];

const ALL_12_MONTHS = [
  { short: "JAN", full: "January" },
  { short: "FEB", full: "February" },
  { short: "MAR", full: "March" },
  { short: "APR", full: "April" },
  { short: "MAY", full: "May" },
  { short: "JUN", full: "June" },
  { short: "JUL", full: "July" },
  { short: "AUG", full: "August" },
  { short: "SEP", full: "September" },
  { short: "OCT", full: "October" },
  { short: "NOV", full: "November" },
  { short: "DEC", full: "December" },
];

const WEEK_DAYS = [
  { short: "MON", full: "Monday" },
  { short: "TUE", full: "Tuesday" },
  { short: "WED", full: "Wednesday" },
  { short: "THU", full: "Thursday" },
  { short: "FRI", full: "Friday" },
  { short: "SAT", full: "Saturday" },
  { short: "SUN", full: "Sunday" },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
// --- ADJUST THESE CONSTANTS TO CHANGE THE CARD SIZE ---

// To shrink or expand the entire card's outer width, adjust this total horizontal margin.
// (e.g. 24 is full width, 48 is narrower, 64 is even narrower)
const CARD_OUTER_HORIZONTAL_MARGIN = 30;

// Inner container padding is px-4 (16px left + 16px right = 32px), plus card margin (30px) = 62px
const CHART_HORIZONTAL_MARGIN = CARD_OUTER_HORIZONTAL_MARGIN + 32;
const DEFAULT_CONTAINER_WIDTH = SCREEN_WIDTH - CHART_HORIZONTAL_MARGIN;

// To make the chart area taller or shorter, adjust this height.
const CHART_HEIGHT = 250;
// ------------------------------------------------------


/**
 * Builds a smooth Catmull-Rom cubic Bézier spline across coordinate points
 */
function getCubicBezierSpline(
  points: { x: number; y: number }[],
  baselineY: number = CHART_HEIGHT - 32
): {
  linePath: string;
  areaPath: string;
  baselineY: number;
} {
  if (points.length === 0) return { linePath: "", areaPath: "", baselineY };
  if (points.length === 1) {
    return {
      linePath: `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`,
      areaPath: "",
      baselineY,
    };
  }

  let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const tension = 0.18;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(1)} ${baselineY} L ${firstPoint.x.toFixed(1)} ${baselineY} Z`;

  return { linePath, areaPath, baselineY };
}

export function NetWorthAnalyticsCard({
  totalNetWorth,
  currencySymbol = "$",
  transactions = [],
  accounts = [],
  title = "Total Net Worth",
  periodLabel = "Weekly",
  onPeriodChange,
}: NetWorthAnalyticsCardProps) {
  const initialPeriodIndex = useMemo(() => {
    const idx = PERIODS.indexOf(periodLabel as any);
    return idx >= 0 ? idx : 0;
  }, [periodLabel]);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(initialPeriodIndex);
  const selectedPeriod = PERIODS[currentPeriodIndex];

  // Real-time current date, month & year
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  const currentDayOfMonth = now.getDate(); // 1-31

  // Current active week in the month (dynamic based on calendar)
  const currentWeekIndex = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDayOffset = (firstDay.getDay() + 6) % 7; // 0=Mon
    return Math.floor((currentDayOfMonth - 1 + startDayOffset) / 7);
  }, [currentDayOfMonth, currentYear, currentMonth]);

  const todayDayOfWeekIndex = useMemo(
    () => (now.getDay() + 6) % 7,
    [now]
  );

  // Scroll references for Monthly, Weekly, and Trend views
  const monthlyScrollRef = useRef<Animated.ScrollView>(null);
  const weeklyScrollRef = useRef<Animated.ScrollView>(null);
  const trendScrollRef = useRef<Animated.ScrollView>(null);

  const [containerWidth, setContainerWidth] = useState<number>(DEFAULT_CONTAINER_WIDTH);

  // Monthly State: Selected month index across 0..11, defaults strictly to current real-time month
  const [currentMonthlyPage, setCurrentMonthlyPage] = useState<number>(() =>
    Math.floor(currentMonth / 4)
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentMonth);

  // Weekly State: Selected week (0..3) and selected day (0..6)
  const [currentWeeklyPage, setCurrentWeeklyPage] = useState<number>(currentWeekIndex);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(currentWeekIndex);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayDayOfWeekIndex);

  // Trend State: Selected month index across 0..11, defaults to current real-time month
  const [currentTrendPage, setCurrentTrendPage] = useState<number>(() =>
    Math.floor(currentMonth / 6)
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedMonthIndex(currentMonth);
      setCurrentMonthlyPage(Math.floor(currentMonth / 4));
      setSelectedWeekIndex(currentWeekIndex);
      setSelectedDayIndex(todayDayOfWeekIndex);
      setCurrentWeeklyPage(currentWeekIndex);
      setCurrentTrendPage(Math.floor(currentMonth / 6));

      if (containerWidth > 0) {
        if (selectedPeriod === "Monthly") {
          monthlyScrollRef.current?.scrollTo({
            x: Math.floor(currentMonth / 4) * containerWidth,
            animated: false,
          });
        } else if (selectedPeriod === "Weekly") {
          weeklyScrollRef.current?.scrollTo({
            x: currentWeekIndex * containerWidth,
            animated: false,
          });
        } else if (selectedPeriod === "Trend") {
          trendScrollRef.current?.scrollTo({
            x: Math.floor(currentMonth / 6) * containerWidth,
            animated: false,
          });
        }
      }
    }, [currentMonth, currentWeekIndex, todayDayOfWeekIndex, containerWidth, selectedPeriod])
  );

  // Monthly Scroll Shared Value & Handler
  const monthlyScrollX = useSharedValue(
    Math.floor(currentMonth / 4) * DEFAULT_CONTAINER_WIDTH
  );

  const monthlyScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      monthlyScrollX.value = event.contentOffset.x;
    },
  });

  // Weekly Scroll Shared Value & Handler
  const weeklyScrollX = useSharedValue(
    currentWeekIndex * DEFAULT_CONTAINER_WIDTH
  );

  const weeklyScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      weeklyScrollX.value = event.contentOffset.x;
    },
  });

  // Trend Scroll Shared Value & Handler
  const trendScrollX = useSharedValue(
    Math.floor(currentMonth / 6) * DEFAULT_CONTAINER_WIDTH
  );

  const trendScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      trendScrollX.value = event.contentOffset.x;
    },
  });

  // Real-time Monthly 4-Dot Animations
  const monthDot0Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(monthlyScrollX.value - 0 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const monthDot1Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(monthlyScrollX.value - 1 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const monthDot2Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(monthlyScrollX.value - 2 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  // Real-time Weekly 4-Dot Animations
  const weekDot0Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(weeklyScrollX.value - 0 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const weekDot1Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(weeklyScrollX.value - 1 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const weekDot2Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(weeklyScrollX.value - 2 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const weekDot3Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(weeklyScrollX.value - 3 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const weekDot4Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(weeklyScrollX.value - 4 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const weekDot5Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(weeklyScrollX.value - 5 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  // Real-time Trend 2-Dot Animations
  const trendDot0Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(trendScrollX.value - 0 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const trendDot1Style = useAnimatedStyle(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const dist = Math.abs(trendScrollX.value - 1 * w);
    const width = interpolate(dist, [0, w], [20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, w], [1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  const handleTrendMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (containerWidth <= 0) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / containerWidth);
    if (page !== currentTrendPage && page >= 0 && page <= 1) {
      setCurrentTrendPage(page);
    }
  };

  // Generate 12 months data for the whole year — purely from real transactions
  const monthlyChartData: MonthDataPoint[] = useMemo(() => {
    // First pass: compute income/expenses per month from real transactions
    const rawMonths = ALL_12_MONTHS.map((mInfo, mIdx) => {
      const monthTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getMonth() === mIdx &&
          txDate.getFullYear() === currentYear
        );
      });

      const income = monthTxs
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expenses = monthTxs
        .filter((tx) => tx.type === "expense" || tx.type === "savings")
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Cash flow = income - expenses (net for the month)
      const overall = income - expenses;

      return {
        shortName: mInfo.short,
        fullName: mInfo.full,
        monthIndex: mIdx,
        year: currentYear,
        income,
        expenses,
        overall,
        incomeRatio: 0,
        expenseRatio: 0,
        isCurrentRealTimeMonth: mIdx === currentMonth,
      };
    });

    // Second pass: Calculate historical Net Worth for each month per account
    const netWorths = new Array(12).fill(0);

    accounts.forEach((acc) => {
      let currentBal = acc.balance;
      const accBalances = new Array(12).fill(0);

      const relatedTxs = transactions
        .filter(t => t.accountId === acc.id || t.destinationAccountId === acc.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let txIndex = 0;
      const firstTxDate = relatedTxs.length > 0 ? new Date(relatedTxs[relatedTxs.length - 1].date) : new Date();
      const createdAtDate = acc.createdAt ? new Date(acc.createdAt) : firstTxDate;

      for (let mIdx = 11; mIdx >= 0; mIdx--) {
        const monthEnd = new Date(currentYear, mIdx + 1, 0, 23, 59, 59, 999);

        if (monthEnd.getTime() < createdAtDate.getTime()) {
          accBalances[mIdx] = 0;
          continue;
        }

        while (txIndex < relatedTxs.length) {
          const tx = relatedTxs[txIndex];
          const txDate = new Date(tx.date);
          if (txDate.getTime() > monthEnd.getTime()) {
            const isSender = tx.accountId === acc.id;
            const isReceiver = tx.destinationAccountId === acc.id;

            if (tx.type === 'income' && isSender) {
              currentBal -= tx.amount;
            } else if ((tx.type === 'expense' || tx.type === 'savings') && isSender) {
              currentBal += tx.amount;
            } else if (tx.type === 'transfer') {
              if (isSender) {
                currentBal += tx.amount;
              }
              if (isReceiver) {
                currentBal -= tx.amount;
              }
            }
            txIndex++;
          } else {
            break;
          }
        }

        accBalances[mIdx] = currentBal;
      }

      for (let mIdx = 0; mIdx < 12; mIdx++) {
        if (mIdx > currentMonth) {
          netWorths[mIdx] += 0;
        } else {
          netWorths[mIdx] += accBalances[mIdx];
        }
      }
    });

    const maxNetWorth = Math.max(...netWorths, 1);
    const maxActivity = 50000; // Benchmark / highest amount limit (50K)

    return rawMonths.map((m, i) => ({
      ...m,
      netWorth: netWorths[i],
      netRatio: Math.max(0, netWorths[i]) / maxNetWorth,
      incomeRatio: m.income > 0 ? Math.max(0.12, Math.min(1.0, m.income / maxActivity)) : 0.05,
      expenseRatio: m.expenses > 0 ? Math.max(0.12, Math.min(1.0, m.expenses / maxActivity)) : 0.05,
    }));
  }, [accounts, transactions, currentMonth, currentYear]);

  // Generate 4 Weeks of Data for the active month
  const monthWeeksData: WeekData[] = useMemo(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const pad = 6;
    const slotWidth = (w - pad * 2) / 7;
    const baselineY = CHART_HEIGHT - 32;
    const curveMaxHeight = CHART_HEIGHT * 0.54;

    // First pass: collect all day data across all calendar weeks
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const numWeeks = Math.ceil((totalDaysInMonth + startDayOffset) / 7);

    const allWeeksRaw = Array.from({ length: numWeeks }).map((_, wIdx) => {
      const days = [0, 1, 2, 3, 4, 5, 6].map((dIdx) => {
        const dayOfMonth = 1 - startDayOffset + wIdx * 7 + dIdx;
        const dayDate = new Date(currentYear, currentMonth, dayOfMonth);
        const realDayOfWeekIndex = (dayDate.getDay() + 6) % 7; // 0=Mon, 6=Sun
        const dInfo = WEEK_DAYS[realDayOfWeekIndex];

        const isToday =
          dayDate.getDate() === now.getDate() &&
          dayDate.getMonth() === now.getMonth() &&
          dayDate.getFullYear() === now.getFullYear();

        const dayTxs = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            txDate.getDate() === dayDate.getDate() &&
            txDate.getMonth() === dayDate.getMonth() &&
            txDate.getFullYear() === dayDate.getFullYear()
          );
        });

        const income = dayTxs
          .filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = dayTxs
          .filter((tx) => tx.type === "expense" || tx.type === "savings")
          .reduce((sum, tx) => sum + tx.amount, 0);

        // Cash flow = income - expenses (net for the day)
        const overall = income - expenses;

        return {
          shortName: dInfo.short,
          fullName: `${dInfo.full}, ${ALL_12_MONTHS[dayDate.getMonth()].short} ${dayDate.getDate()}`,
          dayOfMonth: dayDate.getDate(),
          weekIndex: wIdx,
          dayIndex: dIdx,
          income,
          expenses,
          overall,
          ratio: 0, // computed in second pass
          isToday,
        };
      });

      const actualStartDayDate = new Date(currentYear, currentMonth, 1 - startDayOffset + wIdx * 7);
      const actualStartMonth = ALL_12_MONTHS[actualStartDayDate.getMonth()].short;
      const actualEndDayDate = new Date(currentYear, currentMonth, 1 - startDayOffset + wIdx * 7 + 6);
      const actualEndMonth = ALL_12_MONTHS[actualEndDayDate.getMonth()].short;

      const startDateNum = actualStartDayDate.getDate();
      const endDateNum = actualEndDayDate.getDate();

      const dateRange = actualStartMonth === actualEndMonth
        ? `${actualStartMonth} ${startDateNum} - ${endDateNum}`
        : `${actualStartMonth} ${startDateNum} - ${actualEndMonth} ${endDateNum}`;
      const label = `Week ${wIdx + 1}`;

      return { wIdx, label, dateRange, days };
    });

    // Benchmark / highest amount limit (50K)
    const maxDayActivity = 50000;

    // Second pass: compute ratios and build spline data
    return allWeeksRaw.map((wk) => {
      const daysWithRatio = wk.days.map((d) => ({
        ...d,
        incomeRatio:
          d.income > 0
            ? Math.max(0.12, Math.min(1.0, d.income / maxDayActivity))
            : 0.05, // minimal baseline for days with no activity
        expenseRatio:
          d.expenses > 0
            ? Math.max(0.12, Math.min(1.0, d.expenses / maxDayActivity))
            : 0.05,
      }));

      const incomePoints = daysWithRatio.map((d, dIdx) => {
        const x = pad + (dIdx + 0.5) * slotWidth;
        const y = baselineY - d.incomeRatio * curveMaxHeight;
        return { x, y, data: d };
      });

      const expensePoints = daysWithRatio.map((d, dIdx) => {
        const x = pad + (dIdx + 0.5) * slotWidth;
        const y = baselineY - d.expenseRatio * curveMaxHeight;
        return { x, y, data: d };
      });

      const incomeSplineResult = getCubicBezierSpline(incomePoints, baselineY);
      const expenseSplineResult = getCubicBezierSpline(expensePoints, baselineY);

      return {
        weekIndex: wk.wIdx,
        label: wk.label,
        dateRange: wk.dateRange,
        days: daysWithRatio,
        incomeSpline: {
          points: incomePoints,
          linePath: incomeSplineResult.linePath,
          areaPath: incomeSplineResult.areaPath,
          baselineY,
        },
        expenseSpline: {
          points: expensePoints,
          linePath: expenseSplineResult.linePath,
          areaPath: expenseSplineResult.areaPath,
          baselineY,
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerWidth,
    currentMonth,
    currentYear,
    currentDayOfMonth,
    now,
    transactions,
  ]);

  const activeMonthlyPoint =
    monthlyChartData[selectedMonthIndex] ||
    monthlyChartData[currentMonth] ||
    monthlyChartData[0];

  const activeWeekData = monthWeeksData[selectedWeekIndex] || monthWeeksData[0];
  const activeWeeklyDayPoint =
    activeWeekData?.days[selectedDayIndex] || activeWeekData?.days[0];

  // Synchronize scroll position whenever selectedPeriod changes or containerWidth is measured/updated
  useEffect(() => {
    if (containerWidth <= 0) return;

    if (selectedPeriod === "Monthly") {
      const targetPage = Math.floor(currentMonth / 4);
      monthlyScrollX.value = targetPage * containerWidth;
      setCurrentMonthlyPage(targetPage);
      const timer = setTimeout(() => {
        monthlyScrollRef.current?.scrollTo({
          x: targetPage * containerWidth,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    } else if (selectedPeriod === "Weekly") {
      weeklyScrollX.value = currentWeekIndex * containerWidth;
      setCurrentWeeklyPage(currentWeekIndex);
      const timer = setTimeout(() => {
        weeklyScrollRef.current?.scrollTo({
          x: currentWeekIndex * containerWidth,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    } else if (selectedPeriod === "Trend") {
      const targetPage = Math.floor(currentMonth / 6);
      trendScrollX.value = targetPage * containerWidth;
      setCurrentTrendPage(targetPage);
      const timer = setTimeout(() => {
        trendScrollRef.current?.scrollTo({
          x: targetPage * containerWidth,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedPeriod, containerWidth, currentMonth, currentWeekIndex]);

  // Layout Handler
  const onLayoutContainer = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      if (selectedPeriod === "Monthly") {
        const targetPage = Math.floor(currentMonth / 4);
        monthlyScrollX.value = targetPage * width;
        monthlyScrollRef.current?.scrollTo({ x: targetPage * width, animated: false });
        setCurrentMonthlyPage(targetPage);
      } else if (selectedPeriod === "Weekly") {
        weeklyScrollX.value = currentWeekIndex * width;
        weeklyScrollRef.current?.scrollTo({
          x: currentWeekIndex * width,
          animated: false,
        });
        setCurrentWeeklyPage(currentWeekIndex);
      } else if (selectedPeriod === "Trend") {
        const targetPage = Math.floor(currentMonth / 6);
        trendScrollX.value = targetPage * width;
        trendScrollRef.current?.scrollTo({
          x: targetPage * width,
          animated: false,
        });
        setCurrentTrendPage(targetPage);
      }
    }
  };

  const handleMonthlyMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (containerWidth <= 0) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / containerWidth);
    if (page !== currentMonthlyPage && page >= 0 && page <= 2) {
      setCurrentMonthlyPage(page);
    }
  };

  const handleWeeklyMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (containerWidth <= 0) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / containerWidth);
    if (page >= 0 && page < monthWeeksData.length && page !== currentWeeklyPage) {
      setCurrentWeeklyPage(page);
    }
  };

  const handlePeriodToggle = () => {
    const nextIdx = (currentPeriodIndex + 1) % PERIODS.length;
    setCurrentPeriodIndex(nextIdx);
    const nextPeriod = PERIODS[nextIdx];
    onPeriodChange?.(nextPeriod);

    if (nextPeriod === "Monthly") {
      setSelectedMonthIndex(currentMonth);
      const targetPage = Math.floor(currentMonth / 4);
      setCurrentMonthlyPage(targetPage);
    } else if (nextPeriod === "Weekly") {
      setSelectedWeekIndex(currentWeekIndex);
      setSelectedDayIndex(todayDayOfWeekIndex);
    } else if (nextPeriod === "Trend") {
      setSelectedMonthIndex(currentMonth);
      const targetPage = Math.floor(currentMonth / 6);
      setCurrentTrendPage(targetPage);
    }
  };

  const toggleMonthlyPage = (targetPage: number) => {
    if (containerWidth <= 0) return;
    monthlyScrollRef.current?.scrollTo({
      x: targetPage * containerWidth,
      animated: true,
    });
    setCurrentMonthlyPage(targetPage);
  };

  const toggleWeeklyPage = (targetPage: number) => {
    if (containerWidth <= 0) return;
    weeklyScrollRef.current?.scrollTo({
      x: targetPage * containerWidth,
      animated: true,
    });
    setCurrentWeeklyPage(targetPage);
  };

  const toggleTrendPage = (targetPage: number) => {
    if (containerWidth <= 0) return;
    trendScrollRef.current?.scrollTo({
      x: targetPage * containerWidth,
      animated: true,
    });
    setCurrentTrendPage(targetPage);
  };

  // 3 trimester groups of 4 months each with spline calculations
  const monthlyPages: MonthlyPageData[] = useMemo(() => {
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const pad = 6;
    const slotWidth = (w - pad * 2) / 4;
    const baselineY = CHART_HEIGHT - 32;
    const curveMaxHeight = CHART_HEIGHT * 0.54;

    const chunks = [
      monthlyChartData.slice(0, 4),
      monthlyChartData.slice(4, 8),
      monthlyChartData.slice(8, 12),
    ];

    return chunks.map((chunk, pIdx) => {
      const incomePoints = chunk.map((m, mIdx) => {
        const x = pad + (mIdx + 0.5) * slotWidth;
        const y = baselineY - m.incomeRatio * curveMaxHeight;
        return { x, y, data: m };
      });
      const expensePoints = chunk.map((m, mIdx) => {
        const x = pad + (mIdx + 0.5) * slotWidth;
        const y = baselineY - m.expenseRatio * curveMaxHeight;
        return { x, y, data: m };
      });

      const incomeSpline = getCubicBezierSpline(incomePoints, baselineY);
      const expenseSpline = getCubicBezierSpline(expensePoints, baselineY);

      return {
        pageIndex: pIdx,
        months: chunk,
        incomeSpline: { ...incomeSpline, points: incomePoints },
        expenseSpline: { ...expenseSpline, points: expensePoints },
      };
    });
  }, [monthlyChartData, containerWidth]);

  const trendPages = useMemo(() => {
    return [
      { pageIndex: 0, months: monthlyChartData.slice(0, 6) },
      { pageIndex: 1, months: monthlyChartData.slice(6, 12) },
    ];
  }, [monthlyChartData]);

  const getMonthlyTooltipStyle = (page: MonthlyPageData) => {
    const TOOLTIP_WIDTH = 150;
    const TOOLTIP_HEIGHT = 70; // Accommodates Net Worth, Income, Expenses
    const BADGE_OFFSET = 15;
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const ptInc = page.incomeSpline.points[selectedMonthIndex % 4];
    const ptExp = page.expenseSpline.points[selectedMonthIndex % 4];

    if (!ptInc || !ptExp) return { left: 0, top: 0, width: TOOLTIP_WIDTH };

    let left = ptInc.x + BADGE_OFFSET;

    if (selectedMonthIndex % 4 > 1) {
      left = ptInc.x - BADGE_OFFSET - TOOLTIP_WIDTH;
      if (left < 4) left = 4;
    } else {
      if (left + TOOLTIP_WIDTH > w - 4) left = w - TOOLTIP_WIDTH - 4;
    }

    const highestY = Math.min(ptInc.y, ptExp.y);
    const top = highestY - TOOLTIP_HEIGHT - 6;

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: TOOLTIP_WIDTH,
    };
  };

  const getTrendTooltipStyle = (pIdx: number) => {
    const TOOLTIP_WIDTH = 84;
    const TOOLTIP_HEIGHT = 30;
    const BADGE_OFFSET = 10;
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const absIdx = selectedMonthIndex;
    const localIdx = absIdx % 6;

    // Calculate identical bar placement
    const leftPad = 25;
    const rightPad = 6;
    const slotWidth = (w - leftPad - rightPad) / 6;
    const centerX = leftPad + (localIdx + 0.5) * slotWidth;

    const monthData = monthlyChartData[absIdx];
    if (!monthData) return { left: 0, top: 0, width: TOOLTIP_WIDTH };

    const val = Math.min(monthData.netWorth, 70000);
    const maxBarHeight = (CHART_HEIGHT - 32) - 40;
    const barHeight = Math.max(12, (val / 70000) * maxBarHeight);
    const barY = (CHART_HEIGHT - 32) - barHeight;

    let left = centerX + BADGE_OFFSET;

    if (localIdx > 2) {
      left = centerX - BADGE_OFFSET - TOOLTIP_WIDTH;
      if (left < 4) left = 4;
    } else {
      if (left + TOOLTIP_WIDTH > w - 4) left = w - TOOLTIP_WIDTH - 4;
    }

    const top = barY - TOOLTIP_HEIGHT - 6;

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: TOOLTIP_WIDTH,
    };
  };

  // Weekly Tooltip Corner Coordinates Calculation for a given week
  const getWeeklyTooltipStyle = (week: WeekData) => {
    const TOOLTIP_WIDTH = 140;
    const TOOLTIP_HEIGHT = 70;
    const BADGE_OFFSET = 18;
    const w = containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH;
    const ptInc = week.incomeSpline.points[selectedDayIndex] || week.incomeSpline.points[0];
    const ptExp = week.expenseSpline.points[selectedDayIndex] || week.expenseSpline.points[0];

    if (!ptInc || !ptExp) return { left: 0, top: 0, width: TOOLTIP_WIDTH };

    let left = ptInc.x + BADGE_OFFSET;

    if (selectedDayIndex > 3) {
      left = ptInc.x - BADGE_OFFSET - TOOLTIP_WIDTH;
      if (left < 4) left = 4;
    } else {
      if (left + TOOLTIP_WIDTH > w - 4) left = w - TOOLTIP_WIDTH - 4;
    }

    const highestY = Math.min(ptInc.y, ptExp.y);
    const top = highestY - TOOLTIP_HEIGHT - 6;

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: TOOLTIP_WIDTH,
    };
  };

  // Render floating snapshot tooltip card (Monthly)
  const renderMonthlyTooltip = (page: MonthlyPageData) => {
    const coords = getMonthlyTooltipStyle(page);
    return (
      <Animated.View
        key={`monthly-tooltip-${selectedMonthIndex}`}
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        layout={Layout.springify().damping(16).stiffness(140)}
        className="absolute z-30 rounded-2xl bg-[#131722]/95 border border-[#B2C5FF]/25 p-2.5 px-3 shadow-2xl"
        style={[
          styles.floatingTooltip,
          {
            left: coords.left,
            top: coords.top,
            width: coords.width,
          },
        ]}
      >
        <View className="flex-row items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
          <Text className="text-[11.5px] font-semibold text-[#DFE2F1]">
            {activeMonthlyPoint.fullName}, {activeMonthlyPoint.year}
          </Text>
          {activeMonthlyPoint.isCurrentRealTimeMonth && (
            <View className="w-1.5 h-1.5 rounded-full bg-[#B2C5FF]" />
          )}
        </View>

        {/* Income Row */}
        <View className="flex-row items-center justify-between gap-3 mb-1">
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-[#4DE082]" />
            <Text className="text-[11.5px] font-medium text-[#C3C6D6]">
              Income
            </Text>
          </View>
          <Text className="text-[12px] font-bold text-[#4DE082]">
            {activeMonthlyPoint.income > 0 ? "+" : ""}{currencySymbol}
            {activeMonthlyPoint.income.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>

        {/* Expenses Row */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-[#FFB3B0]" />
            <Text className="text-[11.5px] font-medium text-[#C3C6D6]">
              Expenses
            </Text>
          </View>
          <Text className="text-[12px] font-bold text-[#FFB3B0]">
            {activeMonthlyPoint.expenses > 0 ? "-" : ""}{currencySymbol}
            {activeMonthlyPoint.expenses.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // Render floating snapshot tooltip card (Weekly)
  const renderWeeklyTooltip = (week: WeekData) => {
    const tooltipCoords = getWeeklyTooltipStyle(week);
    const dayPt = week.days[selectedDayIndex] || week.days[0];

    return (
      <Animated.View
        key={`weekly-tooltip-${week.weekIndex}-${selectedDayIndex}`}
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        layout={Layout.springify().damping(16).stiffness(140)}
        className="absolute z-30 rounded-2xl bg-[#131722]/95 border border-[#B2C5FF]/25 p-2.5 px-3 shadow-2xl"
        style={[
          styles.floatingTooltip,
          {
            left: tooltipCoords.left,
            top: tooltipCoords.top,
            width: tooltipCoords.width,
          },
        ]}
      >
        <View className="flex-row items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
          <Text className="text-[11.5px] font-semibold text-[#DFE2F1]">
            {dayPt.fullName}
          </Text>
          {dayPt.isToday && (
            <View className="w-1.5 h-1.5 rounded-full bg-[#B2C5FF]" />
          )}
        </View>

        {/* Income Row */}
        <View className="flex-row items-center justify-between gap-3 mb-1">
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-[#4DE082]" />
            <Text className="text-[11.5px] font-medium text-[#C3C6D6]">
              Income
            </Text>
          </View>
          <Text className="text-[12px] font-bold text-[#4DE082]">
            {dayPt.income > 0 ? "+" : ""}{currencySymbol}
            {dayPt.income.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>

        {/* Expenses Row */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-[#FFB3B0]" />
            <Text className="text-[11.5px] font-medium text-[#C3C6D6]">
              Expenses
            </Text>
          </View>
          <Text className="text-[12px] font-bold text-[#FFB3B0]">
            {dayPt.expenses > 0 ? "-" : ""}{currencySymbol}
            {dayPt.expenses.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const displayedCashFlow =
    selectedPeriod === "Weekly"
      ? activeWeeklyDayPoint?.overall ?? 0
      : activeMonthlyPoint.overall;

  return (
    <View
      className="mt-2 mb-6 rounded-[32px] bg-[#131722] border border-white/10 overflow-hidden relative shadow-2xl"
      style={{ marginHorizontal: CARD_OUTER_HORIZONTAL_MARGIN / 2 }}
    >
      {/* 1. Ambient Top-Left Warm Bluish Atmospheric Glow */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient
              id="topAmbientGlow"
              cx="10%"
              cy="8%"
              r="75%"
              fx="10%"
              fy="8%"
            >
              <Stop offset="0%" stopColor="#B2C5FF" stopOpacity="0.4" />
              <Stop offset="30%" stopColor="#3B82F6" stopOpacity="0.2" />
              <Stop offset="65%" stopColor="#131722" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#131722" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#topAmbientGlow)"
          />
        </Svg>
      </View>

      {/* Card Content Container */}
      <View className="px-4 pt-6 pb-5">
        {/* Top Header Row */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-[13px] font-semibold text-[#C3C6D6] tracking-tight">
                {title}
              </Text>
            </View>

            <View className="mt-1">
              <AnimatedCounter
                value={totalNetWorth}
                prefix={currencySymbol}
                decimals={0}
                className="text-[34px] font-extrabold text-white tracking-tight"
              />
            </View>

            {/* Updating Cash Flow display */}
            {selectedPeriod !== "Trend" && (
              <View className="flex-row items-center gap-1.5 mt-1">
                <Text className="text-[12px] font-medium text-[#8D909F]">
                  {selectedPeriod === "Weekly" ? "Daily" : "Monthly"} Cash Flow:
                </Text>
                <Text
                  className={`text-[12.5px] font-bold ${displayedCashFlow > 0
                    ? "text-[#4DE082]"
                    : displayedCashFlow < 0
                      ? "text-[#FFB3B0]"
                      : "text-[#8D909F]"
                    }`}
                >
                  {displayedCashFlow > 0 ? "+" : ""}
                  {currencySymbol}
                  {Math.abs(displayedCashFlow).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Right Side: Period Switcher Pill */}
          <View className="items-end">
            <ScaleButton
              activeScale={0.92}
              onPress={handlePeriodToggle}
              className="bg-[#B2C5FF] flex-row items-center px-3.5 py-1.5 rounded-full shadow-md"
            >
              <View className="w-1.5 h-1.5 rounded-full bg-[#002C72] mr-1.5" />
              <Text className="text-xs font-bold text-[#002C72] tracking-wide">
                {selectedPeriod}
              </Text>
            </ScaleButton>
          </View>
        </View>

        {/* Middle Area: 4-Month Snappable Curve Graphs OR 4-Week Snappable Curve Graphs */}
        <View
          className="relative mt-2 overflow-hidden"
          style={{ height: CHART_HEIGHT, width: containerWidth }}
          onLayout={onLayoutContainer}
        >
          {selectedPeriod === "Weekly" ? (
            /* Weekly 4-Week Horizontal ScrollView with Snap */
            <Animated.ScrollView
              key="weekly-scroll"
              ref={weeklyScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={weeklyScrollHandler}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleWeeklyMomentumScrollEnd}
              contentOffset={{
                x:
                  currentWeekIndex *
                  (containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH),
                y: 0,
              }}
              style={{ width: containerWidth, height: CHART_HEIGHT, overflow: "hidden" }}
              contentContainerStyle={{
                width: containerWidth * monthWeeksData.length,
                height: CHART_HEIGHT,
              }}
            >
              {monthWeeksData.map((week, wIdx) => (
                <View
                  key={`week-page-${wIdx}`}
                  style={{ width: containerWidth, height: CHART_HEIGHT }}
                  className="justify-end relative"
                >
                  {/* Tooltip rendered if selected day is in this week */}
                  {selectedWeekIndex === wIdx && renderWeeklyTooltip(week)}

                  {/* SVG Smooth Curve with Gradient Area */}
                  <Svg
                    width={containerWidth}
                    height={CHART_HEIGHT}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  >
                    <Defs>
                      {/* Income Gradients */}
                      <LinearGradient id={`incomeAreaGradient-${wIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#4DE082" stopOpacity={0.42} />
                        <Stop offset="35%" stopColor="#10B981" stopOpacity={0.22} />
                        <Stop offset="70%" stopColor="#059669" stopOpacity={0.08} />
                        <Stop offset="100%" stopColor="#131722" stopOpacity={0} />
                      </LinearGradient>
                      <LinearGradient id={`incomeLineGradient-${wIdx}`} x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#86EFAC" />
                        <Stop offset="50%" stopColor="#4DE082" />
                        <Stop offset="100%" stopColor="#10B981" />
                      </LinearGradient>

                      {/* Expense Gradients */}
                      <LinearGradient id={`expenseAreaGradient-${wIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#F87171" stopOpacity={0.42} />
                        <Stop offset="35%" stopColor="#EF4444" stopOpacity={0.22} />
                        <Stop offset="70%" stopColor="#DC2626" stopOpacity={0.08} />
                        <Stop offset="100%" stopColor="#131722" stopOpacity={0} />
                      </LinearGradient>
                      <LinearGradient id={`expenseLineGradient-${wIdx}`} x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#FCA5A5" />
                        <Stop offset="50%" stopColor="#F87171" />
                        <Stop offset="100%" stopColor="#EF4444" />
                      </LinearGradient>
                    </Defs>

                    {/* Subtle Horizontal Dashed Guidelines */}
                    <Line x1={16} y1={90} x2={containerWidth - 16} y2={90} stroke="#B2C5FF" strokeOpacity={0.08} strokeDasharray="4 4" strokeWidth={1} />
                    <Line x1={16} y1={150} x2={containerWidth - 16} y2={150} stroke="#B2C5FF" strokeOpacity={0.08} strokeDasharray="4 4" strokeWidth={1} />

                    {/* Expense Area & Lines (rendered first so income is on top) */}
                    <Path d={week.expenseSpline.areaPath} fill={`url(#expenseAreaGradient-${wIdx})`} />
                    <Path d={week.expenseSpline.linePath} stroke="#EF4444" strokeWidth={6} strokeOpacity={0.22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <Path d={week.expenseSpline.linePath} stroke={`url(#expenseLineGradient-${wIdx})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* Income Area & Lines */}
                    <Path d={week.incomeSpline.areaPath} fill={`url(#incomeAreaGradient-${wIdx})`} />
                    <Path d={week.incomeSpline.linePath} stroke="#10B981" strokeWidth={6} strokeOpacity={0.22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <Path d={week.incomeSpline.linePath} stroke={`url(#incomeLineGradient-${wIdx})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* Inactive Data Dots - Expenses */}
                    {week.expenseSpline.points.map((pt, pIdx) => {
                      if (selectedWeekIndex === wIdx && pIdx === selectedDayIndex) return null;
                      return (
                        <Circle key={`week-${wIdx}-dot-exp-${pIdx}`} cx={pt.x} cy={pt.y} r={3.5} fill="#131722" stroke="#F87171" strokeWidth={2} strokeOpacity={0.75} />
                      );
                    })}

                    {/* Inactive Data Dots - Income */}
                    {week.incomeSpline.points.map((pt, pIdx) => {
                      if (selectedWeekIndex === wIdx && pIdx === selectedDayIndex) return null;
                      return (
                        <Circle key={`week-${wIdx}-dot-inc-${pIdx}`} cx={pt.x} cy={pt.y} r={3.5} fill="#131722" stroke="#4DE082" strokeWidth={2} strokeOpacity={0.75} />
                      );
                    })}

                    {/* Active Selected Day Vertical Guide Line (From highest point to Baseline) */}
                    {selectedWeekIndex === wIdx && week.incomeSpline.points[selectedDayIndex] && (
                      <Line
                        x1={week.incomeSpline.points[selectedDayIndex].x}
                        y1={Math.min(week.incomeSpline.points[selectedDayIndex].y, week.expenseSpline.points[selectedDayIndex].y)}
                        x2={week.incomeSpline.points[selectedDayIndex].x}
                        y2={week.incomeSpline.baselineY + 2}
                        stroke="#FFFFFF"
                        strokeOpacity={0.8}
                        strokeWidth={1.5}
                      />
                    )}
                  </Svg>

                  {/* Active Selected Day Pin Badge for Expense */}
                  {selectedWeekIndex === wIdx && week.expenseSpline.points[selectedDayIndex] && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="absolute z-20 items-center justify-center"
                      style={{
                        left: week.expenseSpline.points[selectedDayIndex].x - 12,
                        top: week.expenseSpline.points[selectedDayIndex].y - 12,
                        width: 24,
                        height: 24,
                      }}
                    >
                      <View className="w-6 h-6 rounded-full bg-[#F87171] items-center justify-center shadow-lg" style={{ borderWidth: 2, borderColor: "#FFFFFF", shadowColor: "#F87171", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 6, elevation: 6 }}>
                        <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M 2.5 6.2 L 4.8 8.5 L 9.5 3.5" fill="none" stroke="#ffffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                      </View>
                    </Animated.View>
                  )}

                  {/* Active Selected Day Pin Checkmark Badge for Income */}
                  {selectedWeekIndex === wIdx && week.incomeSpline.points[selectedDayIndex] && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="absolute z-20 items-center justify-center"
                      style={{
                        left: week.incomeSpline.points[selectedDayIndex].x - 12,
                        top: week.incomeSpline.points[selectedDayIndex].y - 12,
                        width: 24,
                        height: 24,
                      }}
                    >
                      <View className="w-6 h-6 rounded-full bg-[#4DE082] items-center justify-center shadow-lg" style={{ borderWidth: 2, borderColor: "#FFFFFF", shadowColor: "#4DE082", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 6, elevation: 6 }}>
                        <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M 2.5 6.2 L 4.8 8.5 L 9.5 3.5" fill="none" stroke="#ffffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                      </View>
                    </Animated.View>
                  )}

                  {/* Baseline */}
                  <View className="w-full h-[1.5px] bg-[#B2C5FF]/30 mb-2.5 rounded-full" />

                  {/* Weekday Labels with unified column center alignment */}
                  <View
                    style={{
                      paddingHorizontal: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {week.days.map((item, idx) => {
                      const isSelected =
                        selectedWeekIndex === wIdx &&
                        idx === selectedDayIndex;
                      const daySlotWidth = (containerWidth - 12) / 7;
                      return (
                        <TouchableOpacity
                          key={`weekday-${wIdx}-${item.shortName}-${idx}`}
                          activeOpacity={0.75}
                          onPress={() => {
                            setSelectedWeekIndex(wIdx);
                            setSelectedDayIndex(idx);
                          }}
                          style={{ width: daySlotWidth }}
                          className="items-center justify-center py-1"
                        >
                          <Text
                            className={`text-[13px] uppercase tracking-wider font-semibold ${isSelected
                              ? "text-[#B2C5FF]"
                              : "text-[#8D909F]"
                              }`}
                          >
                            {item.shortName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          ) : selectedPeriod === "Monthly" ? (
            /* 12-Month Horizontal ScrollView with 4-Month Snapping (Monthly Mode) */
            <Animated.ScrollView
              key="monthly-scroll"
              ref={monthlyScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={monthlyScrollHandler}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleMonthlyMomentumScrollEnd}
              contentOffset={{
                x:
                  Math.floor(currentMonth / 4) *
                  (containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH),
                y: 0,
              }}
              style={{ width: containerWidth, height: CHART_HEIGHT, overflow: "hidden" }}
              contentContainerStyle={{ width: containerWidth * 3, height: CHART_HEIGHT }}
            >
              {monthlyPages.map((page, pIdx) => (
                <View
                  key={`monthly-page-${pIdx}`}
                  style={{ width: containerWidth, height: CHART_HEIGHT }}
                  className="justify-end relative"
                >
                  {/* Snapshot Tooltip attached to active page */}
                  {Math.floor(selectedMonthIndex / 4) === pIdx && renderMonthlyTooltip(page)}

                  {/* SVG Smooth Curve with Gradient Area */}
                  <Svg
                    width={containerWidth}
                    height={CHART_HEIGHT}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  >
                    <Defs>
                      {/* Income Gradients */}
                      <LinearGradient id={`monthlyIncomeAreaGradient-${pIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#4DE082" stopOpacity={0.42} />
                        <Stop offset="35%" stopColor="#10B981" stopOpacity={0.22} />
                        <Stop offset="70%" stopColor="#059669" stopOpacity={0.08} />
                        <Stop offset="100%" stopColor="#131722" stopOpacity={0} />
                      </LinearGradient>
                      <LinearGradient id={`monthlyIncomeLineGradient-${pIdx}`} x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#86EFAC" />
                        <Stop offset="50%" stopColor="#4DE082" />
                        <Stop offset="100%" stopColor="#10B981" />
                      </LinearGradient>

                      {/* Expense Gradients */}
                      <LinearGradient id={`monthlyExpenseAreaGradient-${pIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#F87171" stopOpacity={0.42} />
                        <Stop offset="35%" stopColor="#EF4444" stopOpacity={0.22} />
                        <Stop offset="70%" stopColor="#DC2626" stopOpacity={0.08} />
                        <Stop offset="100%" stopColor="#131722" stopOpacity={0} />
                      </LinearGradient>
                      <LinearGradient id={`monthlyExpenseLineGradient-${pIdx}`} x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#FCA5A5" />
                        <Stop offset="50%" stopColor="#F87171" />
                        <Stop offset="100%" stopColor="#EF4444" />
                      </LinearGradient>
                    </Defs>

                    {/* Subtle Horizontal Dashed Guidelines */}
                    <Line x1={16} y1={90} x2={containerWidth - 16} y2={90} stroke="#B2C5FF" strokeOpacity={0.08} strokeDasharray="4 4" strokeWidth={1} />
                    <Line x1={16} y1={150} x2={containerWidth - 16} y2={150} stroke="#B2C5FF" strokeOpacity={0.08} strokeDasharray="4 4" strokeWidth={1} />

                    {/* Expense Area & Lines */}
                    <Path d={page.expenseSpline.areaPath} fill={`url(#monthlyExpenseAreaGradient-${pIdx})`} />
                    <Path d={page.expenseSpline.linePath} stroke="#EF4444" strokeWidth={6} strokeOpacity={0.22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <Path d={page.expenseSpline.linePath} stroke={`url(#monthlyExpenseLineGradient-${pIdx})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* Income Area & Lines */}
                    <Path d={page.incomeSpline.areaPath} fill={`url(#monthlyIncomeAreaGradient-${pIdx})`} />
                    <Path d={page.incomeSpline.linePath} stroke="#10B981" strokeWidth={6} strokeOpacity={0.22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <Path d={page.incomeSpline.linePath} stroke={`url(#monthlyIncomeLineGradient-${pIdx})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* Inactive Data Dots - Expenses */}
                    {page.expenseSpline.points.map((pt, mIdx) => {
                      if (Math.floor(selectedMonthIndex / 4) === pIdx && mIdx === selectedMonthIndex % 4) return null;
                      return (
                        <Circle key={`month-${pIdx}-dot-exp-${mIdx}`} cx={pt.x} cy={pt.y} r={3.5} fill="#131722" stroke="#F87171" strokeWidth={2} strokeOpacity={0.75} />
                      );
                    })}

                    {/* Inactive Data Dots - Income */}
                    {page.incomeSpline.points.map((pt, mIdx) => {
                      if (Math.floor(selectedMonthIndex / 4) === pIdx && mIdx === selectedMonthIndex % 4) return null;
                      return (
                        <Circle key={`month-${pIdx}-dot-inc-${mIdx}`} cx={pt.x} cy={pt.y} r={3.5} fill="#131722" stroke="#4DE082" strokeWidth={2} strokeOpacity={0.75} />
                      );
                    })}

                    {/* Active Selected Month Vertical Guide Line */}
                    {Math.floor(selectedMonthIndex / 4) === pIdx && page.incomeSpline.points[selectedMonthIndex % 4] && (
                      <Line
                        x1={page.incomeSpline.points[selectedMonthIndex % 4].x}
                        y1={Math.min(page.incomeSpline.points[selectedMonthIndex % 4].y, page.expenseSpline.points[selectedMonthIndex % 4].y)}
                        x2={page.incomeSpline.points[selectedMonthIndex % 4].x}
                        y2={page.incomeSpline.baselineY + 2}
                        stroke="#FFFFFF"
                        strokeOpacity={0.8}
                        strokeWidth={1.5}
                      />
                    )}
                  </Svg>

                  {/* Active Selected Month Pin Badge for Expense */}
                  {Math.floor(selectedMonthIndex / 4) === pIdx && page.expenseSpline.points[selectedMonthIndex % 4] && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="absolute z-20 items-center justify-center"
                      style={{
                        left: page.expenseSpline.points[selectedMonthIndex % 4].x - 12,
                        top: page.expenseSpline.points[selectedMonthIndex % 4].y - 12,
                        width: 24,
                        height: 24,
                      }}
                    >
                      <View className="w-6 h-6 rounded-full bg-[#F87171] items-center justify-center shadow-lg" style={{ borderWidth: 2, borderColor: "#FFFFFF", shadowColor: "#F87171", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 6, elevation: 6 }}>
                        <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M 2.5 6.2 L 4.8 8.5 L 9.5 3.5" fill="none" stroke="#ffffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                      </View>
                    </Animated.View>
                  )}

                  {/* Active Selected Month Pin Checkmark Badge for Income */}
                  {Math.floor(selectedMonthIndex / 4) === pIdx && page.incomeSpline.points[selectedMonthIndex % 4] && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="absolute z-20 items-center justify-center"
                      style={{
                        left: page.incomeSpline.points[selectedMonthIndex % 4].x - 12,
                        top: page.incomeSpline.points[selectedMonthIndex % 4].y - 12,
                        width: 24,
                        height: 24,
                      }}
                    >
                      <View className="w-6 h-6 rounded-full bg-[#4DE082] items-center justify-center shadow-lg" style={{ borderWidth: 2, borderColor: "#FFFFFF", shadowColor: "#4DE082", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 6, elevation: 6 }}>
                        <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M 2.5 6.2 L 4.8 8.5 L 9.5 3.5" fill="none" stroke="#ffffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                      </View>
                    </Animated.View>
                  )}

                  {/* Baseline */}
                  <View className="w-full h-[1.5px] bg-[#B2C5FF]/30 mb-2.5 rounded-full" />

                  {/* Month Labels with unified column center alignment */}
                  <View
                    style={{
                      paddingHorizontal: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {page.months.map((item, idx) => {
                      const absoluteMonthIndex = pIdx * 4 + idx;
                      const isSelected = selectedMonthIndex === absoluteMonthIndex;
                      const monthSlotWidth = (containerWidth - 12) / 4;
                      return (
                        <TouchableOpacity
                          key={`month-label-${pIdx}-${item.shortName}-${idx}`}
                          activeOpacity={0.75}
                          onPress={() => setSelectedMonthIndex(absoluteMonthIndex)}
                          style={{ width: monthSlotWidth }}
                          className="items-center justify-center py-1"
                        >
                          <Text
                            className={`text-[13px] uppercase tracking-wider font-semibold ${isSelected
                              ? "text-[#B2C5FF]"
                              : "text-[#8D909F]"
                              }`}
                          >
                            {item.shortName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          ) : (
            /* Trend Mode (Net Worth Custom Scrollable Bar Chart) */
            <Animated.ScrollView
              key="trend-scroll"
              ref={trendScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={trendScrollHandler}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleTrendMomentumScrollEnd}
              contentOffset={{
                x:
                  Math.floor(currentMonth / 6) *
                  (containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_WIDTH),
                y: 0,
              }}
              style={{ width: containerWidth, height: CHART_HEIGHT, overflow: "hidden" }}
              contentContainerStyle={{ width: containerWidth * 2, height: CHART_HEIGHT }}
            >
              {trendPages.map((page, pIdx) => (
                <View
                  key={`trend-page-${pIdx}`}
                  style={{ width: containerWidth, height: CHART_HEIGHT }}
                  className="justify-end relative"
                >
                  {/* Tooltip */}
                  {Math.floor(selectedMonthIndex / 6) === pIdx && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="absolute z-30 bg-[#1A1F30] rounded-lg px-2.5 py-1.5 border border-[#B2C5FF]/15 items-center justify-center"
                      style={[getTrendTooltipStyle(pIdx), styles.floatingTooltip]}
                    >
                      <Text className="text-[12.5px] font-black text-white">
                        {currencySymbol}
                        {monthlyChartData[selectedMonthIndex]?.netWorth.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </Text>
                    </Animated.View>
                  )}

                  {/* SVG Bar Chart */}
                  <Svg
                    width={containerWidth}
                    height={CHART_HEIGHT}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  >
                    <Defs>
                      <LinearGradient id={`trendBarGradient-${pIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#d0dcffff" stopOpacity={0.9} />
                        <Stop offset="50%" stopColor="#97adefff" stopOpacity={0.7} />
                        <Stop offset="90%" stopColor="#131722" stopOpacity={0.2} />
                      </LinearGradient>
                      <LinearGradient id={`activeTrendBarGradient-${pIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                        <Stop offset="50%" stopColor="rgba(148, 175, 255, 1)" stopOpacity={1} />
                        <Stop offset="95%" stopColor="#131722" stopOpacity={0.7} />
                      </LinearGradient>
                      <LinearGradient id={`activeTrendBarBorderGradient-${pIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                        <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.6} />
                        <Stop offset="95%" stopColor="#131722" stopOpacity={0.1} />
                      </LinearGradient>
                      <RadialGradient id={`cloudShadow-${pIdx}`} cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#000000" stopOpacity={0.65} />
                        <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
                      </RadialGradient>
                    </Defs>

                    {/* Background Lines and Y-Axis Labels */}
                    {[70000, 52500, 35000, 17500, 0].map((val) => {
                      const maxBarHeight = (CHART_HEIGHT - 32) - 40;
                      // Compress the Y-axis grid downwards by 15px so bars can visually exceed it
                      const y = (CHART_HEIGHT - 32) - (val / 70000) * (maxBarHeight - 15);
                      return (
                        <React.Fragment key={`y-axis-${val}`}>
                          <SvgText x={22} y={y + 3} fill="#8D909F" fontSize={9} textAnchor="end" fontWeight="500">
                            {val === 0 ? "" : `${val / 1000}k`}
                          </SvgText>
                          <Line x1={28} y1={y} x2={containerWidth - 6} y2={y} stroke="#B2C5FF" strokeOpacity={0.1} strokeDasharray="4 4" strokeWidth={1} />
                        </React.Fragment>
                      );
                    })}

                    {/* Render Bars */}
                    {page.months.map((item, idx) => {
                      const absoluteMonthIndex = pIdx * 6 + idx;
                      const monthData = monthlyChartData[absoluteMonthIndex];
                      const val = monthData ? Math.min(monthData.netWorth, 70000) : 0;

                      const maxBarHeight = (CHART_HEIGHT - 32) - 40;
                      const barHeight = Math.max(12, (val / 70000) * maxBarHeight);

                      const leftPad = 25;
                      const rightPad = 6;
                      const slotWidth = (containerWidth - leftPad - rightPad) / 6;
                      const centerX = leftPad + (idx + 0.5) * slotWidth;
                      const barWidth = 40;
                      const barX = centerX - barWidth / 2;
                      const barY = (CHART_HEIGHT - 32) - barHeight;

                      const isSelected = selectedMonthIndex === absoluteMonthIndex;

                      return (
                        <React.Fragment key={`trend-bar-${absoluteMonthIndex}`}>
                          {/* Dark cloud shadow for floating effect */}
                          <Ellipse
                            cx={centerX}
                            cy={(CHART_HEIGHT - 32) + 2}
                            rx={barWidth * 0.7}
                            ry={4}
                            fill={`url(#cloudShadow-${pIdx})`}
                          />

                          {/* Gradient Card (Bar) */}
                          <Path
                            d={`
                              M ${barX} ${(CHART_HEIGHT - 32)}
                              L ${barX} ${barY + 6}
                              A 6 6 0 0 1 ${barX + 6} ${barY}
                              L ${barX + barWidth - 6} ${barY}
                              A 6 6 0 0 1 ${barX + barWidth} ${barY + 6}
                              L ${barX + barWidth} ${(CHART_HEIGHT - 32)}
                              Z
                            `}
                            fill={isSelected ? `url(#activeTrendBarGradient-${pIdx})` : `url(#trendBarGradient-${pIdx})`}
                            stroke={isSelected ? `url(#activeTrendBarBorderGradient-${pIdx})` : `url(#trendBarGradient-${pIdx})`}
                            strokeOpacity={1}
                            strokeWidth={2.5}
                          />

                          {/* Active Selected Month Guide Line */}
                          {isSelected && (
                            <Line
                              x1={centerX}
                              y1={barY}
                              x2={centerX}
                              y2={CHART_HEIGHT - 32}
                              stroke="#FFFFFF"
                              strokeOpacity={0.8}
                              strokeWidth={1.5}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Svg>

                  {/* Active Selected Check Badge */}
                  {Math.floor(selectedMonthIndex / 6) === pIdx && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="absolute z-20 items-center justify-center"
                      style={{
                        left: (25 + ((selectedMonthIndex % 6) + 0.5) * ((containerWidth - 31) / 6)) - 12,
                        top: ((CHART_HEIGHT - 32) - Math.max(12, (Math.min(monthlyChartData[selectedMonthIndex]?.netWorth || 0, 70000) / 70000) * ((CHART_HEIGHT - 32) - 40))) - 12,
                        width: 24,
                        height: 24,
                      }}
                    >
                      <View className="w-6 h-6 rounded-full bg-[#3B82F6] items-center justify-center shadow-lg" style={{ borderWidth: 2, borderColor: "#FFFFFF", shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 6, elevation: 6 }}>
                        <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M 2.5 6.2 L 4.8 8.5 L 9.5 3.5" fill="none" stroke="#ffffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                      </View>
                    </Animated.View>
                  )}

                  {/* Baseline */}
                  <View className="w-full h-[1.5px] bg-[#B2C5FF]/30 mb-2.5 rounded-full" />

                  {/* Month Labels */}
                  <View
                    style={{
                      paddingLeft: 21,
                      paddingRight: 2,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {page.months.map((item, idx) => {
                      const absoluteMonthIndex = pIdx * 6 + idx;
                      const isSelected = selectedMonthIndex === absoluteMonthIndex;
                      const monthSlotWidth = (containerWidth - 31) / 6;
                      return (
                        <TouchableOpacity
                          key={`trend-label-${pIdx}-${item.shortName}-${idx}`}
                          activeOpacity={0.75}
                          onPress={() => setSelectedMonthIndex(absoluteMonthIndex)}
                          style={{ width: monthSlotWidth }}
                          className="items-center justify-center py-1"
                        >
                          <Text
                            className={`text-[12px] uppercase tracking-wider font-semibold ${isSelected
                              ? "text-[#B2C5FF]"
                              : "text-[#8D909F]"
                              }`}
                          >
                            {item.shortName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          )}
        </View>

        {/* Dynamic Pagination Dots (3 Dots for Monthly, 4-6 Dots for Weekly) */}
        {selectedPeriod === "Monthly" ? (
          <View className="flex-row items-center justify-center gap-1.5 mt-3">
            {[monthDot0Style, monthDot1Style, monthDot2Style].map((style, idx) => (
              <Pressable key={`month-dot-${idx}`} onPress={() => toggleMonthlyPage(idx)} hitSlop={8}>
                <Animated.View
                  style={[
                    { height: 6, borderRadius: 3, backgroundColor: "#B2C5FF" },
                    style,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        ) : selectedPeriod === "Weekly" ? (
          <View className="flex-row items-center justify-center gap-1.5 mt-3">
            {monthWeeksData.map((week) => {
              const wIdx = week.weekIndex;
              return (
                <Pressable
                  key={`week-dot-pill-${wIdx}`}
                  onPress={() => toggleWeeklyPage(wIdx)}
                  hitSlop={8}
                >
                  <Animated.View
                    style={[
                      { height: 6, borderRadius: 3, backgroundColor: "#B2C5FF" },
                      wIdx === 0
                        ? weekDot0Style
                        : wIdx === 1
                          ? weekDot1Style
                          : wIdx === 2
                            ? weekDot2Style
                            : wIdx === 3
                              ? weekDot3Style
                              : wIdx === 4
                                ? weekDot4Style
                                : weekDot5Style,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : selectedPeriod === "Trend" ? (
          <View className="flex-row items-center justify-center gap-1.5 mt-3">
            {[trendDot0Style, trendDot1Style].map((style, idx) => (
              <Pressable key={`trend-dot-${idx}`} onPress={() => toggleTrendPage(idx)} hitSlop={8}>
                <Animated.View
                  style={[
                    { height: 6, borderRadius: 3, backgroundColor: "#B2C5FF" },
                    style,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingTooltip: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default NetWorthAnalyticsCard;
