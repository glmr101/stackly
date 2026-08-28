import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";

type TransactionType = "expense" | "income" | "transfer";

export default function AddTransaction() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: TransactionType }>();

  const storeAccounts = useAppStore((state) => state.accounts);
  const storeCategories = useAppStore((state) => state.categories);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const currency = useAppStore((state) => state.currency);

  const initialType: TransactionType =
    params.type === "income" || params.type === "transfer" || params.type === "expense"
      ? params.type
      : "expense";

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(
    storeAccounts[0]?.id || ""
  );
  const [selectedDestinationAccountId, setSelectedDestinationAccountId] =
    useState(
      storeAccounts.length > 1
        ? storeAccounts[1]?.id
        : storeAccounts[0]?.id || ""
    );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");

  const availableCategories =
    type === "transfer"
      ? []
      : storeCategories.filter((c) => c.type === type);

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toFixed(current % 1 === 0 ? 0 : 2));
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !selectedAccountId) {
      return;
    }

    if (type === "transfer" && !selectedDestinationAccountId) {
      return;
    }

    addTransaction({
      type,
      amount: parsedAmount,
      accountId: selectedAccountId,
      destinationAccountId:
        type === "transfer" ? selectedDestinationAccountId : undefined,
      categoryId: selectedCategoryId || undefined,
      payee:
        merchant.trim() ||
        (type === "transfer" ? "Transfer" : "Quick Transaction"),
      note: note.trim(),
      date: new Date().toISOString(),
    });

    router.back();
  };

  const segmentOptions = [
    { value: "expense" as const, label: "Expense" },
    { value: "income" as const, label: "Income" },
    { value: "transfer" as const, label: "Transfer" },
  ];

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
              Log Transaction
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented Control */}
          <View className="px-5 mt-4 mb-6">
            <SegmentedControl<TransactionType>
              options={segmentOptions}
              selectedValue={type}
              onChange={(val) => {
                setType(val);
                setSelectedCategoryId(null);
              }}
              activePillColor={
                type === "income"
                  ? "#4DE082"
                  : type === "expense"
                  ? "#FFB4AB"
                  : "#B2C5FF"
              }
              activeTextColor={type === "income" ? "#003919" : "#002C72"}
            />
          </View>

          {/* Amount Hero Input */}
          <View className="mx-5 mb-6 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Amount
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
                autoFocus={true}
              />
            </View>

            {/* Quick Amount Presets */}
            <View className="flex-row gap-2 mt-4 pt-4 border-t border-white/5">
              {[10, 25, 50, 100].map((preset) => (
                <ScaleButton
                  key={preset}
                  activeScale={0.92}
                  onPress={() => handleAddPreset(preset)}
                  className="px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30"
                >
                  <Text className="text-xs font-bold text-primary">
                    +{currency?.symbol || "$"}{preset}
                  </Text>
                </ScaleButton>
              ))}
            </View>
          </View>

          {/* Account Selector */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-5">
              {type === "transfer" ? "From Account" : "Pay With Account"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            >
              {storeAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <ScaleButton
                    key={acc.id}
                    activeScale={0.94}
                    onPress={() => setSelectedAccountId(acc.id)}
                    className={`p-3.5 rounded-2xl flex-row items-center gap-2.5 border ${
                      isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-surface-container border-outline-variant/30"
                    }`}
                  >
                    <MaterialIcons
                      name={acc.icon as any}
                      size={20}
                      color={isSelected ? "#B2C5FF" : "#C3C6D6"}
                    />
                    <View>
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        {acc.name}
                      </Text>
                      <Text className="text-[10px] text-on-surface-variant font-medium">
                        ${acc.balance.toLocaleString()}
                      </Text>
                    </View>
                  </ScaleButton>
                );
              })}
            </ScrollView>
          </View>

          {/* Destination Account (For Transfer) */}
          {type === "transfer" && (
            <View className="mb-6">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-5">
                To Account
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
              >
                {storeAccounts.map((acc) => {
                  const isSelected = selectedDestinationAccountId === acc.id;
                  return (
                    <ScaleButton
                      key={acc.id}
                      activeScale={0.94}
                      onPress={() => setSelectedDestinationAccountId(acc.id)}
                      className={`p-3.5 rounded-2xl flex-row items-center gap-2.5 border ${
                        isSelected
                          ? "bg-secondary/20 border-secondary"
                          : "bg-surface-container border-outline-variant/30"
                      }`}
                    >
                      <MaterialIcons
                        name={acc.icon as any}
                        size={20}
                        color={isSelected ? "#4DE082" : "#C3C6D6"}
                      />
                      <View>
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? "text-secondary" : "text-on-surface"
                          }`}
                        >
                          {acc.name}
                        </Text>
                        <Text className="text-[10px] text-on-surface-variant font-medium">
                          ${acc.balance.toLocaleString()}
                        </Text>
                      </View>
                    </ScaleButton>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Category Selector */}
          {type !== "transfer" && (
            <View className="px-5 mb-6">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <ScaleButton
                      key={cat.id}
                      activeScale={0.92}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      className={`p-3 rounded-2xl flex-col items-center justify-center gap-1.5 w-[30%] border ${
                        isSelected
                          ? "bg-primary/20 border-primary"
                          : "bg-surface-container border-outline-variant/30"
                      }`}
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: isSelected
                            ? cat.color
                            : `${cat.color}25`,
                        }}
                      >
                        <MaterialIcons
                          name={cat.icon as any}
                          size={20}
                          color={isSelected ? "#002C72" : cat.color}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        className={`text-xs font-bold ${
                          isSelected ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </ScaleButton>
                  );
                })}
              </View>
            </View>
          )}

          {/* Merchant & Note Inputs */}
          <View className="px-5 flex-col gap-3 mb-8">
            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="storefront" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Merchant or Payee (e.g. Target)"
                placeholderTextColor="#C3C6D680"
                value={merchant}
                onChangeText={setMerchant}
              />
            </View>

            <View className="bg-surface-container rounded-2xl px-4 py-2 flex-row items-start gap-3 border border-outline-variant/30">
              <MaterialIcons
                name="notes"
                size={20}
                color="#C3C6D6"
                style={{ marginTop: 4 }}
              />
              <TextInput
                className="flex-1 text-on-surface text-sm p-2 pt-0"
                placeholder="Add a note (optional)"
                placeholderTextColor="#C3C6D680"
                multiline
                numberOfLines={2}
                value={note}
                onChangeText={setNote}
                style={{ minHeight: 48, textAlignVertical: "top" }}
              />
            </View>
          </View>

          {/* Save Button */}
          <View className="px-5">
            <ScaleButton
              activeScale={0.95}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={22} color="#002C72" />
              <Text className="text-base font-extrabold text-on-primary">
                Save Transaction
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
