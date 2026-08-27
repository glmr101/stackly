import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Toggle } from "@/components/ui/Toggle";
import { useAppStore } from "@/store/useAppStore";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScaleButton } from "@/components/ui/ScaleButton";

export default function Subscriptions() {
  const insets = useSafeAreaInsets();

  const subs = useAppStore((state) => state.subscriptions);
  const categories = useAppStore((state) => state.categories);
  const accounts = useAppStore((state) => state.accounts);
  const toggleSubscription = useAppStore((state) => state.toggleSubscription);
  const postSubscription = useAppStore((state) => state.postSubscription);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  const totalMonthlySpend = subs
    .filter((s) => s.active)
    .reduce((acc, curr) => {
      const monthlyAmount =
        curr.billingCycle === "yearly" ? curr.amount / 12 : curr.amount;
      return acc + monthlyAmount;
    }, 0);

  const totalAnnualSpend = totalMonthlySpend * 12;
  const activeCount = subs.filter((s) => s.active).length;

  const filteredSubs =
    filter === "all"
      ? subs
      : filter === "active"
      ? subs.filter((s) => s.active)
      : subs.filter((s) => !s.active);

  const handlePost = (subId: string) => {
    if (accounts.length > 0) {
      postSubscription(subId, accounts[0].id);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-5 flex-row items-center justify-between z-50">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 items-center justify-center">
            <MaterialIcons name="event-repeat" size={20} color="#B2C5FF" />
          </View>
          <Text className="text-lg font-bold text-on-surface tracking-tight">
            Recurring Bills
          </Text>
        </View>
        <Link href={"/add-subscription" as any} asChild>
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
        {/* Spend Summary Hero Card */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="mx-5 mt-3 mb-6 p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative"
        >
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Total Monthly Subscriptions
          </Text>

          <View className="flex-row items-baseline gap-2 my-1">
            <AnimatedCounter
              value={totalMonthlySpend}
              prefix="$"
              decimals={2}
              className="text-4xl font-extrabold text-on-surface tracking-tight"
            />
            <Text className="text-sm font-bold text-secondary">
              /month
            </Text>
          </View>

          {/* Quick Metrics */}
          <View className="flex-row gap-3 mt-5 pt-4 border-t border-white/5">
            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                Active Bills
              </Text>
              <Text className="text-sm font-bold text-on-surface">
                {activeCount} Subscriptions
              </Text>
            </View>
            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                Yearly Forecast
              </Text>
              <AnimatedCounter
                value={totalAnnualSpend}
                prefix="$"
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>
          </View>
        </Animated.View>

        {/* Filter Tabs */}
        <View className="mx-5 mb-5 flex-row gap-2">
          {[
            { label: "Active", value: "active" as const },
            { label: "All", value: "all" as const },
            { label: "Paused", value: "inactive" as const },
          ].map((f) => {
            const isSelected = filter === f.value;
            return (
              <ScaleButton
                key={f.value}
                activeScale={0.92}
                onPress={() => setFilter(f.value)}
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
        </View>

        {/* Subscriptions List */}
        <View className="px-5 flex-col gap-3.5">
          {filteredSubs.map((sub, index) => {
            const date = new Date(sub.nextChargeDate);
            const cat = categories.find((c) => c.id === sub.categoryId);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <Animated.View
                key={sub.id}
                entering={FadeInDown.delay(index * 70).springify()}
                className="bg-surface-container rounded-[24px] p-5 border border-outline-variant/30 overflow-hidden shadow-sm relative"
              >
                {/* Brand Color Aura */}
                <View
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 blur-xl"
                  style={{ backgroundColor: sub.color || "#B2C5FF" }}
                />

                <View className="flex-row justify-between items-start z-10 mb-3">
                  <View className="flex-row gap-3.5 items-center">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${sub.color || "#B2C5FF"}25` }}
                    >
                      <MaterialIcons
                        name={(sub.icon || "subscriptions") as any}
                        size={24}
                        color={sub.color || "#B2C5FF"}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-on-surface">
                        {sub.name}
                      </Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {cat?.name || "General"}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-outline-variant" />
                        <Text className="text-xs text-primary font-semibold capitalize">
                          {sub.billingCycle}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Toggle
                    value={sub.active}
                    onValueChange={() => toggleSubscription(sub.id)}
                  />
                </View>

                {/* Bottom Row */}
                <View className="flex-row justify-between items-center pt-3 border-t border-white/5 z-10">
                  <View className="flex-col">
                    <Text className="text-[11px] text-on-surface-variant font-medium">
                      Next Charge
                    </Text>
                    <Text className="text-xs font-bold text-on-surface mt-0.5">
                      {formattedDate}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View className="items-end">
                      <AnimatedCounter
                        value={sub.amount}
                        prefix="$"
                        decimals={2}
                        className="text-base font-extrabold text-on-surface"
                      />
                    </View>

                    <ScaleButton
                      activeScale={0.9}
                      className="px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/25 flex-row items-center gap-1"
                      onPress={() => handlePost(sub.id)}
                    >
                      <MaterialIcons name="receipt-long" size={14} color="#B2C5FF" />
                      <Text className="text-xs font-bold text-primary">
                        Post
                      </Text>
                    </ScaleButton>
                  </View>
                </View>
              </Animated.View>
            );
          })}

          {filteredSubs.length === 0 && (
            <View className="py-16 items-center justify-center bg-surface-container rounded-[24px] border border-outline-variant/20 mt-4">
              <MaterialIcons
                name="event-busy"
                size={40}
                color="#C3C6D6"
                style={{ opacity: 0.5 }}
              />
              <Text className="text-sm font-semibold text-on-surface-variant mt-2">
                No subscriptions found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
