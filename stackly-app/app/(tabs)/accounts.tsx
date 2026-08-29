import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { Account } from "@/types";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export default function Accounts() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((state) => state.accounts);
  const savingsGoals = useAppStore((state) => state.savingsGoals);
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || "$";
  const addSavingsContribution = useAppStore(
    (state) => state.addSavingsContribution
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiquid = accounts
    .filter(
      (acc) =>
        acc.type === "bank" || acc.type === "e-wallet" || acc.type === "cash"
    )
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalCredit = accounts
    .filter((acc) => acc.type === "credit card")
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvestments = accounts
    .filter((acc) => acc.type === "investment")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredAccounts =
    selectedFilter === "all"
      ? accounts
      : accounts.filter((a) => a.type === selectedFilter);

  const filters = [
    { label: "All", value: "all" },
    { label: "Bank", value: "bank" },
    { label: "E-Wallet", value: "e-wallet" },
    { label: "Cash", value: "cash" },
    { label: "Cards", value: "credit card" },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <AnimatedBox delay={0} className="h-16 px-5 flex-row items-center justify-between z-50">
        <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
          Accounts & Assets
        </Text>
      </AnimatedBox>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Total Net Worth Hero Card */}
        <AnimatedBox
          delay={30}
          className="mx-5 mt-3 mb-6 p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative"
        >
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Total Net Worth
          </Text>

          <View className="my-1">
            <AnimatedCounter
              value={totalNetWorth}
              prefix={currencySymbol}
              decimals={2}
              showDecimalsSmall={true}
              className="text-4xl font-extrabold text-on-surface tracking-tight"
              decimalClassName="text-2xl font-bold text-secondary ml-1"
            />
          </View>

          {/* Asset Breakdown Grid */}
          <View className="flex-row gap-2.5 mt-5 pt-4 border-t border-white/5">
            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="account-balance" size={14} color="#B2C5FF" />
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Liquid
                </Text>
              </View>
              <AnimatedCounter
                value={totalLiquid}
                prefix={currencySymbol}
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>

            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="credit-card" size={14} color="#FFB4AB" />
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Debt/Credit
                </Text>
              </View>
              <AnimatedCounter
                value={totalCredit}
                prefix={currencySymbol}
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>

            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="trending-up" size={14} color="#4DE082" />
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Invest
                </Text>
              </View>
              <AnimatedCounter
                value={totalInvestments}
                prefix={currencySymbol}
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>
          </View>
        </AnimatedBox>

        {/* Filter Chips */}
        <AnimatedBox delay={60} className="mx-5 mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.map((f) => {
              const isSelected = selectedFilter === f.value;
              return (
                <ScaleButton
                  key={f.value}
                  activeScale={0.92}
                  onPress={() => setSelectedFilter(f.value)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-surface-container border-outline-variant/30"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {f.label}
                  </Text>
                </ScaleButton>
              );
            })}
          </ScrollView>
        </AnimatedBox>

        {/* Accounts List */}
        <AnimatedBox delay={90} className="px-5 mb-8 flex-col gap-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-on-surface tracking-tight">
              All Accounts ({filteredAccounts.length})
            </Text>
          </View>

          {filteredAccounts.map((account) => {
            const isExpanded = expandedId === account.id;
            const isPrimary =
              account.type === "bank" || account.type === "e-wallet";

            return (
              <View
                key={account.id}
                className="bg-surface-container rounded-[24px] border border-outline-variant/30 overflow-hidden shadow-sm"
              >
                <ScaleButton
                  activeScale={0.97}
                  className="p-4 flex-row items-center justify-between"
                  onPress={() => toggleDetails(account.id)}
                >
                  <View className="flex-row items-center gap-3.5">
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${
                        isPrimary ? "bg-primary/20" : "bg-secondary/20"
                      }`}
                    >
                      <MaterialIcons
                        name={account.icon as any}
                        size={24}
                        color={isPrimary ? "#B2C5FF" : "#4DE082"}
                      />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-on-surface">
                        {account.name}
                      </Text>
                      <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {account.institution}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-outline-variant" />
                        <View className="bg-surface-container-highest px-2 py-0.5 rounded-md">
                          <Text className="text-[10px] font-semibold uppercase text-primary">
                            {account.cardCategory ? `${account.cardCategory}${account.cardNetwork ? ` • ${account.cardNetwork}` : ''}` : account.type}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="items-end">
                    <AnimatedCounter
                      value={account.balance}
                      prefix={currencySymbol}
                      decimals={2}
                      className="text-base font-extrabold text-on-surface"
                    />
                    <MaterialIcons
                      name={isExpanded ? "expand-less" : "expand-more"}
                      size={20}
                      color="#C3C6D6"
                      style={{ marginTop: 2 }}
                    />
                  </View>
                </ScaleButton>

                {/* Collapsible Action Drawer */}
                {isExpanded && (
                  <View className="px-4 pb-4 pt-2 bg-surface-container-low/70 border-t border-outline-variant/20 flex-row gap-2.5">
                    <Link href={"/add-transaction" as any} asChild>
                      <ScaleButton
                        activeScale={0.92}
                        className="flex-1 py-2.5 rounded-xl bg-primary/15 border border-primary/25 items-center justify-center flex-row gap-1.5"
                      >
                        <MaterialIcons name="swap-horiz" size={16} color="#B2C5FF" />
                        <Text className="text-xs font-bold text-primary">
                          Transfer
                        </Text>
                      </ScaleButton>
                    </Link>
                    <Link href={"/transactions" as any} asChild>
                      <ScaleButton
                        activeScale={0.92}
                        className="flex-1 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/30 items-center justify-center flex-row gap-1.5"
                      >
                        <MaterialIcons name="history" size={16} color="#C3C6D6" />
                        <Text className="text-xs font-bold text-on-surface">
                          History
                        </Text>
                      </ScaleButton>
                    </Link>
                  </View>
                )}
              </View>
            );
          })}
        </AnimatedBox>

        {/* Savings Goals Section */}
        <AnimatedBox delay={120} className="px-5">
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-on-surface tracking-tight">
                Savings Goals
              </Text>
              <View className="bg-secondary/15 px-2 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold text-secondary">
                  {savingsGoals.length} Active
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-col gap-3">
            {savingsGoals.map((goal) => {
              const percentage = Math.min(
                (goal.currentAmount / goal.targetAmount) * 100,
                100
              );

              return (
                <View
                  key={goal.id}
                  className="bg-surface-container p-5 rounded-[24px] shadow-sm border border-outline-variant/30"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-11 h-11 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: `${goal.color}25` }}
                      >
                        <MaterialIcons
                          name={goal.icon as any}
                          size={22}
                          color={goal.color}
                        />
                      </View>
                      <View>
                        <Text className="text-sm font-bold text-on-surface">
                          {goal.name}
                        </Text>
                        {goal.targetDate && (
                          <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                            Target:{" "}
                            {new Date(goal.targetDate).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" }
                            )}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="items-end">
                      <AnimatedCounter
                        value={goal.currentAmount}
                        prefix={currencySymbol}
                        decimals={0}
                        className="text-base font-extrabold text-on-surface"
                      />
                      <Text className="text-xs text-on-surface-variant font-medium">
                        of {currencySymbol}{goal.targetAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Animated Progress Bar */}
                  <AnimatedProgressBar
                    progress={percentage}
                    height={8}
                    barColor={goal.color}
                    trackColor="#131722"
                    className="my-1"
                  />

                  {/* Goal Footer with Interactive Contribute Button */}
                  <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-white/5">
                    <Text className="text-xs font-semibold text-on-surface-variant">
                      {percentage.toFixed(0)}% reached
                    </Text>

                    <ScaleButton
                      activeScale={0.92}
                      className="px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/25 flex-row items-center gap-1"
                      onPress={() => addSavingsContribution(goal.id, 100)}
                    >
                      <MaterialIcons name="add" size={16} color="#B2C5FF" />
                      <Text className="text-xs font-bold text-primary">
                        + {currencySymbol}100
                      </Text>
                    </ScaleButton>
                  </View>
                </View>
              );
            })}
          </View>
        </AnimatedBox>
      </ScrollView>
    </View>
  );
}
