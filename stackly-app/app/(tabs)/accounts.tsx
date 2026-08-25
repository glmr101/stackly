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



  const formattedNetWorth = Math.abs(totalNetWorth).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, decimal] = formattedNetWorth.split(".");

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
              {totalNetWorth < 0 ? `-$${whole}` : `$${whole}`}
            </Text>
            <Text className="font-label-md text-label-md text-secondary">
              .{decimal}
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
                        name={account.icon}
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

    </View>
  );
}
