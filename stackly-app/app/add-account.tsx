import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName, Account } from "@/types";

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
  const [type, setType] = useState<AccountType>("checking");

  const accountTypes: AccountTypeOption[] = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "credit", label: "Credit Card" },
    { value: "investment", label: "Investment" },
    { value: "cash", label: "Cash" },
  ];

  const getIconForType = (accType: AccountType): MaterialIconName => {
    switch (accType) {
      case "checking": return "account-balance";
      case "savings": return "savings";
      case "credit": return "credit-card";
      case "investment": return "trending-up";
      case "cash": return "payments";
      default: return "account-balance-wallet";
    }
  };

  const handleSave = () => {
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || !name || !institution) {
      // Very basic validation
      return;
    }

    addAccount({
      name,
      institution,
      balance: parsedBalance,
      type,
      icon: getIconForType(type),
    });

    router.back();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-4 flex-row items-center gap-4 border-b border-outline/10">
        <Pressable
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#dfe2f1" />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-on-surface">
          Add Account
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        {/* Balance */}
        <View className="px-6 mt-8 mb-10 flex-col items-center">
          <Text className="text-on-surface-variant text-label-md uppercase tracking-wider mb-2 opacity-80">
            Current Balance
          </Text>
          <View className="flex-row items-center justify-center w-full relative">
            <Text className="text-on-surface-variant text-headline-lg absolute left-4 z-10">
              $
            </Text>
            <TextInput
              className="w-full text-center text-display text-on-surface font-numeral-xl p-4"
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#c3c6d64d"
              value={balance}
              onChangeText={setBalance}
            />
          </View>
          <View className="h-[2px] w-32 bg-primary/20 rounded-full mt-2 overflow-hidden">
            <View className="h-full w-full bg-primary rounded-full scale-x-50" />
          </View>
        </View>

        {/* Inputs */}
        <View className="px-4 flex-col gap-4 mb-8">
          <View className="bg-surface-container-low rounded-xl px-4 py-1 flex-row items-center gap-3">
            <MaterialIcons name="label" size={20} color="#c3c6d6" />
            <TextInput
              className="flex-1 text-on-surface text-body-lg p-3 h-14"
              placeholder="Account Name (e.g. Daily Checking)"
              placeholderTextColor="#c3c6d680"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View className="bg-surface-container-low rounded-xl px-4 py-1 flex-row items-center gap-3">
            <MaterialIcons name="account-balance" size={20} color="#c3c6d6" />
            <TextInput
              className="flex-1 text-on-surface text-body-lg p-3 h-14"
              placeholder="Institution (e.g. Chase, BofA)"
              placeholderTextColor="#c3c6d680"
              value={institution}
              onChangeText={setInstitution}
            />
          </View>
        </View>

        {/* Account Type Selector */}
        <View className="px-4 mb-10">
          <Text className="text-on-surface text-label-md uppercase tracking-wider mb-4 px-2 opacity-80">
            Account Type
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {accountTypes.map((accType) => {
              const isSelected = type === accType.value;
              return (
                <Pressable
                  key={accType.value}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                    isSelected
                      ? "bg-primary-container border-primary"
                      : "bg-surface-container-low border-outline/10"
                  }`}
                  onPress={() => setType(accType.value)}
                >
                  <MaterialIcons
                    name={getIconForType(accType.value)}
                    size={20}
                    color={isSelected ? "#002c72" : "#c3c6d6"} // on-primary-container
                  />
                  <Text
                    className={`text-body-md font-body-md ${
                      isSelected ? "text-on-primary-container" : "text-on-surface-variant"
                    }`}
                  >
                    {accType.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Action */}
        <View className="px-4">
          <Pressable
            className="w-full bg-primary py-4 rounded-xl items-center justify-center flex-row gap-2 active:bg-primary-container shadow-sm"
            onPress={handleSave}
          >
            <MaterialIcons name="check-circle" size={20} color="#002c72" />
            <Text className="text-on-primary text-headline-md font-headline-md">
              Save Account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
