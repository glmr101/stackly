import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useAppStore } from "@/store/useAppStore";

const CHART_WIDTH = Dimensions.get("window").width - 40; // mx-5 = 20px each side

export function BudgetSavingsChart() {
  const categories = useAppStore((state) => state.categories);
  const budgetGoals = useAppStore((state) => state.budgetGoals);
  const savingsGoals = useAppStore((state) => state.savingsGoals);
  const transactions = useAppStore((state) => state.transactions);
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || "$";

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculate spent per category for current month
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

  // --- Budget Aggregates & Pie Chart Data ---
  const totalMonthlyLimit = budgetGoals.reduce(
    (sum, g) => sum + g.monthlyLimit,
    0
  );
  const totalMonthlySpent = budgetGoals.reduce((sum, g) => {
    return sum + (spentPerCategory[g.categoryId] || 0);
  }, 0);
  const budgetRemaining = Math.max(totalMonthlyLimit - totalMonthlySpent, 0);
  const isBudgetOver = totalMonthlySpent > totalMonthlyLimit;
  const overallBudgetProgress =
    totalMonthlyLimit > 0
      ? Math.min((totalMonthlySpent / totalMonthlyLimit) * 100, 100)
      : 0;

  const activeSpentSlices = budgetGoals
    .map((goal) => {
      const cat = categories.find((c) => c.id === goal.categoryId);
      const spent = spentPerCategory[goal.categoryId] || 0;
      return {
        value: spent,
        color: cat?.color || "#4de082",
        text: cat?.name || "Category",
      };
    })
    .filter((slice) => slice.value > 0);

  let budgetPieData = activeSpentSlices;
  if (budgetPieData.length === 0) {
    budgetPieData = [{ value: 1, color: "#313540", text: "No spending" }];
  } else if (budgetRemaining > 0) {
    budgetPieData = [
      ...budgetPieData,
      { value: budgetRemaining, color: "#262a35", text: "Remaining" },
    ];
  }

  // --- Savings Aggregates & Pie Chart Data ---
  const totalSavingsTarget = savingsGoals.reduce(
    (sum, g) => sum + g.targetAmount,
    0
  );
  const totalSavingsCurrent = savingsGoals.reduce(
    (sum, g) => sum + g.currentAmount,
    0
  );
  const savingsRemaining = Math.max(totalSavingsTarget - totalSavingsCurrent, 0);
  const overallSavingsProgress =
    totalSavingsTarget > 0
      ? Math.min((totalSavingsCurrent / totalSavingsTarget) * 100, 100)
      : 0;

  const activeSavingsSlices = savingsGoals
    .map((goal) => ({
      value: goal.currentAmount,
      color: goal.color || "#5B8CFF",
      text: goal.name,
    }))
    .filter((slice) => slice.value > 0);

  let savingsPieData = activeSavingsSlices;
  if (savingsPieData.length === 0) {
    savingsPieData = [{ value: 1, color: "#313540", text: "No savings" }];
  } else if (savingsRemaining > 0) {
    savingsPieData = [
      ...savingsPieData,
      { value: savingsRemaining, color: "#262a35", text: "Remaining" },
    ];
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / CHART_WIDTH);
    setActiveIndex(page);
  };

  const hasBudgets = budgetGoals.length > 0;
  const hasSavings = savingsGoals.length > 0;

  if (!hasBudgets && !hasSavings) return null;

  return (
    <View className="mx-5 mb-6">
      {/* Chart Container */}
      <View className="bg-surface-container rounded-[28px] border border-outline-variant/30 overflow-hidden shadow-lg">
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Page 1: Monthly Budget Donut / Pie Chart */}
          <View style={{ width: CHART_WIDTH }} className="p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Monthly Budget
                </Text>
                <Text className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  {currencySymbol}{totalMonthlySpent.toLocaleString()} of {currencySymbol}{totalMonthlyLimit.toLocaleString()}
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full border ${
                  isBudgetOver
                    ? "bg-error/15 border-error/30"
                    : "bg-surface-container-high border-outline-variant/30"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    isBudgetOver ? "text-error" : "text-secondary"
                  }`}
                >
                  {isBudgetOver
                    ? "Over Budget"
                    : `${overallBudgetProgress.toFixed(0)}% Used`}
                </Text>
              </View>
            </View>

            {hasBudgets ? (
              <View className="flex-row items-center justify-center gap-4 py-1">
                <PieChart
                  data={budgetPieData}
                  donut
                  radius={58}
                  innerRadius={38}
                  innerCircleColor="#1c1f2a"
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-xs font-extrabold text-on-surface">
                        {currencySymbol}
                        {totalMonthlySpent >= 1000
                          ? `${(totalMonthlySpent / 1000).toFixed(1)}k`
                          : totalMonthlySpent.toFixed(0)}
                      </Text>
                      <Text
                        className={`text-[8px] font-bold uppercase ${
                          isBudgetOver ? "text-error" : "text-on-surface-variant"
                        }`}
                      >
                        {isBudgetOver ? "Over" : "Spent"}
                      </Text>
                    </View>
                  )}
                  isAnimated
                  animationDuration={500}
                />

                {/* Budget Legend */}
                <View className="flex-1 gap-2.5">
                  {budgetGoals.map((goal) => {
                    const cat = categories.find((c) => c.id === goal.categoryId);
                    if (!cat) return null;
                    const spent = spentPerCategory[goal.categoryId] || 0;
                    const pct =
                      goal.monthlyLimit > 0
                        ? ((spent / goal.monthlyLimit) * 100).toFixed(0)
                        : "0";
                    const isOver = spent > goal.monthlyLimit;

                    return (
                      <View key={goal.id} className="flex-row items-center gap-2">
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: isOver
                              ? "#FFB4AB"
                              : cat.color || "#4de082",
                          }}
                        />
                        <View className="flex-1">
                          <Text
                            className="text-[11px] font-bold text-on-surface"
                            numberOfLines={1}
                          >
                            {cat.name}
                          </Text>
                          <Text className="text-[9px] text-on-surface-variant font-medium">
                            {currencySymbol}{spent.toLocaleString()} / {currencySymbol}{goal.monthlyLimit.toLocaleString()} (
                            <Text
                              className={`font-bold ${
                                isOver ? "text-error" : "text-on-surface-variant"
                              }`}
                            >
                              {isOver ? "Over" : `${pct}%`}
                            </Text>
                            )
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="h-[130px] items-center justify-center">
                <Text className="text-xs text-on-surface-variant font-medium">
                  No budget goals set
                </Text>
              </View>
            )}
          </View>

          {/* Page 2: Savings Progress Donut / Pie Chart */}
          <View style={{ width: CHART_WIDTH }} className="p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Savings Progress
                </Text>
                <Text className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  {currencySymbol}{totalSavingsCurrent.toLocaleString()} of {currencySymbol}{totalSavingsTarget.toLocaleString()}
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30">
                <Text className="text-[10px] font-bold text-primary-container">
                  {totalSavingsTarget > 0
                    ? `${overallSavingsProgress.toFixed(0)}% Reached`
                    : "No Target"}
                </Text>
              </View>
            </View>

            {hasSavings ? (
              <View className="flex-row items-center justify-center gap-4 py-1">
                <PieChart
                  data={savingsPieData}
                  donut
                  radius={58}
                  innerRadius={38}
                  innerCircleColor="#1c1f2a"
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-xs font-extrabold text-on-surface">
                        {currencySymbol}
                        {totalSavingsCurrent >= 1000
                          ? `${(totalSavingsCurrent / 1000).toFixed(1)}k`
                          : totalSavingsCurrent.toFixed(0)}
                      </Text>
                      <Text className="text-[8px] text-on-surface-variant font-bold uppercase">
                        Saved
                      </Text>
                    </View>
                  )}
                  isAnimated
                  animationDuration={500}
                />

                {/* Savings Legend */}
                <View className="flex-1 gap-2.5">
                  {savingsGoals.map((goal) => {
                    const pct =
                      goal.targetAmount > 0
                        ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)
                        : "0";
                    return (
                      <View key={goal.id} className="flex-row items-center gap-2">
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: goal.color || "#5B8CFF" }}
                        />
                        <View className="flex-1">
                          <Text
                            className="text-[11px] font-bold text-on-surface"
                            numberOfLines={1}
                          >
                            {goal.name}
                          </Text>
                          <Text className="text-[9px] text-on-surface-variant font-medium">
                            {currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()} ({pct}%)
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="h-[130px] items-center justify-center">
                <Text className="text-xs text-on-surface-variant font-medium">
                  No savings goals set
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Page Indicator Dots */}
        <View className="flex-row items-center justify-center gap-1.5 pb-3">
          {[0, 1].map((i) => (
            <View
              key={i}
              className={`rounded-full ${
                activeIndex === i
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-outline-variant"
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
