import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
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
import { CenteredCardCarousel, CardItem } from "@/components/ui/StackedCardCarousel";
import { Card3DViewerModal, CardLayoutRect } from "@/components/ui/Card3DViewerModal";
import { findPhilippineBank } from "@/data/philippineBanks";
import { formatDueSchedule, getDueStatus, formatReadableDate } from "@/lib/subscriptions";
import { DueSoonBadge } from "@/components/ui/DueSoonBadge";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const accounts = useAppStore((state) => state.accounts);
  const transactions = useAppStore((state) => state.transactions);
  const subscriptions = useAppStore((state) => state.subscriptions);
  const currency = useAppStore((state) => state.currency);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedViewerCard, setSelectedViewerCard] = useState<CardItem | null>(null);
  const [selectedViewerLayout, setSelectedViewerLayout] = useState<CardLayoutRect | null>(null);

  const currencySymbol = currency?.symbol || "₱";
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  const displayedAccounts = accounts.slice(0, 3);

  const cardItems: CardItem[] = displayedAccounts.map((acc, index) => {
    const phBank = findPhilippineBank(acc.bankCode || acc.institution || acc.name);
    const institution = acc.institution || phBank?.shortName || acc.name;
    const isCard = acc.type !== "cash" && acc.type !== "investment";
    const cardNetwork = isCard ? (acc.cardNetwork || (acc.type === "credit card" ? "visa" : "mastercard")) : undefined;
    const cardCategory = isCard ? (acc.cardCategory || (acc.type === "credit card" ? "credit" : "debit")) : undefined;

    // Palette fallbacks based on account type
    const fallbackColors = [
      "#B11116", // BPI Crimson
      "#00D664", // Maya Green
      "#FF5722", // MariBank Coral
      "#0052CC", // Metrobank / Royal Blue
      "#7C3AED", // Vivid Purple
      "#0284C7", // GCash Sky Blue
    ];
    const defaultColor =
      acc.type === "cash"
        ? "#152E22"
        : acc.type === "investment"
        ? "#065F46"
        : acc.type === "credit card"
        ? "#7C3AED"
        : fallbackColors[index % fallbackColors.length];

    const backgroundColor = phBank?.color || defaultColor;

    return {
      id: acc.id,
      bankName: acc.name,
      institution: institution,
      accountName: acc.name,
      cardType: (cardNetwork as any) || "generic",
      cardNetwork: cardNetwork,
      cardCategory: cardCategory,
      accountType: acc.type,
      cardNumber: isCard ? `•••• ${acc.id.replace(/\D/g, "").slice(-4) || "8421"}` : undefined,
      cardHolder: institution.toUpperCase(),
      expiryDate: isCard ? "12/28" : undefined,
      balance: acc.balance,
      backgroundColor: backgroundColor,
      secondaryColor: "rgba(255, 255, 255, 0.15)",
      textColor: "#FFFFFF",
      icon: acc.icon,
      bankCode: acc.bankCode || phBank?.code,
    };
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

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

  // Upcoming bills derived from active subscriptions due within 7 days
  const upcomingBills = subscriptions
    .filter((sub) => {
      if (!sub.active) return false;
      const dueStatus = getDueStatus(sub.nextChargeDate);
      return dueStatus.daysRemaining <= 7;
    })
    .sort(
      (a, b) =>
        new Date(a.nextChargeDate).getTime() -
        new Date(b.nextChargeDate).getTime()
    )
    .slice(0, 3)
    .map((sub) => {
      const dueStatus = getDueStatus(sub.nextChargeDate);
      return {
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        dueDate: formatReadableDate(sub.nextChargeDate),
        scheduleLabel: formatDueSchedule(sub),
        isOverdue: dueStatus.isOverdue,
        isDueSoon: dueStatus.isDueSoon,
        dueStatusLabel: dueStatus.label,
        icon: sub.icon,
        color: sub.color || "#B2C5FF",
      };
    });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Navigation Bar */}
      <AnimatedBox delay={0} className="h-16 px-5 flex-row items-center justify-between z-50">
        <View>
          <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
            Stackly Overview
          </Text>
          <Text className="text-xs text-on-surface-variant font-medium">
            {monthName} {currentYear}
          </Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B2C5FF"
            colors={["#B2C5FF", "#4DE082"]}
          />
        }
      >
        {/* Hero Net Worth Card */}
        <AnimatedBox
          delay={30}
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
                  className={`absolute w-full h-full rounded-full ${trendIsPositive ? "bg-secondary" : "bg-error"
                    }`}
                  style={animatedPulseStyle}
                />
                <View
                  className={`w-1.5 h-1.5 rounded-full ${trendIsPositive ? "bg-secondary" : "bg-error"
                    }`}
                />
              </View>
              <Text
                className={`text-[11px] font-bold ${trendIsPositive ? "text-secondary" : "text-error"
                  }`}
              >
                {trendIsPositive ? "+" : "-"}
                {currencySymbol}
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
            Net cash flow calculated for {monthName}
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
          delay={60}
          className="mx-5 mb-6 flex-row items-center justify-between gap-3"
        >
          <Link
            href={{ pathname: "/add-transaction", params: { type: "income" } } as any}
            asChild
          >
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

          <Link
            href={{ pathname: "/add-transaction", params: { type: "expense" } } as any}
            asChild
          >
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

          <Link
            href={{ pathname: "/add-transaction", params: { type: "transfer" } } as any}
            asChild
          >
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

          <Link href={"/transactions" as any} asChild>
            <ScaleButton
              activeScale={0.92}
              className="flex-1 bg-surface-container-high border border-outline-variant/30 py-3.5 px-2 rounded-2xl items-center justify-center gap-1.5 shadow-sm"
            >
              <View className="w-9 h-9 rounded-xl bg-purple-500/15 items-center justify-center">
                <MaterialIcons name="history" size={20} color="#C084FC" />
              </View>
              <Text
                numberOfLines={1}
                className="text-xs font-semibold text-on-surface"
              >
                Transactions
              </Text>
            </ScaleButton>
          </Link>
        </AnimatedBox>

        {/* Accounts Centered Cards Carousel */}
        <AnimatedBox delay={80} className="mb-6">
          <View className="px-5 mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-on-surface tracking-tight">
                Accounts & Cards
              </Text>
              <View className="bg-surface-container-high px-2 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold text-primary">
                  {accounts.length}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Link href={"/accounts" as any} asChild>
                <ScaleButton activeScale={0.92} hitSlop={8} className="mr-1">
                  <Text className="text-xs font-semibold text-primary">
                    View all →
                  </Text>
                </ScaleButton>
              </Link>
            </View>
          </View>

          <CenteredCardCarousel
            cards={cardItems}
            currencySymbol={currencySymbol}
            onCardPress={(card: CardItem, sourceLayout?: CardLayoutRect) => {
              setSelectedViewerLayout(sourceLayout || null);
              setSelectedViewerCard(card);
            }}
            onAddCard={() => {
              router.push("/add-account" as any);
            }}
          />
        </AnimatedBox>

        {/* Upcoming Bills */}
        <AnimatedBox delay={110} className="mb-6 px-5">
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-on-surface tracking-tight">
                Upcoming Bills
              </Text>
              {upcomingBills.length > 0 && (
                <View className="bg-secondary/15 px-2 py-0.5 rounded-full">
                  <Text className="text-[11px] font-bold text-secondary">
                    Due Soon
                  </Text>
                </View>
              )}
            </View>
            <Link href="/subscriptions" asChild>
              <ScaleButton activeScale={0.92} hitSlop={12}>
                <Text className="text-xs font-semibold text-primary">
                  Manage →
                </Text>
              </ScaleButton>
            </Link>
          </View>

          {upcomingBills.length > 0 ? (
            <View className="bg-surface-container rounded-[24px] p-4 shadow-sm border border-outline-variant/30 flex-col gap-3">
              {upcomingBills.map((bill) => (
                <View
                  key={bill.id}
                  className="flex-row items-center justify-between py-1"
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-3">
                    <View
                      className="w-10 h-10 rounded-2xl items-center justify-center shadow-sm flex-shrink-0"
                      style={{ backgroundColor: `${bill.color}20` }}
                    >
                      <MaterialIcons
                        name={bill.icon as any}
                        size={20}
                        color={bill.color}
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="text-sm font-semibold text-on-surface flex-shrink"
                          numberOfLines={1}
                        >
                          {bill.name}
                        </Text>
                        {bill.isDueSoon && (
                          <DueSoonBadge
                            label={bill.dueStatusLabel}
                            isOverdue={bill.isOverdue}
                          />
                        )}
                      </View>
                      <Text
                        className={`text-xs font-medium ${bill.isOverdue ? "text-error font-bold" : "text-on-surface-variant"
                          }`}
                        numberOfLines={1}
                      >
                        {bill.scheduleLabel} • {bill.isOverdue ? "Overdue" : `Due ${bill.dueDate}`}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end flex-shrink-0 pl-1">
                    <AnimatedCounter
                      value={bill.amount}
                      prefix={`-${currencySymbol}`}
                      decimals={2}
                      className="text-sm font-bold text-on-surface text-right"
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-surface-container rounded-[24px] p-5 shadow-sm border border-outline-variant/30 items-center justify-center">
              <MaterialIcons name="event-available" size={32} color="#C3C6D6" style={{ opacity: 0.5 }} />
              <Text className="text-xs font-bold text-on-surface mt-2">
                No Upcoming Bills
              </Text>
              <Text className="text-[11px] text-on-surface-variant text-center mt-0.5 mb-3">
                No bills due in the next 7 days.
              </Text>
              <Link href={"/add-subscription" as any} asChild>
                <ScaleButton
                  activeScale={0.92}
                  className="px-3.5 py-1.5 bg-primary/15 border border-primary/25 rounded-xl flex-row items-center gap-1"
                >
                  <MaterialIcons name="add" size={14} color="#B2C5FF" />
                  <Text className="text-xs font-bold text-primary">
                    Add Bill
                  </Text>
                </ScaleButton>
              </Link>
            </View>
          )}
        </AnimatedBox>
      </ScrollView>

      {/* Interactive 3D Card Object Viewer Modal */}
      <Card3DViewerModal
        visible={!!selectedViewerCard}
        card={selectedViewerCard}
        sourceLayout={selectedViewerLayout}
        currencySymbol={currencySymbol}
        onClose={() => setSelectedViewerCard(null)}
      />
    </View>
  );
}
