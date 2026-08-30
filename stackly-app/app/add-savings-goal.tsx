import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";
import { MaterialIconName } from "@/types";

const ICONS: { name: MaterialIconName; label: string }[] = [
  { name: "savings", label: "General" },
  { name: "security", label: "Safety" },
  { name: "laptop", label: "Tech" },
  { name: "flight", label: "Travel" },
  { name: "home", label: "Home" },
  { name: "directions-car", label: "Vehicle" },
  { name: "school", label: "Education" },
  { name: "favorite", label: "Life" },
  { name: "beach-access", label: "Holiday" },
  { name: "star", label: "Dream" },
];

const PRESET_DURATIONS = [
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
  { label: "2 Years", months: 24 },
  { label: "No Target Date", months: 0 },
];

export default function AddSavingsGoal() {
  const router = useRouter();
  const addSavingsGoal = useAppStore((state) => state.addSavingsGoal);
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || "$";

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<MaterialIconName>("savings");
  const [selectedDurationMonths, setSelectedDurationMonths] = useState<number>(12);

  // Compute targetDate based on duration
  const targetDateIso = useMemo(() => {
    if (selectedDurationMonths <= 0) return undefined;
    const d = new Date();
    d.setMonth(d.getMonth() + selectedDurationMonths);
    return d.toISOString();
  }, [selectedDurationMonths]);

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    const nextVal = current + val;
    setAmount(nextVal.toFixed(nextVal % 1 === 0 ? 0 : 2));
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Goal Name Required", "Please enter a name for your savings goal.");
      return;
    }

    const targetAmount = parseFloat(amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert(
        "Invalid Target Amount",
        "Please enter a target savings amount greater than zero."
      );
      return;
    }

    addSavingsGoal({
      name: trimmedName,
      targetAmount,
      currentAmount: 0,
      targetDate: targetDateIso,
      icon: selectedIcon,
      color: "#B2C5FF",
    });

    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
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
              New Savings Goal
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Target Amount Hero Input */}
          <View className="mx-5 mt-5 mb-6 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center shadow-md">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Target Savings Amount
            </Text>

            <View className="flex-row items-center justify-center w-full my-2">
              <Text className="text-3xl font-extrabold text-on-surface-variant mr-1">
                {currencySymbol}
              </Text>
              <TextInput
                className="text-4xl font-extrabold text-on-surface text-center min-w-[140px] p-0"
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#C3C6D650"
                value={amount}
                onChangeText={setAmount}
                autoFocus={true}
              />
            </View>

            {/* Quick Increments */}
            <View className="flex-row flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-white/5 w-full">
              {[100, 500, 1000, 2500, 5000].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  activeOpacity={0.7}
                  onPress={() => handleAddPreset(preset)}
                  className="px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: "#262A35",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Text className="text-xs font-bold text-primary">
                    +{currencySymbol}{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Name Input */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Goal Name
            </Text>
            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="flag" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="e.g. Emergency Fund, Laptop, Japan Trip"
                placeholderTextColor="#C3C6D680"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Target Timeline */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Target Timeline
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PRESET_DURATIONS.map((preset) => {
                const isSelected = selectedDurationMonths === preset.months;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDurationMonths(preset.months)}
                    className="px-4 py-2.5 rounded-2xl border"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(178, 197, 255, 0.18)"
                        : "#1C1F2A",
                      borderColor: isSelected
                        ? "#B2C5FF"
                        : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: isSelected ? "#B2C5FF" : "#C3C6D6",
                        fontWeight: isSelected ? "800" : "600",
                      }}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Icon Selector */}
          <View className="px-5 mb-8">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Goal Icon
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {ICONS.map((iconItem) => {
                const isSelected = selectedIcon === iconItem.name;
                return (
                  <TouchableOpacity
                    key={iconItem.name}
                    activeOpacity={0.7}
                    onPress={() => setSelectedIcon(iconItem.name)}
                    className="w-14 h-14 rounded-2xl items-center justify-center border"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(178, 197, 255, 0.22)"
                        : "#1C1F2A",
                      borderColor: isSelected
                        ? "#B2C5FF"
                        : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <MaterialIcons
                      name={iconItem.name as any}
                      size={24}
                      color={isSelected ? "#B2C5FF" : "#8D909F"}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Action Button */}
          <View className="px-5 mb-8">
            <ScaleButton
              activeScale={0.95}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={22} color="#002C72" />
              <Text className="text-base font-extrabold text-on-primary">
                Create Savings Goal
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
