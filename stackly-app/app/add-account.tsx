import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName, Account } from "@/types";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";
import { BankPickerModal } from "@/components/ui/BankPickerModal";
import {
  PHILIPPINE_BANKS,
  PhilippineBank,
  findPhilippineBank,
} from "@/data/philippineBanks";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type AccountType = Account["type"];
type CardCategory = "debit" | "credit";
type CardNetwork = "mastercard" | "visa";

interface AccountTypeOption {
  value: AccountType;
  label: string;
}

export default function AddAccount() {
  const router = useRouter();

  const addAccount = useAppStore((state) => state.addAccount);
  const currency = useAppStore((state) => state.currency);

  const defaultBank = PHILIPPINE_BANKS[0]; // BPI default

  const [selectedBank, setSelectedBank] = useState<PhilippineBank>(defaultBank);
  const [customInstitution, setCustomInstitution] = useState("");
  const [bankPickerVisible, setBankPickerVisible] = useState(false);

  const [name, setName] = useState(`${defaultBank.shortName} Account`);
  const [balance, setBalance] = useState("");
  const [cardCategory, setCardCategory] = useState<CardCategory>("debit");
  const [cardNetwork, setCardNetwork] = useState<CardNetwork>("visa");
  const [type, setType] = useState<AccountType>("bank");

  const accountTypes: AccountTypeOption[] = [
    { value: "bank", label: "Bank Account" },
    { value: "credit card", label: "Credit Card" },
    { value: "e-wallet", label: "E-Wallet" },
    { value: "cash", label: "Physical Cash" },
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

  const handleSelectBank = (bank: PhilippineBank) => {
    setSelectedBank(bank);
    if (bank.id === "other") {
      setCustomInstitution("");
    } else {
      setCustomInstitution("");
      // Update default suggested name if user didn't write something custom
      setName(`${bank.shortName} ${cardCategory === "credit" ? "Credit Card" : "Account"}`);
      if (bank.category === "E-Wallet") {
        setType("e-wallet");
      } else if (cardCategory === "credit") {
        setType("credit card");
      } else {
        setType("bank");
      }
    }
  };

  const handleCardCategoryChange = (category: CardCategory) => {
    setCardCategory(category);
    if (category === "credit") {
      setType("credit card");
      if (name.includes("Account")) {
        setName(name.replace("Account", "Credit Card"));
      }
    } else {
      if (type === "credit card") {
        setType(selectedBank.category === "E-Wallet" ? "e-wallet" : "bank");
      }
      if (name.includes("Credit Card")) {
        setName(name.replace("Credit Card", "Account"));
      }
    }
  };

  const handleTypeChange = (newType: AccountType) => {
    setType(newType);
    if (newType === "cash") {
      if (name.includes("Account") || name.includes("Credit Card")) {
        setName("Cash Wallet");
      }
      setCustomInstitution("Cash");
    } else if (newType === "investment") {
      if (name.includes("Account") || name.includes("Credit Card") || name.includes("Cash")) {
        setName("Investment Portfolio");
      }
    } else if (newType === "credit card") {
      setCardCategory("credit");
      if (name.includes("Account")) {
        setName(name.replace("Account", "Credit Card"));
      }
    } else {
      setCardCategory("debit");
      if (name.includes("Credit Card")) {
        setName(name.replace("Credit Card", "Account"));
      }
    }
  };

  const currentInstitution =
    type === "cash"
      ? customInstitution.trim() || "Cash"
      : selectedBank.id === "other"
        ? customInstitution.trim() || "Custom Bank"
        : selectedBank.shortName;

  const handleSave = () => {
    const parsedBalance = parseFloat(balance || "0");
    const institutionName =
      type === "cash"
        ? customInstitution.trim() || "Cash"
        : selectedBank.id === "other"
          ? customInstitution.trim() || "Custom Bank"
          : selectedBank.shortName;

    if (!name.trim() || !institutionName) {
      return;
    }

    const isCardEligible = type !== "cash" && type !== "investment";

    addAccount({
      name: name.trim(),
      institution: institutionName,
      balance: isNaN(parsedBalance) ? 0 : parsedBalance,
      type,
      icon: getIconForType(type),
      cardCategory: isCardEligible ? cardCategory : undefined,
      cardNetwork: isCardEligible ? cardNetwork : undefined,
      bankCode: isCardEligible ? selectedBank.code : undefined,
    });

    router.back();
  };

  const currencySymbol = currency?.symbol || "₱";

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
              Add New Account
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live Card Preview */}
          <View className="mx-5 mt-4 mb-2">
            <View
              className="p-5 rounded-[26px] border border-white/15 shadow-xl relative overflow-hidden"
              style={{
                backgroundColor:
                  type === "cash"
                    ? "#1E293B"
                    : type === "investment"
                      ? "#0F3A2E"
                      : selectedBank.id === "other"
                        ? "#161B26"
                        : selectedBank.color,
              }}
            >
              {/* Decorative Ambient Orb */}
              <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

              {/* Card Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-xl bg-white/20 items-center justify-center">
                    <MaterialIcons name={getIconForType(type)} size={18} color="#FFFFFF" />
                  </View>
                  <Text
                    className="text-sm font-extrabold text-white tracking-wide"
                    numberOfLines={1}
                  >
                    {currentInstitution.toUpperCase()}
                  </Text>
                </View>

                {/* Card Network Brand Badge or Account Type Badge */}
                {type !== "cash" && type !== "investment" ? (
                  <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                    {cardNetwork === "mastercard" ? (
                      <View className="flex-row items-center">
                        <View className="w-3.5 h-3.5 rounded-full bg-[#EB001B] -mr-1.5" />
                        <View className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]" />
                      </View>
                    ) : (
                      <Text className="text-[11px] font-black text-[#B2C5FF] tracking-wider">
                        VISA
                      </Text>
                    )}
                    <Text className="text-[9px] font-extrabold text-white/90 uppercase ml-1">
                      {cardCategory}
                    </Text>
                  </View>
                ) : (
                  <View className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                    <Text className="text-[9px] font-extrabold text-white/90 uppercase">
                      {type}
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Number & Balance */}
              <View className="my-2">
                <Text className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
                  Current Balance
                </Text>
                <Text className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {currencySymbol}
                  {balance ? parseFloat(balance || "0").toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) : "0.00"}
                </Text>
              </View>

              {/* Card Footer */}
              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-white/15">
                <View className="flex-1 mr-2">
                  <Text className="text-[8px] font-bold text-white/60 uppercase tracking-wider">
                    Account Name
                  </Text>
                  <Text
                    className="text-xs font-bold text-white tracking-wide"
                    numberOfLines={1}
                  >
                    {name || "Account Name"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[8px] font-bold text-white/60 uppercase tracking-wider">
                    Type
                  </Text>
                  <Text className="text-xs font-bold text-white/90 uppercase">
                    {type}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Balance Hero Input */}
          <View className="mx-5 mt-4 mb-5 p-5 rounded-[24px] bg-surface-container border border-outline-variant/30 items-center">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Starting Balance
            </Text>

            <View className="flex-row items-center justify-center w-full my-1">
              <Text className="text-3xl font-extrabold text-on-surface-variant mr-1.5">
                {currencySymbol}
              </Text>
              <TextInput
                className="text-4xl font-extrabold text-on-surface text-center min-w-[120px] p-0"
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#C3C6D650"
                value={balance}
                onChangeText={setBalance}
              />
            </View>
          </View>

          {/* Section: Bank Selection */}
          <View className="px-5 mb-5">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Bank / Institution (Philippines)
            </Text>

            <ScaleButton
              activeScale={0.97}
              className="bg-surface-container rounded-2xl p-4 flex-row items-center justify-between border border-outline-variant/30 shadow-sm"
              onPress={() => setBankPickerVisible(true)}
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: `${selectedBank.color}25`,
                    borderWidth: 1,
                    borderColor: `${selectedBank.color}50`,
                  }}
                >
                  <Text
                    className="text-xs font-extrabold"
                    style={{ color: selectedBank.color }}
                  >
                    {selectedBank.code.slice(0, 4)}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-bold text-on-surface">
                      {selectedBank.shortName}
                    </Text>
                    <View className="bg-surface-container-highest px-1.5 py-0.5 rounded">
                      <Text className="text-[9px] font-semibold text-primary uppercase">
                        {selectedBank.category}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-xs text-on-surface-variant font-medium mt-0.5"
                    numberOfLines={1}
                  >
                    {selectedBank.name}
                  </Text>
                </View>
              </View>

              <View className="w-8 h-8 rounded-full bg-surface-container-highest items-center justify-center">
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#C3C6D6" />
              </View>
            </ScaleButton>

            {/* Custom Institution Input if 'Other' selected */}
            {selectedBank.id === "other" && (
              <View className="mt-3 bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
                <MaterialIcons name="edit" size={20} color="#C3C6D6" />
                <TextInput
                  className="flex-1 text-on-surface text-sm p-3 h-12"
                  placeholder="Enter Bank or Institution Name"
                  placeholderTextColor="#C3C6D680"
                  value={customInstitution}
                  onChangeText={setCustomInstitution}
                />
              </View>
            )}
          </View>

          {/* Section: Card Category Toggle (Credit vs Debit) */}
          {type !== "cash" && type !== "investment" && (
            <View className="px-5 mb-5">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Card Type (Debit or Credit)
              </Text>

              <SegmentedControl<CardCategory>
                options={[
                  {
                    value: "debit",
                    label: "Debit Card",
                    icon: (
                      <MaterialIcons
                        name="account-balance-wallet"
                        size={18}
                        color={cardCategory === "debit" ? "#002C72" : "#94A3B8"}
                      />
                    ),
                  },
                  {
                    value: "credit",
                    label: "Credit Card",
                    icon: (
                      <MaterialIcons
                        name="credit-card"
                        size={18}
                        color={cardCategory === "credit" ? "#002C72" : "#94A3B8"}
                      />
                    ),
                  },
                ]}
                selectedValue={cardCategory}
                onChange={handleCardCategoryChange}
                activePillColor="#B2C5FF"
                activeTextColor="#002C72"
              />
            </View>
          )}

          {/* Section: Card Network Toggle (Mastercard vs Visa) */}
          {type !== "cash" && type !== "investment" && (
            <View className="px-5 mb-5">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Card Network (Mastercard or Visa)
              </Text>

              <SegmentedControl<CardNetwork>
                options={[
                  {
                    value: "visa",
                    label: "Visa Card",
                    icon: (
                      <MaterialIcons
                        name="credit-card"
                        size={18}
                        color={cardNetwork === "visa" ? "#002C72" : "#94A3B8"}
                      />
                    ),
                  },
                  {
                    value: "mastercard",
                    label: "Mastercard",
                    icon: (
                      <View className="flex-row items-center -mr-1">
                        <View className="w-3 h-3 rounded-full bg-[#EB001B] -mr-1" />
                        <View className="w-3 h-3 rounded-full bg-[#F79E1B]" />
                      </View>
                    ),
                  },
                ]}
                selectedValue={cardNetwork}
                onChange={setCardNetwork}
                activePillColor="#B2C5FF"
                activeTextColor="#002C72"
              />
            </View>
          )}

          {/* Section: Account Name Input */}
          <View className="px-5 mb-5">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Account Label / Nickname
            </Text>
            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="label" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Account Name (e.g. BPI Main Checking)"
                placeholderTextColor="#C3C6D680"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Account Classification Type */}
          <View className="px-5 mb-8">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Account Category
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {accountTypes.map((accType) => {
                const isSelected = type === accType.value;
                return (
                  <ScaleButton
                    key={accType.value}
                    activeScale={0.92}
                    onPress={() => handleTypeChange(accType.value)}
                    className={`flex-row items-center gap-2 px-3.5 py-2.5 rounded-2xl border ${isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-surface-container border-outline-variant/30"
                      }`}
                  >
                    <MaterialIcons
                      name={getIconForType(accType.value)}
                      size={18}
                      color={isSelected ? "#B2C5FF" : "#C3C6D6"}
                    />
                    <Text
                      className={`text-xs font-bold ${isSelected ? "text-primary" : "text-on-surface-variant"
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
          <View className="px-5 mb-8">
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

      {/* Bank Picker Modal */}
      <BankPickerModal
        visible={bankPickerVisible}
        selectedBankId={selectedBank.id}
        onSelectBank={handleSelectBank}
        onClose={() => setBankPickerVisible(false)}
      />
    </View>
  );
}
