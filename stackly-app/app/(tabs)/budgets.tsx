import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { Link } from "expo-router";

export default function Budgets() {
  const insets = useSafeAreaInsets();

  const categories = useAppStore((state) => state.categories);
  const budgetGoals = useAppStore((state) => state.budgetGoals);
  const transactions = useAppStore((state) => state.transactions);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

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

  const totalMonthlyLimit = budgetGoals.reduce(
    (sum, g) => sum + g.monthlyLimit,
    0
  );
  const totalMonthlySpent = budgetGoals.reduce((sum, g) => {
    return sum + (spentPerCategory[g.categoryId] || 0);
  }, 0);

  const overallProgress =
    totalMonthlyLimit > 0
      ? Math.min((totalMonthlySpent / totalMonthlyLimit) * 100, 100)
      : 0;

  const totalRemaining = totalMonthlyLimit - totalMonthlySpent;
  const isOverallOver = totalRemaining < 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-5 flex-row items-center justify-between z-50">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 items-center justify-center">
            <MaterialIcons name="pie-chart" size={20} color="#C084FC" />
          </View>
          <Text className="text-lg font-bold text-on-surface tracking-tight">
            Budgets & Limits
          </Text>
        </View>
        <Link href={"/add-transaction" as any} asChild>
          <ScaleButton
            activeScale={0.88}
            className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 items-center justify-center shadow-sm"
          >
            <MaterialIcons name="add" size={22} color="#B2C5FF" />
          </ScaleButton>
        </Link>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Overall Budget Hero Card */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="mx-5 mt-3 mb-6 p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative"
        >
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Monthly Budget Spent
            </Text>
            <View
              className={`px-2.5 py-0.5 rounded-full border ${
                isOverallOver
                  ? "bg-error/15 border-error/30"
                  : "bg-secondary/15 border-secondary/30"
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  isOverallOver ? "text-error" : "text-secondary"
                }`}
              >
                {isOverallOver
                  ? "Over Budget"
                  : `${(100 - overallProgress).toFixed(0)}% Left`}
              </Text>
            </View>
          </View>

          <View className="my-1 flex-row items-baseline gap-2">
            <AnimatedCounter
              value={totalMonthlySpent}
              prefix="$"
              decimals={0}
              className="text-4xl font-extrabold text-on-surface tracking-tight"
            />
            <Text className="text-sm font-semibold text-on-surface-variant">
              of ${totalMonthlyLimit.toLocaleString()}
            </Text>
          </View>

          {/* Progress Bar */}
          <AnimatedProgressBar
            progress={overallProgress}
            height={8}
            barColor={isOverallOver ? "#FFB4AB" : "#4DE082"}
            trackColor="#131722"
            className="my-3"
          />

          <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-white/5">
            <Text className="text-xs font-medium text-on-surface-variant">
              {isOverallOver ? "Over budget by" : "Remaining to spend"}
            </Text>
            <AnimatedCounter
              value={Math.abs(totalRemaining)}
              prefix={isOverallOver ? "-$" : "$"}
              decimals={2}
              className={`text-xs font-bold ${
                isOverallOver ? "text-error" : "text-secondary"
              }`}
            />
          </View>
        </Animated.View>

        {/* Category Budget Goals */}
        <View className="px-5 flex-col gap-3.5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-on-surface tracking-tight">
              Categories ({budgetGoals.length})
            </Text>
          </View>

          {budgetGoals.map((goal, index) => {
            const cat = categories.find((c) => c.id === goal.categoryId);
            if (!cat) return null;

            const spent = spentPerCategory[cat.id] || 0;
            const percentage = Math.min((spent / goal.monthlyLimit) * 100, 100);
            const isOver = spent > goal.monthlyLimit;
            const remaining = goal.monthlyLimit - spent;

            let barColor = cat.color || "#4DE082";
            if (isOver) {
              barColor = "#FFB4AB";
            } else if (percentage > 80) {
              barColor = "#FBBF24";
            }

            return (
              <Animated.View
                key={goal.id}
                entering={FadeInDown.delay(index * 70).springify()}
                className="bg-surface-container p-5 rounded-[24px] shadow-sm border border-outline-variant/30 relative overflow-hidden"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-11 h-11 rounded-2xl items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <MaterialIcons
                        name={cat.icon as any}
                        size={22}
                        color={cat.color}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-on-surface">
                        {cat.name}
                      </Text>
                      <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {percentage.toFixed(0)}% of limit
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View className="flex-row items-baseline gap-1">
                      <AnimatedCounter
                        value={spent}
                        prefix="$"
                        decimals={0}
                        className="text-base font-extrabold text-on-surface"
                      />
                      <Text className="text-xs text-on-surface-variant font-medium">
                        / ${goal.monthlyLimit.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Animated Progress Bar */}
                <AnimatedProgressBar
                  progress={percentage}
                  height={7}
                  barColor={barColor}
                  trackColor="#131722"
                  className="my-1.5"
                />

                <View className="flex-row justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                  <Text className="text-xs text-on-surface-variant font-medium">
                    {isOver ? "Over budget" : "Remaining"}
                  </Text>
                  <Text
                    className={`text-xs font-bold ${
                      isOver ? "text-error" : "text-on-surface"
                    }`}
                  >
                    {isOver
                      ? `+$${(spent - goal.monthlyLimit).toFixed(2)}`
                      : `$${remaining.toFixed(2)}`}
                  </Text>
                </View>
              </Animated.View>
            );
          })}

          {budgetGoals.length === 0 && (
            <View className="py-16 items-center justify-center bg-surface-container rounded-[24px] border border-outline-variant/20">
              <MaterialIcons
                name="track-changes"
                size={40}
                color="#C3C6D6"
                style={{ opacity: 0.5 }}
              />
              <Text className="text-sm font-semibold text-on-surface-variant mt-2">
                No budget goals configured
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
