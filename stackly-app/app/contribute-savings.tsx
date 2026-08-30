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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";

export default function ContributeSavings() {
  const router = useRouter();
  const params = useLocalSearchParams<{ goalId?: string }>();

  const savingsGoals = useAppStore((state) => state.savingsGoals);
  const accounts = useAppStore((state) => state.accounts);
  const currency = useAppStore((state) => state.currency);
  const contributeToSavingsGoal = useAppStore((state) => state.contributeToSavingsGoal);
  const deleteSavingsGoal = useAppStore((state) => state.deleteSavingsGoal);

  const currencySymbol = currency?.symbol || "$";

  // Target savings goal
  const goal = useMemo(() => {
    return savingsGoals.find((g) => g.id === params.goalId) || savingsGoals[0];
  }, [savingsGoals, params.goalId]);

  // Filter valid source accounts (bank, e-wallet, cash, or investment)
  const sourceAccounts = useMemo(() => {
    return accounts.filter((a) => a.type !== "credit card");
  }, [accounts]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    sourceAccounts[0]?.id || ""
  );
  const [amount, setAmount] = useState("");

  const selectedAccount = useMemo(() => {
    return sourceAccounts.find((a) => a.id === selectedAccountId);
  }, [sourceAccounts, selectedAccountId]);

  if (!goal) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <GrabHandle />
        <MaterialIcons name="error-outline" size={48} color="#FFB4AB" />
        <Text className="text-base font-bold text-on-surface mt-3">
          Savings Goal Not Found
        </Text>
        <ScaleButton
          activeScale={0.92}
          onPress={() => router.back()}
          className="mt-5 px-6 py-3 bg-surface-container rounded-2xl border border-outline-variant/30"
        >
          <Text className="text-xs font-bold text-primary">Go Back</Text>
        </ScaleButton>
      </View>
    );
  }

  const parsedAmount = parseFloat(amount) || 0;
  const currentSaved = goal.currentAmount;
  const targetAmount = goal.targetAmount;
  const remainingNeeded = Math.max(targetAmount - currentSaved, 0);

  // Projected metrics
  const projectedSaved = currentSaved + parsedAmount;
  const currentPercentage = Math.min((currentSaved / targetAmount) * 100, 100);
  const projectedPercentage = Math.min((projectedSaved / targetAmount) * 100, 100);

  // Validation
  const accountBalance = selectedAccount?.balance || 0;
  const isInsufficient = selectedAccount ? parsedAmount > accountBalance : false;
  const isValidAmount = parsedAmount > 0 && !isInsufficient;

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    const nextVal = current + val;
    setAmount(nextVal.toFixed(nextVal % 1 === 0 ? 0 : 2));
  };

  const handleFillRemaining = () => {
    if (remainingNeeded > 0) {
      setAmount(remainingNeeded.toFixed(remainingNeeded % 1 === 0 ? 0 : 2));
    }
  };

  const handleConfirmContribution = () => {
    if (!selectedAccount) {
      Alert.alert("Source Account Required", "Please select an account to contribute from.");
      return;
    }

    if (parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a contribution amount greater than zero.");
      return;
    }

    if (isInsufficient) {
      Alert.alert(
        "Insufficient Balance",
        `Only ${currencySymbol}${accountBalance.toLocaleString()} is available in ${selectedAccount.name}.`
      );
      return;
    }

    const success = contributeToSavingsGoal(goal.id, selectedAccount.id, parsedAmount);
    if (success) {
      router.back();
    } else {
      Alert.alert("Contribution Failed", "Unable to complete the contribution. Please verify account balance.");
    }
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Remove Savings Goal",
      `Are you sure you want to remove the goal "${goal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            deleteSavingsGoal(goal.id);
            router.back();
          },
        },
      ]
    );
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
              Contribute to Goal
            </Text>
          </View>

          <ScaleButton
            activeScale={0.88}
            className="w-10 h-10 rounded-full bg-error/15 border border-error/30 items-center justify-center shadow-sm"
            onPress={handleDeleteGoal}
          >
            <MaterialIcons name="delete-outline" size={20} color="#FFB4AB" />
          </ScaleButton>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Goal Summary Card */}
          <View className="mx-5 mt-5 mb-6 p-5 rounded-[24px] bg-surface-container-low border border-outline-variant/30">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                <View className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center">
                  <MaterialIcons
                    name={(goal.icon || "savings") as any}
                    size={20}
                    color="#B2C5FF"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-bold text-on-surface"
                    numberOfLines={1}
                  >
                    {goal.name}
                  </Text>
                  <Text className="text-xs text-on-surface-variant font-medium">
                    {currencySymbol}{currentSaved.toLocaleString()} of {currencySymbol}{targetAmount.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View
                className="px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor:
                    projectedSaved >= targetAmount
                      ? "rgba(77, 224, 130, 0.15)"
                      : "rgba(178, 197, 255, 0.15)",
                  borderColor:
                    projectedSaved >= targetAmount
                      ? "rgba(77, 224, 130, 0.3)"
                      : "rgba(178, 197, 255, 0.3)",
                }}
              >
                <Text
                  className="text-[11px] font-bold"
                  style={{
                    color: projectedSaved >= targetAmount ? "#4DE082" : "#B2C5FF",
                  }}
                >
                  {projectedPercentage.toFixed(0)}%
                </Text>
              </View>
            </View>

            {/* Robust Progress Bar Projection */}
            <View className="w-full h-2 rounded-full bg-[#131722] overflow-hidden my-1">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${projectedPercentage}%`,
                  backgroundColor: projectedSaved >= targetAmount ? "#4DE082" : "#B2C5FF",
                }}
              />
            </View>

            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-[11px] text-on-surface-variant font-medium">
                Current: {currentPercentage.toFixed(0)}%
              </Text>
              <Text className="text-[11px] font-bold text-primary">
                {remainingNeeded > 0
                  ? `${currencySymbol}${remainingNeeded.toLocaleString()} needed`
                  : "Goal fully funded!"}
              </Text>
            </View>
          </View>

          {/* Step 1: Source Account Selection */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Step 1: Select Source Account
            </Text>

            <View className="flex-col gap-2.5">
              {sourceAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                const hasSufficient = parsedAmount <= 0 || acc.balance >= parsedAmount;

                return (
                  <TouchableOpacity
                    key={acc.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedAccountId(acc.id)}
                    className="p-4 rounded-2xl flex-row items-center justify-between border"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(178, 197, 255, 0.15)"
                        : "#1C1F2A",
                      borderColor: isSelected
                        ? "#B2C5FF"
                        : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{
                          backgroundColor: isSelected
                            ? "rgba(178, 197, 255, 0.25)"
                            : "#262A35",
                        }}
                      >
                        <MaterialIcons
                          name={(acc.icon || "account-balance-wallet") as any}
                          size={20}
                          color={isSelected ? "#B2C5FF" : "#8D909F"}
                        />
                      </View>
                      <View>
                        <Text className="text-sm font-bold text-on-surface">
                          {acc.name}
                        </Text>
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {acc.institution} • {acc.type}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text
                        className="text-sm font-extrabold"
                        style={{
                          color: isSelected ? "#B2C5FF" : "#DFE2F1",
                        }}
                      >
                        {currencySymbol}
                        {acc.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <Text
                        className="text-[10px] font-semibold"
                        style={{
                          color: hasSufficient ? "#C3C6D6" : "#FFB4AB",
                        }}
                      >
                        {hasSufficient ? "Available" : "Insufficient"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {sourceAccounts.length === 0 && (
                <View className="p-5 bg-surface-container rounded-2xl border border-outline-variant/30 items-center justify-center">
                  <Text className="text-xs text-on-surface-variant">
                    No active bank or wallet accounts found.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Step 2: Contribution Amount Hero Input */}
          <View className="mx-5 mb-5 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center shadow-md">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Step 2: Contribution Amount
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

            {/* Inline Error Message for Exceeding Account Balance */}
            {isInsufficient && selectedAccount && (
              <View className="mt-3 px-3 py-2 bg-error/15 border border-error/30 rounded-xl flex-row items-center gap-2">
                <MaterialIcons name="error-outline" size={16} color="#FFB4AB" />
                <Text className="text-xs font-bold text-error">
                  Only {currencySymbol}
                  {accountBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  available in {selectedAccount.name}
                </Text>
              </View>
            )}

            {/* Quick Preset Buttons */}
            <View className="flex-row flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-white/5 w-full">
              {[50, 100, 250, 500].map((preset) => (
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
                    +{currencySymbol}{preset}
                  </Text>
                </TouchableOpacity>
              ))}

              {remainingNeeded > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleFillRemaining}
                  className="px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: "rgba(77, 224, 130, 0.15)",
                    borderColor: "rgba(77, 224, 130, 0.3)",
                  }}
                >
                  <Text className="text-xs font-bold text-secondary">
                    Fill Remaining ({currencySymbol}{remainingNeeded.toLocaleString()})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Confirm Button */}
          <View className="px-5 mb-8">
            <ScaleButton
              activeScale={0.95}
              disabled={!isValidAmount}
              className={`w-full py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg ${isValidAmount
                ? "bg-primary"
                : "bg-surface-container-high opacity-50 border border-outline-variant/30"
                }`}
              onPress={handleConfirmContribution}
            >
              <MaterialIcons
                name="arrow-forward"
                size={22}
                color={isValidAmount ? "#002C72" : "#8D909F"}
              />
              <Text
                className={`text-base font-extrabold ${isValidAmount ? "text-on-primary" : "text-on-surface-variant"
                  }`}
              >
                Confirm Contribution
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
