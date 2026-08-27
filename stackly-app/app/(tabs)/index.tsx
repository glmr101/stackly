import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppStore } from "@/store/useAppStore";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const accounts = useAppStore((state) => state.accounts);
  const transactions = useAppStore((state) => state.transactions);
  const subscriptions = useAppStore((state) => state.subscriptions);
  const categories = useAppStore((state) => state.categories);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let incomeThisMonth = 0;
  let expensesThisMonth = 0;

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear
    ) {
      if (tx.type === "income") incomeThisMonth += tx.amount;
      if (tx.type === "expense") expensesThisMonth += tx.amount;
    }
  });

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const netWorthTrend = incomeThisMonth - expensesThisMonth;
  const trendIsPositive = netWorthTrend >= 0;

  // Pulse animation for trend indicator
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Upcoming bills derived from active subscriptions
  const upcomingBills = subscriptions
    .filter((sub) => sub.active)
    .sort(
      (a, b) =>
        new Date(a.nextChargeDate).getTime() -
        new Date(b.nextChargeDate).getTime()
    )
    .slice(0, 3)
    .map((sub) => {
      const date = new Date(sub.nextChargeDate);
      return {
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        dueDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        icon: sub.icon,
        color: sub.color || "#B2C5FF",
      };
    });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Navigation Bar */}
      <AnimatedBox delay={0} className="h-16 px-5 flex-row items-center justify-between z-50">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 items-center justify-center">
            <MaterialIcons name="auto-graph" size={20} color="#B2C5FF" />
          </View>
          <View>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Welcome Back
            </Text>
            <Text className="text-lg font-bold text-on-surface tracking-tight">
              Stackly Overview
            </Text>
          </View>
        </View>

        <Link href={"/settings" as any} asChild>
          <ScaleButton
            activeScale={0.88}
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
          >
            <MaterialIcons name="settings" size={20} color="#C3C6D6" />
          </ScaleButton>
        </Link>
      </AnimatedBox>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Net Worth Card */}
        <AnimatedBox
          delay={60}
          className="mx-5 mt-3 mb-6 p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative"
        >
          {/* Ambient Glow Orbs in Background */}
          <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <View className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

          {/* Header row */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Net Worth
            </Text>
            <View className="flex-row items-center gap-1.5 bg-surface-container-highest/80 px-2.5 py-1 rounded-full border border-white/5">
              <View className="relative w-2 h-2 items-center justify-center">
                <Animated.View
                  className={`absolute w-full h-full rounded-full ${
                    trendIsPositive ? "bg-secondary" : "bg-error"
                  }`}
                  style={animatedPulseStyle}
                />
                <View
                  className={`w-1.5 h-1.5 rounded-full ${
                    trendIsPositive ? "bg-secondary" : "bg-error"
                  }`}
                />
              </View>
              <Text
                className={`text-[11px] font-bold ${
                  trendIsPositive ? "text-secondary" : "text-error"
                }`}
              >
                {trendIsPositive ? "+" : "-"}$
                {Math.abs(netWorthTrend).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          </View>

          {/* Animated Large Net Worth Number */}
          <View className="my-1">
            <AnimatedCounter
              value={totalNetWorth}
              prefix="$"
              decimals={2}
              className="text-4xl font-extrabold text-on-surface tracking-tight"
            />
          </View>

          <Text className="text-xs text-on-surface-variant font-medium mt-1">
            Net cash flow calculated for this current month
          </Text>

          {/* Cash Flow Summary Badges */}
          <View className="flex-row items-center gap-3 mt-5 pt-4 border-t border-white/5">
            <View className="flex-1 bg-surface-container-low/90 rounded-2xl p-3 border border-secondary/15 flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-full bg-secondary/15 items-center justify-center">
                <MaterialIcons name="arrow-downward" size={16} color="#4DE082" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Income
                </Text>
                <AnimatedCounter
                  value={incomeThisMonth}
                  prefix="+$"
                  decimals={0}
                  className="text-sm font-bold text-secondary mt-0.5"
                />
              </View>
            </View>

            <View className="flex-1 bg-surface-container-low/90 rounded-2xl p-3 border border-error/15 flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-full bg-error/15 items-center justify-center">
                <MaterialIcons name="arrow-upward" size={16} color="#FFB4AB" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Expenses
                </Text>
                <AnimatedCounter
                  value={expensesThisMonth}
                  prefix="-$"
                  decimals={0}
                  className="text-sm font-bold text-error mt-0.5"
                />
              </View>
            </View>
          </View>
        </AnimatedBox>

        {/* Quick Action Buttons */}
        <AnimatedBox
          delay={120}
          className="mx-5 mb-7 flex-row items-center justify-between gap-3"
        >
          <Link href={"/add-transaction" as any} asChild>
            <ScaleButton
              activeScale={0.92}
              className="flex-1 bg-surface-container-high border border-outline-variant/30 py-3.5 px-2 rounded-2xl items-center justify-center gap-1.5 shadow-sm"
            >
              <View className="w-9 h-9 rounded-xl bg-secondary/15 items-center justify-center">
                <MaterialIcons name="add" size={20} color="#4DE082" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">
                Income
              </Text>
            </ScaleButton>
          </Link>

          <Link href={"/add-transaction" as any} asChild>
            <ScaleButton
              activeScale={0.92}
              className="flex-1 bg-surface-container-high border border-outline-variant/30 py-3.5 px-2 rounded-2xl items-center justify-center gap-1.5 shadow-sm"
            >
              <View className="w-9 h-9 rounded-xl bg-error/15 items-center justify-center">
                <MaterialIcons name="remove" size={20} color="#FFB4AB" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">
                Expense
              </Text>
            </ScaleButton>
          </Link>

          <Link href={"/add-transaction" as any} asChild>
            <ScaleButton
              activeScale={0.92}
              className="flex-1 bg-surface-container-high border border-outline-variant/30 py-3.5 px-2 rounded-2xl items-center justify-center gap-1.5 shadow-sm"
            >
              <View className="w-9 h-9 rounded-xl bg-primary/15 items-center justify-center">
                <MaterialIcons name="swap-horiz" size={20} color="#B2C5FF" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">
                Transfer
              </Text>
            </ScaleButton>
          </Link>

          <Link href={"/budgets" as any} asChild>
            <ScaleButton
              activeScale={0.92}
              className="flex-1 bg-surface-container-high border border-outline-variant/30 py-3.5 px-2 rounded-2xl items-center justify-center gap-1.5 shadow-sm"
            >
              <View className="w-9 h-9 rounded-xl bg-purple-500/15 items-center justify-center">
                <MaterialIcons name="pie-chart" size={18} color="#C084FC" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">
                Budgets
              </Text>
            </ScaleButton>
          </Link>
        </AnimatedBox>

        {/* Accounts Horizontal Carousel */}
        <AnimatedBox delay={180} className="mb-7">
          <View className="px-5 mb-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-on-surface tracking-tight">
                Accounts
              </Text>
              <View className="bg-surface-container-high px-2 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold text-primary">
                  {accounts.length}
                </Text>
              </View>
            </View>
            <Link href="/accounts" asChild>
              <ScaleButton activeScale={0.92} hitSlop={12}>
                <Text className="text-xs font-semibold text-primary">
                  View all →
                </Text>
              </ScaleButton>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            decelerationRate="fast"
            snapToInterval={224}
            snapToAlignment="start"
          >
            {accounts.map((account) => {
              const isPrimary = account.type === "bank";
              return (
                <Link key={account.id} href="/accounts" asChild>
                  <ScaleButton
                    activeScale={0.94}
                    className={`w-[210px] p-4 rounded-[22px] justify-between h-36 overflow-hidden border shadow-md relative ${
                      isPrimary
                        ? "bg-[#1E293B] border-primary/30"
                        : "bg-surface-container border-outline-variant/30"
                    }`}
                  >
                    {/* Background Watermark Icon */}
                    <View className="absolute right-[-14px] bottom-[-14px] opacity-10">
                      <MaterialIcons
                        name={account.icon as any}
                        size={90}
                        color={isPrimary ? "#B2C5FF" : "#C3C6D6"}
                      />
                    </View>

                    {/* Card Top */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`w-7 h-7 rounded-lg items-center justify-center ${
                            isPrimary ? "bg-primary/20" : "bg-surface-container-highest"
                          }`}
                        >
                          <MaterialIcons
                            name={account.icon as any}
                            size={16}
                            color={isPrimary ? "#B2C5FF" : "#C3C6D6"}
                          />
                        </View>
                        <Text
                          numberOfLines={1}
                          className="text-xs font-semibold text-on-surface max-w-[100px]"
                        >
                          {account.name}
                        </Text>
                      </View>
                      <View className="bg-white/10 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-medium text-on-surface-variant capitalize">
                          {account.type}
                        </Text>
                      </View>
                    </View>

                    {/* Card Balance */}
                    <View>
                      <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                        Balance
                      </Text>
                      <AnimatedCounter
                        value={account.balance}
                        prefix="$"
                        decimals={2}
                        className="text-lg font-bold text-on-surface tracking-tight"
                      />
                    </View>
                  </ScaleButton>
                </Link>
              );
            })}
          </ScrollView>
        </AnimatedBox>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <AnimatedBox delay={240} className="mb-7 px-5">
            <View className="flex-row items-center justify-between mb-3.5">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-bold text-on-surface tracking-tight">
                  Upcoming Bills
                </Text>
                <View className="bg-secondary/15 px-2 py-0.5 rounded-full">
                  <Text className="text-[11px] font-bold text-secondary">
                    Due Soon
                  </Text>
                </View>
              </View>
              <Link href="/subscriptions" asChild>
                <ScaleButton activeScale={0.92} hitSlop={12}>
                  <Text className="text-xs font-semibold text-primary">
                    Manage →
                  </Text>
                </ScaleButton>
              </Link>
            </View>

            <View className="bg-surface-container rounded-[24px] p-4 shadow-sm border border-outline-variant/30 flex-col gap-3">
              {upcomingBills.map((bill) => (
                <View
                  key={bill.id}
                  className="flex-row items-center justify-between py-1"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-10 h-10 rounded-2xl items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${bill.color}20` }}
                    >
                      <MaterialIcons
                        name={bill.icon as any}
                        size={20}
                        color={bill.color}
                      />
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-on-surface">
                        {bill.name}
                      </Text>
                      <Text className="text-xs text-on-surface-variant font-medium">
                        Due {bill.dueDate}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <AnimatedCounter
                      value={bill.amount}
                      prefix="-$"
                      decimals={2}
                      className="text-sm font-bold text-on-surface"
                    />
                    <View className="bg-surface-container-highest px-2 py-0.5 rounded-full mt-0.5">
                      <Text className="text-[10px] font-medium text-on-surface-variant">
                        Auto-pay
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </AnimatedBox>
        )}

        {/* Recent Activity */}
        <AnimatedBox delay={300} className="px-5">
          <View className="flex-row items-center justify-between mb-3.5">
            <Text className="text-base font-bold text-on-surface tracking-tight">
              Recent Activity
            </Text>
            <Link href={"/transactions" as any} asChild>
              <ScaleButton activeScale={0.92} hitSlop={12}>
                <Text className="text-xs font-semibold text-primary">
                  View all →
                </Text>
              </ScaleButton>
            </Link>
          </View>

          <View className="flex-col gap-2.5">
            {transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === "income";
              const isExpense = tx.type === "expense";
              const cat = categories.find((c) => c.id === tx.categoryId);

              let iconBg = "bg-surface-container-high";
              let iconColor = "#C3C6D6";
              let amountClass = "text-on-surface";

              if (isIncome) {
                iconBg = "bg-secondary/15";
                iconColor = "#4DE082";
                amountClass = "text-secondary";
              } else if (isExpense) {
                iconBg = "bg-error/15";
                iconColor = "#FFB4AB";
                amountClass = "text-error";
              }

              const txDate = new Date(tx.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <Link key={tx.id} href={"/transactions" as any} asChild>
                  <ScaleButton
                    activeScale={0.97}
                    className="flex-row items-center justify-between bg-surface-container p-3.5 rounded-[20px] shadow-sm border border-outline-variant/20"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-11 h-11 rounded-2xl items-center justify-center ${iconBg}`}
                      >
                        <MaterialIcons
                          name={(cat?.icon || "receipt") as any}
                          size={22}
                          color={iconColor}
                        />
                      </View>
                      <View>
                        <Text
                          numberOfLines={1}
                          className="text-sm font-bold text-on-surface max-w-[180px]"
                        >
                          {tx.payee}
                        </Text>
                        <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {cat?.name || "Transfer"} • {txDate}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <AnimatedCounter
                        value={tx.amount}
                        prefix={isIncome ? "+$" : "-$"}
                        decimals={2}
                        className={`text-sm font-extrabold ${amountClass}`}
                      />
                    </View>
                  </ScaleButton>
                </Link>
              );
            })}

            {transactions.length === 0 && (
              <View className="py-12 items-center justify-center bg-surface-container rounded-[24px] border border-outline-variant/20">
                <MaterialIcons
                  name="receipt-long"
                  size={40}
                  color="#C3C6D6"
                  style={{ opacity: 0.5 }}
                />
                <Text className="text-sm text-on-surface-variant font-medium mt-2">
                  No recent activity
                </Text>
              </View>
            )}
          </View>
        </AnimatedBox>
      </ScrollView>
    </View>
  );
}
