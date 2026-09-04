import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { useAppStore } from "@/store/useAppStore";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AnimatedBox } from "@/components/ui/AnimatedBox";
import { ScaleButton } from "@/components/ui/ScaleButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");


function formatRemainingTime(targetDateStr?: string): string | null {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past due";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "1 day left";
  if (diffDays < 30) return `${diffDays} days left`;

  const diffMonths = Math.round(diffDays / 30.4375);
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "mo" : "mos"} left`;
  }

  const diffYears = (diffDays / 365.25).toFixed(1);
  return `${diffYears.endsWith(".0") ? diffYears.slice(0, -2) : diffYears} ${diffYears === "1.0" ? "yr" : "yrs"
    } left`;
}

export default function Budgets() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const categories = useAppStore((state) => state.categories);
  const budgetGoals = useAppStore((state) => state.budgetGoals);
  const savingsGoals = useAppStore((state) => state.savingsGoals);
  const transactions = useAppStore((state) => state.transactions);
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || "$";

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  // Compute current month expenses per category
  const spentPerCategory: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === "expense" && tx.categoryId) {
      const txDate = new Date(tx.date);
      if (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      ) {
        spentPerCategory[tx.categoryId] =
          (spentPerCategory[tx.categoryId] || 0) + tx.amount;
      }
    }
  });

  // Aggregated totals across all configured budget goals
  const totalBudgetLimit = budgetGoals.reduce((sum, g) => sum + g.monthlyLimit, 0);
  const totalBudgetSpent = budgetGoals.reduce(
    (sum, g) => sum + (spentPerCategory[g.categoryId] || 0),
    0
  );
  const totalBudgetRemaining = Math.max(totalBudgetLimit - totalBudgetSpent, 0);
  const isBudgetOver = totalBudgetSpent > totalBudgetLimit;
  const budgetOverAmount = Math.max(totalBudgetSpent - totalBudgetLimit, 0);
  const overallBudgetPercentage =
    totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  // Aggregated totals across all configured savings goals
  const totalSavingsCurrent = savingsGoals.reduce(
    (sum, g) => sum + g.currentAmount,
    0
  );
  const totalSavingsTarget = savingsGoals.reduce(
    (sum, g) => sum + g.targetAmount,
    0
  );
  const savingsGoalsCount = savingsGoals.length;
  const averageSavingsCurrent =
    savingsGoalsCount > 0 ? totalSavingsCurrent / savingsGoalsCount : 0;
  const overallSavingsPercentage =
    totalSavingsTarget > 0
      ? Math.min((totalSavingsCurrent / totalSavingsTarget) * 100, 100)
      : 0;

  const handleHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / SCREEN_WIDTH);
    if (page !== activeHeroIndex && (page === 0 || page === 1)) {
      setActiveHeroIndex(page);
    }
  };

  const hasGoals = budgetGoals.length > 0 || savingsGoals.length > 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Header */}
      <AnimatedBox
        delay={0}
        className="h-16 px-5 flex-row items-center justify-between z-50"
      >
        <View>
          <Text className="text-4xl font-extrabold text-on-surface tracking-tight">
            Budgets & Savings
          </Text>

        </View>
      </AnimatedBox>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Swipeable Hero Summary Card Carousel */}
        {hasGoals && (
          <AnimatedBox delay={30} className="mt-3 mb-5">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleHeroScroll}
              scrollEventThrottle={16}
            >
              {/* CARD 1: Monthly Budget Summary */}
              <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 20 }}>
                <View className="p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative">
                  <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      {isBudgetOver ? "Budget Exceeded" : "Remaining Budget"}
                    </Text>
                    <View
                      className={`px-2.5 py-0.5 rounded-full border ${isBudgetOver
                        ? "bg-error/15 border-error/30"
                        : overallBudgetPercentage >= 80
                          ? "bg-amber-400/15 border-amber-400/30"
                          : "bg-secondary/15 border-secondary/30"
                        }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${isBudgetOver
                          ? "text-error"
                          : overallBudgetPercentage >= 80
                            ? "text-amber-400"
                            : "text-secondary"
                          }`}
                      >
                        {isBudgetOver
                          ? "Over Budget"
                          : `${overallBudgetPercentage.toFixed(0)}% Used`}
                      </Text>
                    </View>
                  </View>

                  {/* Large Primary Hero Number */}
                  <View className="my-1">
                    <AnimatedCounter
                      value={isBudgetOver ? budgetOverAmount : totalBudgetRemaining}
                      prefix={isBudgetOver ? `-${currencySymbol}` : currencySymbol}
                      decimals={2}
                      showDecimalsSmall={true}
                      className={`text-4xl font-extrabold tracking-tight ${isBudgetOver ? "text-error" : "text-on-surface"
                        }`}
                      decimalClassName={`text-2xl font-bold ml-1 ${isBudgetOver ? "text-error" : "text-secondary"
                        }`}
                    />
                  </View>

                  {/* Supporting Metrics */}
                  <View className="flex-row gap-3 mt-5 pt-4 border-t border-white/5">
                    <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
                      <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                        Total Spent
                      </Text>
                      <AnimatedCounter
                        value={totalBudgetSpent}
                        prefix={currencySymbol}
                        decimals={0}
                        className="text-base font-bold text-on-surface"
                      />
                    </View>
                    <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
                      <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                        Monthly Limit
                      </Text>
                      <AnimatedCounter
                        value={totalBudgetLimit}
                        prefix={currencySymbol}
                        decimals={0}
                        className="text-base font-bold text-on-surface"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* CARD 2: Savings Summary (with Average Total of Savings) */}
              <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 20 }}>
                <View className="p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative">
                  <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />

                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Total Savings
                    </Text>
                    <View
                      className={`px-2.5 py-0.5 rounded-full border ${overallSavingsPercentage >= 100
                        ? "bg-secondary/15 border-secondary/30"
                        : "bg-primary/15 border-primary/30"
                        }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${overallSavingsPercentage >= 100
                          ? "text-secondary"
                          : "text-primary"
                          }`}
                      >
                        {overallSavingsPercentage >= 100
                          ? "Fully Funded"
                          : `${overallSavingsPercentage.toFixed(0)}% Saved`}
                      </Text>
                    </View>
                  </View>

                  {/* Large Primary Hero Number */}
                  <View className="my-1">
                    <AnimatedCounter
                      value={totalSavingsCurrent}
                      prefix={currencySymbol}
                      decimals={2}
                      showDecimalsSmall={true}
                      className="text-4xl font-extrabold tracking-tight text-on-surface"
                      decimalClassName="text-2xl font-bold ml-1 text-primary"
                    />
                  </View>

                  {/* Supporting Metrics: Average Total of Savings & Total Target */}
                  <View className="flex-row gap-3 mt-5 pt-4 border-t border-white/5">
                    <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
                      <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                        Avg / Goal ({savingsGoalsCount})
                      </Text>
                      <AnimatedCounter
                        value={averageSavingsCurrent}
                        prefix={currencySymbol}
                        decimals={0}
                        className="text-base font-bold text-on-surface"
                      />
                    </View>
                    <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
                      <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                        Target Total
                      </Text>
                      <AnimatedCounter
                        value={totalSavingsTarget}
                        prefix={currencySymbol}
                        decimals={0}
                        className="text-base font-bold text-on-surface"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Pagination Indicators */}
            <View className="flex-row items-center justify-center gap-1.5 mt-3">
              <View
                className={`h-1.5 rounded-full ${activeHeroIndex === 0 ? "w-6 bg-primary" : "w-1.5 bg-outline-variant/40"
                  }`}
              />
              <View
                className={`h-1.5 rounded-full ${activeHeroIndex === 1 ? "w-6 bg-primary" : "w-1.5 bg-outline-variant/40"
                  }`}
              />
            </View>
          </AnimatedBox>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: BUDGET GOALS */}
        {/* ========================================================================= */}
        <AnimatedBox delay={60} className="px-5 mb-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-on-surface tracking-tight">
              Budget Goals
            </Text>
            <View className="bg-surface-container-high px-2 py-0.5 rounded-full">
              <Text className="text-[11px] font-bold text-primary">
                {budgetGoals.length}
              </Text>
            </View>
          </View>

          <ScaleButton
            activeScale={0.88}
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 items-center justify-center shadow-sm"
            onPress={() => router.push("/set-budget")}
          >
            <MaterialIcons name="add" size={18} color="#B2C5FF" />
          </ScaleButton>
        </AnimatedBox>

        {budgetGoals.length > 0 ? (
          <AnimatedBox delay={80} className="px-5 flex-col gap-3.5 mb-8">
            {budgetGoals.map((goal) => {
              const cat = categories.find((c) => c.id === goal.categoryId);
              if (!cat) return null;

              const spent = spentPerCategory[cat.id] || 0;
              const limit = goal.monthlyLimit;
              const percentage = limit > 0 ? (spent / limit) * 100 : 0;
              const isOver = spent > limit;
              const isApproaching = percentage >= 80 && !isOver;
              const remaining = Math.max(limit - spent, 0);
              const overAmount = Math.max(spent - limit, 0);

              // Meaningful Color Logic
              const ringColor = isOver
                ? "#FFB4AB" // error / over budget
                : isApproaching
                  ? "#FBBF24" // amber / approaching limit
                  : "#4DE082"; // secondary / on track

              // Gifted Charts PieChart Donut Data
              let chartData;
              if (spent <= 0) {
                chartData = [{ value: 1, color: "#262A35" }];
              } else if (isOver) {
                chartData = [{ value: 1, color: ringColor }];
              } else {
                chartData = [
                  { value: spent, color: ringColor },
                  { value: limit - spent, color: "#262A35" },
                ];
              }

              return (
                <ScaleButton
                  key={goal.id}
                  activeScale={0.97}
                  onPress={() =>
                    router.push({
                      pathname: "/set-budget",
                      params: {
                        categoryId: goal.categoryId,
                        goalId: goal.id,
                      },
                    })
                  }
                  className="bg-surface-container rounded-[24px] p-4 border border-outline-variant/30 shadow-sm flex-row items-center gap-4"
                >
                  {/* Radial Progress Donut */}
                  <View className="items-center justify-center w-[72px] h-[72px]">
                    <PieChart
                      data={chartData}
                      donut
                      radius={34}
                      innerRadius={24}
                      innerCircleColor="#1C1F2A"
                      centerLabelComponent={() => (
                        <Text
                          className={`text-[10px] font-extrabold ${isOver
                            ? "text-error"
                            : isApproaching
                              ? "text-amber-400"
                              : "text-secondary"
                            }`}
                        >
                          {percentage >= 1000 ? "999%" : `${percentage.toFixed(0)}%`}
                        </Text>
                      )}
                    />
                  </View>

                  {/* Direct Text Information Hierarchy */}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-2 flex-1 mr-2">
                        <View
                          className="w-6 h-6 rounded-lg items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <MaterialIcons
                            name={cat.icon as any}
                            size={14}
                            color={cat.color}
                          />
                        </View>
                        <Text
                          className="text-sm font-bold text-on-surface"
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                      </View>

                      <MaterialIcons name="chevron-right" size={18} color="#8D909F" />
                    </View>

                    {/* Hero Text */}
                    <View className="my-0.5">
                      {isOver ? (
                        <Text className="text-base font-extrabold text-error">
                          Over by {currencySymbol}
                          {overAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      ) : (
                        <Text className="text-base font-extrabold text-on-surface">
                          {currencySymbol}
                          {remaining.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{" "}
                          <Text className="text-xs font-semibold text-secondary">
                            remaining
                          </Text>
                        </Text>
                      )}
                    </View>

                    {/* Supporting Text */}
                    <Text
                      className="text-xs text-on-surface-variant font-medium mt-0.5"
                      numberOfLines={1}
                    >
                      Limit: {currencySymbol}
                      {limit.toLocaleString()} • Spent: {currencySymbol}
                      {spent.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </Text>

                    {/* Budget Pace Warning */}
                    {(() => {
                      const today = new Date();
                      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                      const timeElapsedPct = (today.getDate() / daysInMonth) * 100;
                      if (!isOver && percentage > timeElapsedPct + 15) {
                        return (
                          <Text className="text-xs font-medium mt-0.5" style={{ color: "#FBBF24" }}>
                            Spending faster than usual this month
                          </Text>
                        );
                      }
                      return null;
                    })()}
                  </View>
                </ScaleButton>
              );
            })}
          </AnimatedBox>
        ) : (
          <AnimatedBox delay={80} className="mx-5 mb-8">
            <View className="p-6 bg-surface-container rounded-[24px] border border-outline-variant/30 items-center justify-center">
              <Text className="text-xs text-on-surface-variant text-center mb-3">
                No budget goals configured. Set limits to track your category spend.
              </Text>
              <ScaleButton
                activeScale={0.92}
                onPress={() => router.push("/set-budget")}
                className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-xl flex-row items-center gap-1.5"
              >
                <MaterialIcons name="add" size={16} color="#B2C5FF" />
                <Text className="text-xs font-bold text-primary">
                  Set Budget
                </Text>
              </ScaleButton>
            </View>
          </AnimatedBox>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: SAVINGS GOALS */}
        {/* ========================================================================= */}
        <AnimatedBox
          delay={100}
          className="px-5 mb-3.5 mt-2 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-on-surface tracking-tight">
              Savings Goals
            </Text>
            <View className="bg-primary/20 px-2 py-0.5 rounded-full">
              <Text className="text-[11px] font-bold text-primary">
                {savingsGoals.length}
              </Text>
            </View>
          </View>

          <ScaleButton
            activeScale={0.88}
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 items-center justify-center shadow-sm"
            onPress={() => router.push("/add-savings-goal")}
          >
            <MaterialIcons name="add" size={18} color="#B2C5FF" />
          </ScaleButton>
        </AnimatedBox>

        {savingsGoals.length > 0 ? (
          <AnimatedBox delay={120} className="px-5 flex-col gap-3.5">
            {savingsGoals.map((goal) => {
              const current = goal.currentAmount;
              const target = goal.targetAmount;
              const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
              const isComplete = current >= target;
              const timeIndicator = formatRemainingTime(goal.targetDate);

              // Donut Ring Color: Secondary green (#4DE082) when complete, Primary (#B2C5FF) when in progress
              const ringColor = isComplete ? "#4DE082" : "#B2C5FF";

              // Donut Data
              let chartData;
              if (current <= 0) {
                chartData = [{ value: 1, color: "#262A35" }];
              } else if (isComplete) {
                chartData = [{ value: 1, color: ringColor }];
              } else {
                chartData = [
                  { value: current, color: ringColor },
                  { value: target - current, color: "#262A35" },
                ];
              }

              return (
                <View
                  key={goal.id}
                  className="bg-surface-container rounded-[24px] p-4 border border-outline-variant/30 shadow-sm flex-col gap-3"
                >
                  <View className="flex-row items-center gap-4">
                    {/* Focal Point: Gifted Charts Radial Progress Donut */}
                    <View className="items-center justify-center w-[72px] h-[72px]">
                      <PieChart
                        data={chartData}
                        donut
                        radius={34}
                        innerRadius={24}
                        innerCircleColor="#1C1F2A"
                        centerLabelComponent={() => (
                          <View className="items-center justify-center">
                            {isComplete ? (
                              <MaterialIcons name="check" size={16} color="#4DE082" />
                            ) : (
                              <Text className="text-[10px] font-extrabold text-primary">
                                {percentage.toFixed(0)}%
                              </Text>
                            )}
                          </View>
                        )}
                      />
                    </View>

                    {/* Goal Details */}
                    <View className="flex-1 justify-center">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2 flex-1 mr-2">
                          <View className="w-6 h-6 rounded-lg bg-primary/20 items-center justify-center">
                            <MaterialIcons
                              name={(goal.icon || "savings") as any}
                              size={14}
                              color="#B2C5FF"
                            />
                          </View>
                          <Text
                            className="text-sm font-bold text-on-surface"
                            numberOfLines={1}
                          >
                            {goal.name}
                          </Text>
                        </View>

                        {/* Complete Badge or Time Indicator */}
                        {isComplete ? (
                          <View className="px-2 py-0.5 rounded-full bg-secondary/15 border border-secondary/30">
                            <Text className="text-[10px] font-bold text-secondary">
                              Funded
                            </Text>
                          </View>
                        ) : timeIndicator ? (
                          <View className="px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30">
                            <Text className="text-[10px] font-medium text-on-surface-variant">
                              {timeIndicator}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Saved Amount vs Target Amount */}
                      <View className="my-0.5">
                        <Text className="text-base font-extrabold text-on-surface">
                          {currencySymbol}
                          {current.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{" "}
                          <Text className="text-xs font-medium text-on-surface-variant">
                            of {currencySymbol}
                            {target.toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        </Text>
                      </View>

                      <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {isComplete
                          ? "Target reached! Goal is fully funded."
                          : `${currencySymbol}${(target - current).toLocaleString()} remaining to save`}
                      </Text>

                      {/* Required Pace */}
                      {goal.targetDate && !isComplete && (() => {
                        const targetDate = new Date(goal.targetDate);
                        const today = new Date();
                        const diffMs = targetDate.getTime() - today.getTime();
                        const diffDays = Math.max(diffMs / (1000 * 60 * 60 * 24), 0);
                        const remaining = target - current;

                        if (diffDays <= 0) return null;

                        const monthsRemaining = diffDays / 30.4375;
                        if (monthsRemaining >= 1) {
                          const perMonth = Math.round(remaining / monthsRemaining);
                          return (
                            <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                              Save {currencySymbol}{perMonth.toLocaleString()}/month to reach this
                            </Text>
                          );
                        } else {
                          const weeksRemaining = Math.max(diffDays / 7, 1);
                          const perWeek = Math.round(remaining / weeksRemaining);
                          return (
                            <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                              Save {currencySymbol}{perWeek.toLocaleString()} this week to reach this
                            </Text>
                          );
                        }
                      })()}
                    </View>
                  </View>

                  {/* Action Row: Real Contribution Trigger */}
                  <View className="pt-2.5 border-t border-white/5 flex-row items-center justify-end gap-2">
                    <ScaleButton
                      activeScale={0.93}
                      onPress={() =>
                        router.push({
                          pathname: "/contribute-savings",
                          params: { goalId: goal.id },
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 flex-row items-center gap-1.5"
                    >
                      <MaterialIcons name="add" size={16} color="#B2C5FF" />
                      <Text className="text-xs font-bold text-primary">
                        {isComplete ? "Add More Funds" : "Contribute"}
                      </Text>
                    </ScaleButton>
                  </View>
                </View>
              );
            })}
          </AnimatedBox>
        ) : (
          <AnimatedBox delay={120} className="mx-5 mb-8">
            <View className="p-6 bg-surface-container rounded-[24px] border border-outline-variant/30 items-center justify-center">
              <Text className="text-xs text-on-surface-variant text-center mb-3">
                No savings goals configured yet. Start saving toward a specific target.
              </Text>
              <ScaleButton
                activeScale={0.92}
                onPress={() => router.push("/add-savings-goal")}
                className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-xl flex-row items-center gap-1.5"
              >
                <MaterialIcons name="add" size={16} color="#B2C5FF" />
                <Text className="text-xs font-bold text-primary">
                  Create Savings Goal
                </Text>
              </ScaleButton>
            </View>
          </AnimatedBox>
        )}
      </ScrollView>
    </View>
  );
}
