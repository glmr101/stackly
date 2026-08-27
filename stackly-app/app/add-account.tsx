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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName, Account } from "@/types";
import { ScaleButton } from "@/components/ui/ScaleButton";

type AccountType = Account["type"];

interface AccountTypeOption {
  value: AccountType;
  label: string;
}

export default function AddAccount() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const addAccount = useAppStore((state) => state.addAccount);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AccountType>("bank");

  const accountTypes: AccountTypeOption[] = [
    { value: "bank", label: "Bank Account" },
    { value: "e-wallet", label: "E-Wallet" },
    { value: "cash", label: "Physical Cash" },
    { value: "credit card", label: "Credit Card" },
    { value: "investment", label: "Investment" },
  ];

  const getIconForType = (accType: AccountType): MaterialIconName => {
    switch (accType) {
      case "bank":
        return "account-balance";
      case "e-wallet":
        return "account-balance-wallet";
      case "cash":
        return "payments";
      case "credit card":
        return "credit-card";
      case "investment":
        return "trending-up";
      default:
        return "account-balance-wallet";
    }
  };

  const handleSave = () => {
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || !name.trim() || !institution.trim()) {
      return;
    }

    addAccount({
      name: name.trim(),
      institution: institution.trim(),
      balance: parsedBalance,
      type,
      icon: getIconForType(type),
    });

    router.back();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
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
            <Text className="text-lg font-bold text-on-surface tracking-tight">
              Add New Account
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Hero Input */}
          <View className="mx-5 mt-5 mb-6 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Starting Balance
            </Text>

            <View className="flex-row items-center justify-center w-full my-2">
              <Text className="text-3xl font-extrabold text-on-surface-variant mr-1">
                $
              </Text>
              <TextInput
                className="text-4xl font-extrabold text-on-surface text-center min-w-[120px] p-0"
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#C3C6D650"
                value={balance}
                onChangeText={setBalance}
                autoFocus={true}
              />
            </View>
          </View>

          {/* Account Details Inputs */}
          <View className="px-5 flex-col gap-3 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Account Info
            </Text>

            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="label" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Account Name (e.g. Daily Checking)"
                placeholderTextColor="#C3C6D680"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="account-balance" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Institution (e.g. Chase, Robinhood)"
                placeholderTextColor="#C3C6D680"
                value={institution}
                onChangeText={setInstitution}
              />
            </View>
          </View>

          {/* Account Type Selector */}
          <View className="px-5 mb-8">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Account Type
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {accountTypes.map((accType) => {
                const isSelected = type === accType.value;
                return (
                  <ScaleButton
                    key={accType.value}
                    activeScale={0.92}
                    onPress={() => setType(accType.value)}
                    className={`flex-row items-center gap-2.5 px-4 py-3 rounded-2xl border ${
                      isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-surface-container border-outline-variant/30"
                    }`}
                  >
                    <MaterialIcons
                      name={getIconForType(accType.value)}
                      size={20}
                      color={isSelected ? "#B2C5FF" : "#C3C6D6"}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {accType.label}
                    </Text>
                  </ScaleButton>
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
                Save Account
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
