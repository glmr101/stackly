import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toggle } from "@/components/ui/Toggle";
import { useAppStore } from "@/store/useAppStore";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedBox } from "@/components/ui/AnimatedBox";
import { DueSoonBadge } from "@/components/ui/DueSoonBadge";
import { UndoToast } from "@/components/ui/UndoToast";
import {
  formatDueSchedule,
  formatReadableDate,
  getDueStatus,
} from "@/lib/subscriptions";

export default function Subscriptions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const subs = useAppStore((state) => state.subscriptions);
  const categories = useAppStore((state) => state.categories);
  const currency = useAppStore((state) => state.currency);
  const toggleSubscription = useAppStore((state) => state.toggleSubscription);
  const lastDeletedSubscription = useAppStore(
    (state) => state.lastDeletedSubscription
  );
  const restoreLastDeletedSubscription = useAppStore(
    (state) => state.restoreLastDeletedSubscription
  );
  const clearLastDeletedSubscription = useAppStore(
    (state) => state.clearLastDeletedSubscription
  );

  const currencySymbol = currency?.symbol || "$";
  // Default to "all" so toggles don't cause items to vanish
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const totalMonthlySpend = subs
    .filter((s) => s.active)
    .reduce((acc, curr) => {
      let monthlyAmount = curr.amount;
      if (curr.billingCycle === "weekly") {
        monthlyAmount = (curr.amount * 52) / 12;
      } else if (curr.billingCycle === "quarterly") {
        monthlyAmount = curr.amount / 3;
      } else if (curr.billingCycle === "yearly") {
        monthlyAmount = curr.amount / 12;
      }
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

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <AnimatedBox delay={0} className="h-16 px-5 flex-row items-center justify-between z-50">
        <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
          Recurring Bills
        </Text>
      </AnimatedBox>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Spend Summary Hero Card */}
        <AnimatedBox
          delay={30}
          className="mx-5 mt-3 mb-6 p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative"
        >
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Total Monthly Subscriptions
          </Text>

          <View className="flex-row items-baseline gap-2 my-1">
            <AnimatedCounter
              value={totalMonthlySpend}
              prefix={currencySymbol}
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
              <Text className="text-base font-bold text-on-surface">
                {activeCount} Active
              </Text>
            </View>
            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <Text className="text-[11px] font-medium text-on-surface-variant mb-0.5">
                Annual Cost
              </Text>
              <AnimatedCounter
                value={totalAnnualSpend}
                prefix={currencySymbol}
                decimals={0}
                className="text-base font-bold text-on-surface"
              />
            </View>
          </View>
        </AnimatedBox>

        {/* Filter Tabs */}
        <AnimatedBox delay={60} className="mx-5 mb-5 flex-row gap-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Active", value: "active" as const },
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
        </AnimatedBox>

        {/* Subscriptions List */}
        <AnimatedBox delay={90} className="px-5 flex-col gap-3.5">
          {filteredSubs.map((sub) => {
            const cat = categories.find((c) => c.id === sub.categoryId);
            const scheduleText = formatDueSchedule(sub);
            const nextDateFormatted = formatReadableDate(sub.nextChargeDate);
            const dueStatus = getDueStatus(sub.nextChargeDate);

            const frequencySuffix =
              sub.billingCycle === "yearly"
                ? "/yr"
                : sub.billingCycle === "weekly"
                ? "/wk"
                : sub.billingCycle === "quarterly"
                ? "/qtr"
                : "/mo";

            return (
              <TouchableOpacity
                key={sub.id}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: "/edit-subscription" as any,
                    params: { id: sub.id },
                  })
                }
                className={`bg-surface-container rounded-[24px] p-5 border border-outline-variant/30 overflow-hidden shadow-sm relative ${
                  !sub.active ? "opacity-75" : ""
                }`}
              >
                {/* Brand Color Aura */}
                <View
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 blur-xl"
                  style={{ backgroundColor: sub.color || "#B2C5FF" }}
                />

                <View className="flex-row justify-between items-start z-10 mb-3.5">
                  <View className="flex-row gap-3.5 items-center flex-1 mr-3">
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
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="text-base font-bold text-on-surface flex-1"
                          numberOfLines={1}
                        >
                          {sub.name}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-1.5 mt-0.5 flex-wrap">
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {cat?.name || "General"}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-outline-variant" />
                        <Text className="text-xs text-primary font-bold">
                          {scheduleText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end gap-2">
                    <Toggle
                      value={sub.active}
                      onValueChange={() => toggleSubscription(sub.id)}
                    />
                  </View>
                </View>

                {/* Due Warning Banner if active and due within 7 days */}
                {sub.active && dueStatus.isDueSoon && (
                  <View className="mb-3.5 flex-row items-center z-10">
                    <DueSoonBadge
                      label={dueStatus.label}
                      isOverdue={dueStatus.isOverdue}
                    />
                  </View>
                )}

                {/* Bottom Row */}
                <View className="flex-row justify-between items-center pt-3 border-t border-white/5 z-10">
                  <View className="flex-col">
                    <Text className="text-[11px] text-on-surface-variant font-medium">
                      Next Billing Date
                    </Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text className="text-xs font-bold text-on-surface">
                        {nextDateFormatted}
                      </Text>
                      {!sub.active && (
                        <View className="px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30">
                          <Text className="text-[10px] font-bold text-on-surface-variant">
                            Paused
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-baseline gap-1">
                    <AnimatedCounter
                      value={sub.amount}
                      prefix={currencySymbol}
                      decimals={2}
                      className="text-lg font-extrabold text-on-surface"
                    />
                    <Text className="text-xs font-medium text-on-surface-variant">
                      {frequencySuffix}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
        </AnimatedBox>
      </ScrollView>

      {/* Undo Toast Notification */}
      <UndoToast
        visible={!!lastDeletedSubscription}
        message={`"${lastDeletedSubscription?.name || 'Subscription'}" deleted`}
        duration={5000}
        onUndo={restoreLastDeletedSubscription}
        onDismiss={clearLastDeletedSubscription}
      />
    </View>
  );
}
