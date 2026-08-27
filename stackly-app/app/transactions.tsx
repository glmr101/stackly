import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export default function Transactions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const transactions = useAppStore((state) => state.transactions);
  const categories = useAppStore((state) => state.categories);
  const accounts = useAppStore((state) => state.accounts);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "income" | "expense" | "transfer" | "unreviewed"
  >("all");

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by type
    if (filterType === "unreviewed" && tx.categoryId) return false;
    if (filterType === "income" && tx.type !== "income") return false;
    if (filterType === "expense" && tx.type !== "expense") return false;
    if (filterType === "transfer" && tx.type !== "transfer") return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const payeeMatch = tx.payee.toLowerCase().includes(q);
      const cat = categories.find((c) => c.id === tx.categoryId);
      const catMatch = cat?.name.toLowerCase().includes(q);
      const noteMatch = tx.note?.toLowerCase().includes(q);
      return payeeMatch || catMatch || noteMatch;
    }

    return true;
  });

  const totalFilteredAmount = filteredTransactions.reduce((sum, tx) => {
    if (tx.type === "income") return sum + tx.amount;
    if (tx.type === "expense") return sum - tx.amount;
    return sum;
  }, 0);

  const filterOptions = [
    { label: "All", value: "all" as const },
    { label: "Income", value: "income" as const },
    { label: "Expense", value: "expense" as const },
    { label: "Transfer", value: "transfer" as const },
    { label: "Uncategorized", value: "unreviewed" as const },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Header */}
      <AnimatedBox delay={0} className="h-16 px-4 flex-row items-center justify-between border-b border-outline-variant/20">
        <View className="flex-row items-center gap-3">
          <ScaleButton
            activeScale={0.88}
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color="#DFE2F1" />
          </ScaleButton>
          <Text className="text-lg font-bold text-on-surface tracking-tight">
            All Transactions
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
      </AnimatedBox>

      {/* Search & Filter Controls */}
      <AnimatedBox delay={60}>
        {/* Search Input Bar */}
        <View className="px-5 pt-4 pb-2">
          <View className="bg-surface-container-low rounded-2xl px-4 py-1.5 flex-row items-center gap-2.5 border border-outline-variant/30">
            <MaterialIcons name="search" size={20} color="#C3C6D6" />
            <TextInput
              className="flex-1 text-on-surface text-sm h-11"
              placeholder="Search payee, category, note..."
              placeholderTextColor="#C3C6D680"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <ScaleButton
                activeScale={0.88}
                onPress={() => setSearchQuery("")}
                hitSlop={8}
              >
                <MaterialIcons name="close" size={18} color="#C3C6D6" />
              </ScaleButton>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <View className="px-5 py-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filterOptions.map((f) => {
              const isSelected = filterType === f.value;
              return (
                <ScaleButton
                  key={f.value}
                  activeScale={0.92}
                  onPress={() => setFilterType(f.value)}
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
        </View>

        {/* Count & Flow Summary */}
        <View className="px-5 py-2 flex-row items-center justify-between">
          <Text className="text-xs font-medium text-on-surface-variant">
            Showing {filteredTransactions.length} transaction
            {filteredTransactions.length === 1 ? "" : "s"}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs text-on-surface-variant font-medium">
              Net:
            </Text>
            <AnimatedCounter
              value={totalFilteredAmount}
              prefix="$"
              decimals={2}
              className={`text-xs font-bold ${
                totalFilteredAmount >= 0 ? "text-secondary" : "text-error"
              }`}
            />
          </View>
        </View>
      </AnimatedBox>

      {/* Transactions List */}
      <AnimatedBox delay={120} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        >
          <View className="flex-col gap-2.5 pt-2">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const isExpense = tx.type === "expense";
              const cat = categories.find((c) => c.id === tx.categoryId);
              const account = accounts.find((a) => a.id === tx.accountId);

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
                year: "numeric",
              });

              return (
                <ScaleButton
                  key={tx.id}
                  activeScale={0.97}
                  className="flex-row items-center justify-between bg-surface-container p-4 rounded-[22px] shadow-sm border border-outline-variant/25"
                >
                  <View className="flex-row items-center gap-3.5 flex-1 mr-3">
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${iconBg}`}
                    >
                      <MaterialIcons
                        name={(cat?.icon || "receipt") as any}
                        size={22}
                        color={iconColor}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold text-on-surface"
                      >
                        {tx.payee}
                      </Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {cat?.name || "Uncategorized"}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-outline-variant" />
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {account?.name || "Account"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end">
                    <AnimatedCounter
                      value={tx.amount}
                      prefix={isIncome ? "+$" : "-$"}
                      decimals={2}
                      className={`text-base font-extrabold ${amountClass}`}
                    />
                    <Text className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                      {txDate}
                    </Text>
                  </View>
                </ScaleButton>
              );
            })}

            {filteredTransactions.length === 0 && (
              <View className="py-20 items-center justify-center bg-surface-container rounded-[28px] border border-outline-variant/20 mt-4">
                <MaterialIcons
                  name="receipt-long"
                  size={44}
                  color="#C3C6D6"
                  style={{ opacity: 0.4 }}
                />
                <Text className="text-base font-bold text-on-surface mt-3">
                  No Transactions Found
                </Text>
                <Text className="text-xs text-on-surface-variant mt-1 text-center px-6">
                  Try changing your search keywords or switching filters.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </AnimatedBox>
    </View>
  );
}
