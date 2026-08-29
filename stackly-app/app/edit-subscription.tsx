import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";
import { Toggle } from "@/components/ui/Toggle";
import { DueSoonBadge } from "@/components/ui/DueSoonBadge";
import {
  BillingCycle,
  WEEKDAYS,
  MONTHS,
  calculateNextChargeDate,
  formatDueSchedule,
  formatReadableDate,
  getDueStatus,
} from "@/lib/subscriptions";

export default function EditSubscription() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const subscriptions = useAppStore((state) => state.subscriptions);
  const updateSubscription = useAppStore((state) => state.updateSubscription);
  const deleteSubscription = useAppStore((state) => state.deleteSubscription);
  const categories = useAppStore((state) => state.categories);
  const currency = useAppStore((state) => state.currency);

  const existingSub = useMemo(() => {
    return subscriptions.find((s) => s.id === id);
  }, [subscriptions, id]);

  const [name, setName] = useState(existingSub?.name || "");
  const [amount, setAmount] = useState(
    existingSub?.amount !== undefined ? existingSub.amount.toString() : ""
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    existingSub?.billingCycle || "monthly"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    existingSub?.categoryId || null
  );
  const [active, setActive] = useState<boolean>(
    existingSub ? existingSub.active : true
  );

  // Recurrence due day state
  const initialDate = existingSub?.nextChargeDate
    ? new Date(existingSub.nextChargeDate)
    : new Date();
  const [dueDay, setDueDay] = useState(
    existingSub?.dueDay !== undefined ? existingSub.dueDay : initialDate.getDate()
  );
  const [dueMonth, setDueMonth] = useState(initialDate.getMonth());
  const [selectedColor, setSelectedColor] = useState(
    existingSub?.color || "#B2C5FF"
  );

  useEffect(() => {
    if (existingSub) {
      setName(existingSub.name);
      setAmount(existingSub.amount.toString());
      setBillingCycle(existingSub.billingCycle);
      setSelectedCategoryId(existingSub.categoryId || null);
      setActive(existingSub.active);
      setSelectedColor(existingSub.color || "#B2C5FF");
      const d = existingSub.nextChargeDate
        ? new Date(existingSub.nextChargeDate)
        : new Date();
      setDueDay(
        existingSub.dueDay !== undefined ? existingSub.dueDay : d.getDate()
      );
      setDueMonth(d.getMonth());
    }
  }, [existingSub]);

  const colors = [
    "#B2C5FF",
    "#4DE082",
    "#FFB4AB",
    "#C084FC",
    "#FBBF24",
    "#38BDF8",
  ];

  // All 31 days for the scrollable picker
  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // Compute the exact next charge date whenever cycle or dueDay changes
  const computedNextDate = useMemo(() => {
    return calculateNextChargeDate(billingCycle, {
      dayOfMonth: dueDay,
      dayOfWeek: dueDay,
      monthOfYear: dueMonth,
    });
  }, [billingCycle, dueDay, dueMonth]);

  const scheduleDescription = useMemo(() => {
    return formatDueSchedule({
      billingCycle,
      dueDay,
      nextChargeDate: computedNextDate,
    });
  }, [billingCycle, dueDay, computedNextDate]);

  const dueStatus = useMemo(() => {
    return getDueStatus(computedNextDate);
  }, [computedNextDate]);

  const handleCycleChange = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    if (cycle === "weekly" && (dueDay > 6 || dueDay < 0)) {
      setDueDay(1); // Monday
    } else if (cycle !== "weekly" && dueDay < 1) {
      setDueDay(6);
    }
  };

  const handleSave = () => {
    if (!id || !existingSub) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !name.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid subscription name and amount.");
      return;
    }

    updateSubscription(id, {
      name: name.trim(),
      categoryId: selectedCategoryId || undefined,
      amount: parsedAmount,
      billingCycle,
      dueDay,
      nextChargeDate: computedNextDate,
      active,
      color: selectedColor,
    });

    router.back();
  };

  const handleDelete = () => {
    if (!id || !existingSub) return;

    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete "${existingSub.name}"? You can undo this action.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSubscription(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!existingSub) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <GrabHandle />
        <MaterialIcons name="error-outline" size={48} color="#FF897D" />
        <Text className="text-lg font-bold text-on-surface mt-3 text-center">
          Subscription Not Found
        </Text>
        <Text className="text-xs text-on-surface-variant text-center mt-1 mb-6">
          This recurring bill might have already been removed.
        </Text>
        <ScaleButton
          activeScale={0.92}
          className="px-6 py-3 rounded-2xl bg-surface-container border border-outline-variant/30"
          onPress={() => router.back()}
        >
          <Text className="text-sm font-bold text-on-surface">Go Back</Text>
        </ScaleButton>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="h-16 px-4 flex-row items-center justify-between border-b border-outline-variant/20">
          <View className="flex-row items-center gap-3">
            <ScaleButton
              activeScale={0.88}
              className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
              onPress={() => router.back()}
            >
              <MaterialIcons name="close" size={22} color="#DFE2F1" />
            </ScaleButton>
            <Text className="text-xl font-extrabold text-on-surface tracking-tight">
              Edit Subscription
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
            className="w-10 h-10 rounded-full bg-error/15 border border-error/25 items-center justify-center"
          >
            <MaterialIcons name="delete-outline" size={20} color="#FF897D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Hero Input */}
          <View className="mx-5 mt-5 mb-6 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Recurring Amount
            </Text>

            <View className="flex-row items-center justify-center w-full my-2">
              <Text className="text-3xl font-extrabold text-on-surface-variant mr-1">
                {currency?.symbol || "$"}
              </Text>
              <TextInput
                className="text-4xl font-extrabold text-on-surface text-center min-w-[120px] p-0"
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#C3C6D650"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Service Name */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Subscription Name
            </Text>
            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="label" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Service Name (e.g. Netflix, Spotify, Gym)"
                placeholderTextColor="#C3C6D680"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Active Status Card */}
          <View className="mx-5 mb-6 p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 mr-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: active ? "rgba(77, 224, 130, 0.15)" : "rgba(255, 180, 171, 0.15)",
                }}
              >
                <MaterialIcons
                  name={active ? "check-circle" : "pause-circle-outline"}
                  size={22}
                  color={active ? "#4DE082" : "#FFB4AB"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">
                  {active ? "Bill is Active" : "Bill is Paused"}
                </Text>
                <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                  {active
                    ? "Included in monthly calculations and due reminders."
                    : "Temporarily excluded from active totals."}
                </Text>
              </View>
            </View>
            <Toggle value={active} onValueChange={setActive} />
          </View>

          {/* Billing Cycle Selection */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Billing Frequency
            </Text>
            <SegmentedControl<BillingCycle>
              options={[
                { value: "weekly" as const, label: "Weekly" },
                { value: "monthly" as const, label: "Monthly" },
                { value: "quarterly" as const, label: "Quarterly" },
                { value: "yearly" as const, label: "Yearly" },
              ]}
              selectedValue={billingCycle}
              onChange={handleCycleChange}
            />
          </View>

          {/* Due Date & Recurrence Picker */}
          <View className="px-5 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {billingCycle === "weekly"
                  ? "Day of the Week"
                  : billingCycle === "yearly"
                  ? "Annual Due Date"
                  : "Due Date of the Month"}
              </Text>
            </View>

            {/* Weekly Day Picker */}
            {billingCycle === "weekly" && (
              <View className="flex-row justify-between gap-1.5 mb-4">
                {WEEKDAYS.map((wd) => {
                  const isSelected = dueDay === wd.value;
                  return (
                    <TouchableOpacity
                      key={wd.value}
                      activeOpacity={0.7}
                      onPress={() => setDueDay(wd.value)}
                      className="flex-1 py-3 rounded-2xl items-center justify-center border"
                      style={{
                        backgroundColor: isSelected ? "#B2C5FF" : "#1E2330",
                        borderColor: isSelected ? "#B2C5FF" : "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: isSelected ? "#002C72" : "#8D909F",
                          fontWeight: isSelected ? "800" : "600",
                        }}
                      >
                        {wd.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Yearly Month & Day Pickers */}
            {billingCycle === "yearly" && (
              <View className="mb-4">
                <Text className="text-[11px] font-medium text-on-surface-variant mb-2">
                  Month
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                  className="mb-3"
                >
                  {MONTHS.map((mName, idx) => {
                    const isSelected = dueMonth === idx;
                    return (
                      <TouchableOpacity
                        key={mName}
                        activeOpacity={0.7}
                        onPress={() => setDueMonth(idx)}
                        className="px-3.5 py-2 rounded-xl border"
                        style={{
                          backgroundColor: isSelected ? "#B2C5FF" : "#1E2330",
                          borderColor: isSelected ? "#B2C5FF" : "rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{
                            color: isSelected ? "#002C72" : "#8D909F",
                          }}
                        >
                          {mName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Monthly / Quarterly / Yearly Day of Month Picker */}
            {billingCycle !== "weekly" && (
              <View className="mb-4">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {allDays.map((dayNum) => {
                    const isSelected = dueDay === dayNum;
                    return (
                      <TouchableOpacity
                        key={dayNum}
                        activeOpacity={0.7}
                        onPress={() => setDueDay(dayNum)}
                        className="w-10 h-10 rounded-xl items-center justify-center border"
                        style={{
                          backgroundColor: isSelected ? "#B2C5FF" : "#1E2330",
                          borderColor: isSelected ? "#B2C5FF" : "rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Text
                          className="text-xs font-extrabold"
                          style={{
                            color: isSelected ? "#002C72" : "#FFFFFF",
                          }}
                        >
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Live Recurrence Preview Card */}
            <View className="p-4 rounded-2xl bg-surface-container-high border border-primary/25 shadow-sm flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-3.5 flex-1">
                <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center border border-primary/20">
                  <MaterialIcons name="event-repeat" size={22} color="#B2C5FF" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-primary tracking-tight">
                    {scheduleDescription}
                  </Text>
                  <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                    Next charge: {formatReadableDate(computedNextDate)}
                  </Text>
                </View>
              </View>

              {dueStatus.isDueSoon && (
                <DueSoonBadge
                  label={dueStatus.label}
                  isOverdue={dueStatus.isOverdue}
                />
              )}
            </View>
          </View>

          {/* Category Chips */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories
                .filter((c) => c.type === "expense")
                .map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      className="px-4 py-2.5 rounded-2xl border flex-row items-center gap-2"
                      style={{
                        backgroundColor: isSelected ? "rgba(178, 197, 255, 0.18)" : "#1E2330",
                        borderColor: isSelected ? "#B2C5FF" : "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <MaterialIcons
                        name={cat.icon as any}
                        size={16}
                        color={isSelected ? "#B2C5FF" : "#8D909F"}
                      />
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: isSelected ? "#B2C5FF" : "#8D909F",
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>

          {/* Color Accent Picker */}
          <View className="px-5 mb-8">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Brand Accent Color
            </Text>
            <View className="flex-row gap-3">
              {colors.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.8}
                    onPress={() => setSelectedColor(c)}
                    className="w-10 h-10 rounded-full items-center justify-center border-2"
                    style={{
                      backgroundColor: c,
                      borderColor: isSelected ? "#FFFFFF" : "transparent",
                    }}
                  >
                    {isSelected && (
                      <MaterialIcons name="check" size={18} color="#000000" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Action */}
          <View className="px-5">
            <ScaleButton
              activeScale={0.95}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={22} color="#002C72" />
              <Text className="text-base font-extrabold text-on-primary">
                Save Changes
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
