import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { Account } from "@/types";

export default function Accounts() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((state) => state.accounts);
  const addAccount = useAppStore((state) => state.addAccount);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  
  // Add Account Form State
  const [newAccountName, setNewAccountName] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Bank");
  const [newBalance, setNewBalance] = useState("");

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiquid = accounts
    .filter(acc => acc.type === 'checking' || acc.type === 'savings' || acc.type === 'cash')
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalCredit = accounts
    .filter(acc => acc.type === 'credit')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSaveAccount = () => {
    // Map the UI selected type to the Account model's type enum
    let type: Account['type'] = 'checking';
    if (selectedType === 'Bank') type = 'checking';
    if (selectedType === 'E-Wallet') type = 'checking'; // Can customize further
    if (selectedType === 'Cash') type = 'cash';
    if (selectedType === 'Credit Card') type = 'credit';
    if (selectedType === 'Investment') type = 'investment';

    // Simple default icons based on type
    let icon = 'account-balance';
    if (type === 'cash') icon = 'payments';
    if (type === 'credit') icon = 'credit-card';
    if (type === 'investment') icon = 'trending-up';

    addAccount({
      name: newAccountName || 'New Account',
      institution: newInstitution || 'Institution',
      type,
      balance: parseFloat(newBalance) || 0,
      icon,
    });

    // Reset and close
    setNewAccountName("");
    setNewInstitution("");
    setNewBalance("");
    setIsSheetVisible(false);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-container-padding flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
            Accounts
          </Text>
        </View>
        <Link href="/settings" asChild>
          <Pressable className="w-8 h-8 flex items-center justify-center transition-colors">
            <MaterialIcons name="settings" size={24} color="#dfe2f1" />
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Total Balance Summary */}
        <View className="px-container-padding py-section-gap">
          <Text className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
            Total Net Worth
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="font-numeral-xl text-display text-on-surface">
              ${Math.floor(totalNetWorth).toLocaleString("en-US")}
            </Text>
            <Text className="font-label-md text-label-md text-secondary">
              {(totalNetWorth % 1).toFixed(2).substring(1)}
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-grid-gutter mt-6">
            <View className="flex-1 bg-surface-container-low rounded-xl p-card-inner-padding overflow-hidden">
              <View className="flex-row items-center gap-2 mb-1">
                <MaterialIcons name="account-balance" size={14} color="#b2c5ff" />
                <Text className="font-label-md text-label-md text-on-surface-variant">
                  Liquid Cash
                </Text>
              </View>
              <Text className="font-headline-md text-headline-md text-on-surface">
                ${totalLiquid.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View className="flex-1 bg-surface-container-low rounded-xl p-card-inner-padding overflow-hidden">
              <View className="flex-row items-center gap-2 mb-1">
                <MaterialIcons name="credit-card" size={14} color="#ffb4ab" />
                <Text className="font-label-md text-label-md text-on-surface-variant">
                  Credit
                </Text>
              </View>
              <Text className="font-headline-md text-headline-md text-on-surface">
                ${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Account List */}
        <View className="px-container-padding flex-col gap-stack-gap">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-headline-md text-headline-md text-on-surface">
              Your Accounts
            </Text>
            <Pressable
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              onPress={() => setIsSheetVisible(true)}
            >
              <MaterialIcons name="add" size={18} color="#b2c5ff" />
            </Pressable>
          </View>

          {accounts.map((account) => {
            const isExpanded = expandedId === account.id;
            const isPrimary = account.type === "savings" || account.type === "checking";

            return (
              <View key={account.id} className="flex-col mb-4">
                <Pressable
                  className="w-full bg-surface-container rounded-2xl p-card-inner-padding flex-row items-center justify-between active:scale-[0.98] z-10"
                  onPress={() => toggleDetails(account.id)}
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                      <MaterialIcons
                        name={account.icon as any}
                        size={24}
                        color={isPrimary ? "#b2c5ff" : "#4de082"}
                      />
                    </View>
                    <View>
                      <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                        {account.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="font-label-md text-label-md text-on-surface-variant">
                          {account.institution}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-surface-variant" />
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            isPrimary ? "bg-primary/10" : "bg-secondary/10"
                          }`}
                        >
                          <Text
                            className={`font-label-md text-label-md ${
                              isPrimary ? "text-primary" : "text-secondary"
                            }`}
                          >
                            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-headline-md text-headline-md text-on-surface">
                      ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Text>
                    <MaterialIcons
                      name={isExpanded ? "expand-less" : "chevron-right"}
                      size={20}
                      color="#c3c6d6"
                    />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View className="px-4 py-2 bg-surface-container-low rounded-b-xl -mt-4 pt-6 text-sm">
                    <Text className="text-on-surface-variant text-sm">
                      Last synced: Today, 09:41 AM
                    </Text>
                    <View className="flex-row gap-2 mt-2 pb-2">
                      <Pressable className="px-3 py-1 bg-surface-variant rounded-full">
                        <Text className="text-on-surface text-xs">History</Text>
                      </Pressable>
                      <Pressable className="px-3 py-1 bg-surface-variant rounded-full">
                        <Text className="text-on-surface text-xs">Transfer</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Account Bottom Sheet */}
      <Modal
        visible={isSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSheetVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-background/80">
          <Pressable
            className="flex-1"
            onPress={() => setIsSheetVisible(false)}
          />
          <View
            className="bg-surface-container-high rounded-t-[24px] pb-safe"
            style={{ paddingBottom: insets.bottom || 24, maxHeight: "85%" }}
          >
            <View className="p-container-padding">
              <View className="w-12 h-1.5 bg-surface-variant rounded-full mx-auto mb-6" />
              <Text className="font-headline-lg text-headline-lg text-on-surface mb-6">
                Add Account
              </Text>

              <View className="flex-col gap-5">
                <View>
                  <Text className="font-label-md text-label-md text-on-surface-variant mb-2">
                    Account Name
                  </Text>
                  <TextInput
                    className="w-full bg-surface-container-low text-on-surface font-body-lg p-4 rounded-xl"
                    placeholder="e.g. Vacation Savings"
                    placeholderTextColor="#c3c6d680"
                    value={newAccountName}
                    onChangeText={setNewAccountName}
                  />
                </View>

                <View>
                  <Text className="font-label-md text-label-md text-on-surface-variant mb-2">
                    Institution
                  </Text>
                  <TextInput
                    className="w-full bg-surface-container-low text-on-surface font-body-lg p-4 rounded-xl"
                    placeholder="e.g. Chase, PayPal"
                    placeholderTextColor="#c3c6d680"
                    value={newInstitution}
                    onChangeText={setNewInstitution}
                  />
                </View>

                <View>
                  <Text className="font-label-md text-label-md text-on-surface-variant mb-2">
                    Type
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {["Bank", "E-Wallet", "Cash", "Credit Card", "Investment"].map(
                      (type) => {
                        const isSelected = selectedType === type;
                        return (
                          <Pressable
                            key={type}
                            className={`px-4 py-2 rounded-full ${
                              isSelected
                                ? "bg-primary/20"
                                : "bg-surface-container-low"
                            }`}
                            onPress={() => setSelectedType(type)}
                          >
                            <Text
                              className={`font-label-md ${
                                isSelected
                                  ? "text-primary"
                                  : "text-on-surface-variant"
                              }`}
                            >
                              {type}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                </View>

                <View>
                  <Text className="font-label-md text-label-md text-on-surface-variant mb-2">
                    Starting Balance
                  </Text>
                  <View className="relative flex-row items-center bg-surface-container-low rounded-xl pl-4 pr-4">
                    <Text className="font-body-lg text-on-surface-variant">
                      $
                    </Text>
                    <TextInput
                      className="flex-1 text-on-surface font-body-lg p-4"
                      placeholder="0.00"
                      placeholderTextColor="#c3c6d680"
                      keyboardType="decimal-pad"
                      value={newBalance}
                      onChangeText={setNewBalance}
                    />
                  </View>
                </View>

                <Pressable
                  className="w-full bg-primary py-4 rounded-xl mt-4 items-center justify-center active:bg-primary-container"
                  onPress={handleSaveAccount}
                >
                  <Text className="text-on-primary font-headline-md text-headline-md">
                    Save Account
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
