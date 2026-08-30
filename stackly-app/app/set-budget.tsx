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
import { CreateCategoryModal } from "@/components/ui/CreateCategoryModal";

export default function SetBudget() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; goalId?: string }>();

  const storeCategories = useAppStore((state) => state.categories);
  const budgetGoals = useAppStore((state) => state.budgetGoals);
  const transactions = useAppStore((state) => state.transactions);
  const currency = useAppStore((state) => state.currency);
  const setBudgetGoal = useAppStore((state) => state.setBudgetGoal);
  const deleteBudgetGoal = useAppStore((state) => state.deleteBudgetGoal);

  const currencySymbol = currency?.symbol || "$";

  // Filter only expense categories
  const expenseCategories = useMemo(() => {
    return storeCategories.filter((c) => c.type === "expense");
  }, [storeCategories]);

  // Determine initial category
  const initialCategoryId = useMemo(() => {
    if (params.categoryId && expenseCategories.some((c) => c.id === params.categoryId)) {
      return params.categoryId;
    }
    if (params.goalId) {
      const match = budgetGoals.find((bg) => bg.id === params.goalId);
      if (match) return match.categoryId;
    }
    // Default to first expense category without a goal, or just the first expense category
    const unbudgeted = expenseCategories.find(
      (c) => !budgetGoals.some((bg) => bg.categoryId === c.id)
    );
    return unbudgeted?.id || expenseCategories[0]?.id || "";
  }, [params.categoryId, params.goalId, expenseCategories, budgetGoals]);

  const initialAmount = useMemo(() => {
    const goal = budgetGoals.find((bg) => bg.categoryId === initialCategoryId);
    return goal ? goal.monthlyLimit.toString() : "";
  }, [budgetGoals, initialCategoryId]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [amount, setAmount] = useState<string>(initialAmount);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  // Check if the selected category currently has an active goal
  const existingGoalForCategory = useMemo(() => {
    return budgetGoals.find((bg) => bg.categoryId === selectedCategoryId);
  }, [budgetGoals, selectedCategoryId]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    const existing = budgetGoals.find((bg) => bg.categoryId === catId);
    if (existing) {
      setAmount(existing.monthlyLimit.toString());
    } else {
      setAmount("");
    }
  };

  // Calculate current month's actual spent for this category
  const currentMonthSpent = useMemo(() => {
    if (!selectedCategoryId) return 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.reduce((sum, tx) => {
      if (tx.type === "expense" && tx.categoryId === selectedCategoryId) {
        const txDate = new Date(tx.date);
        if (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        ) {
          return sum + tx.amount;
        }
      }
      return sum;
    }, 0);
  }, [transactions, selectedCategoryId]);

  const parsedAmount = parseFloat(amount) || 0;
  const isOverBudget = parsedAmount > 0 && currentMonthSpent > parsedAmount;
  const progressPercentage =
    parsedAmount > 0 ? Math.min((currentMonthSpent / parsedAmount) * 100, 100) : 0;
  const remainingBudget = parsedAmount - currentMonthSpent;

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    const nextVal = current + val;
    setAmount(nextVal.toFixed(nextVal % 1 === 0 ? 0 : 2));
  };

  const handleSave = () => {
    if (!selectedCategoryId) {
      Alert.alert("Selection Required", "Please select a category for this budget goal.");
      return;
    }

    const limit = parseFloat(amount);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid monthly budget limit greater than zero.");
      return;
    }

    setBudgetGoal({
      categoryId: selectedCategoryId,
      monthlyLimit: limit,
    });

    router.back();
  };

  const handleDelete = () => {
    if (!existingGoalForCategory) return;

    const catName =
      expenseCategories.find((c) => c.id === selectedCategoryId)?.name || "this category";

    Alert.alert(
      "Remove Budget Goal",
      `Are you sure you want to remove the monthly budget goal for ${catName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            deleteBudgetGoal(existingGoalForCategory.id);
            router.back();
          },
        },
      ]
    );
  };

  const selectedCategory = expenseCategories.find((c) => c.id === selectedCategoryId);

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
              {existingGoalForCategory ? "Edit Budget Goal" : "Set Budget Goal"}
            </Text>
          </View>

          {existingGoalForCategory && (
            <ScaleButton
              activeScale={0.88}
              className="w-10 h-10 rounded-full bg-error/15 border border-error/30 items-center justify-center shadow-sm"
              onPress={handleDelete}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FFB4AB" />
            </ScaleButton>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Category Selector */}
          <View className="px-5 mt-5 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Select Category
              </Text>
              <Text className="text-xs text-on-surface-variant font-medium">
                {expenseCategories.length} Categories
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2.5">
              {expenseCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const existingGoal = budgetGoals.find((bg) => bg.categoryId === cat.id);
                const hasExistingGoal = !!existingGoal;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => handleCategorySelect(cat.id)}
                    className="p-3 rounded-2xl flex-col items-center justify-center gap-1.5 w-[30.5%] border relative"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(178, 197, 255, 0.18)"
                        : "#1C1F2A",
                      borderColor: isSelected
                        ? "#B2C5FF"
                        : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {hasExistingGoal && (
                      <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary" />
                    )}

                    <View
                      className="w-11 h-11 rounded-2xl items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: isSelected ? cat.color : `${cat.color}25`,
                      }}
                    >
                      <MaterialIcons
                        name={cat.icon as any}
                        size={22}
                        color={isSelected ? "#002C72" : cat.color}
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      className="text-xs font-bold text-center"
                      style={{
                        color: isSelected ? "#B2C5FF" : "#DFE2F1",
                        fontWeight: isSelected ? "800" : "600",
                      }}
                    >
                      {cat.name}
                    </Text>

                    {hasExistingGoal && (
                      <Text
                        numberOfLines={1}
                        className="text-[10px] text-on-surface-variant font-medium"
                      >
                        {currencySymbol}
                        {existingGoal?.monthlyLimit.toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* + New Category Tile */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCreateCategory(true)}
                className="p-3 rounded-2xl flex-col items-center justify-center gap-1.5 w-[30.5%] border border-dashed"
                style={{
                  backgroundColor: '#1C1F2A',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                >
                  <MaterialIcons name="add" size={24} color="#8D909F" />
                </View>
                <Text className="text-xs font-bold" style={{ color: '#8D909F' }}>
                  New
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Hero Input */}
          <View className="mx-5 mb-5 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center shadow-md">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Monthly Budget Limit
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
                autoFocus={!params.categoryId && !params.goalId}
              />
            </View>

            {/* Quick Increments */}
            <View className="flex-row flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-white/5 w-full">
              {[50, 100, 250, 500, 1000].map((preset) => (
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

          {/* Real-time Spend Context Insight Card */}
          {selectedCategory && (
            <View className="mx-5 mb-7 p-5 rounded-[24px] bg-surface-container-low border border-outline-variant/20">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${selectedCategory.color}25` }}
                  >
                    <MaterialIcons
                      name={selectedCategory.icon as any}
                      size={15}
                      color={selectedCategory.color}
                    />
                  </View>
                  <Text className="text-xs font-bold text-on-surface">
                    {selectedCategory.name} Spending
                  </Text>
                </View>

                <Text className="text-xs font-bold text-on-surface">
                  {currencySymbol}{currentMonthSpent.toFixed(2)} spent this month
                </Text>
              </View>

              {parsedAmount > 0 ? (
                <View className="mt-2">
                  {/* Robust and Smooth Progress Bar */}
                  <View className="w-full h-2 rounded-full bg-[#131722] overflow-hidden my-1">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: isOverBudget
                          ? "#FFB4AB"
                          : progressPercentage > 80
                            ? "#FBBF24"
                            : selectedCategory.color || "#4DE082",
                      }}
                    />
                  </View>

                  <View className="flex-row justify-between items-center mt-1.5">
                    <Text className="text-[11px] text-on-surface-variant font-medium">
                      {progressPercentage.toFixed(0)}% of proposed limit
                    </Text>
                    <Text
                      className={`text-[11px] font-bold ${isOverBudget ? "text-error" : "text-secondary"
                        }`}
                    >
                      {isOverBudget
                        ? `Over limit by ${currencySymbol}${(currentMonthSpent - parsedAmount).toFixed(2)}`
                        : `${currencySymbol}${remainingBudget.toFixed(2)} remaining`}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-[11px] text-on-surface-variant mt-1">
                  Enter a limit to calculate real-time progress and remaining balance.
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="px-5 mb-8 flex-col gap-3">
            <ScaleButton
              activeScale={0.95}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={22} color="#002C72" />
              <Text className="text-base font-extrabold text-on-primary">
                {existingGoalForCategory ? "Update Budget Limit" : "Save Budget Goal"}
              </Text>
            </ScaleButton>

            {existingGoalForCategory && (
              <ScaleButton
                activeScale={0.95}
                className="w-full bg-error/15 border border-error/30 py-3.5 rounded-2xl items-center justify-center flex-row gap-2"
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={18} color="#FFB4AB" />
                <Text className="text-sm font-bold text-error">
                  Remove This Budget Goal
                </Text>
              </ScaleButton>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CreateCategoryModal
        visible={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        defaultType="expense"
        onCreated={(cat) => handleCategorySelect(cat.id)}
      />
    </View>
  );
}
