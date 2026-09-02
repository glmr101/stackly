import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { Account } from "@/types";
import { Card3DViewerModal, CardLayoutRect } from "@/components/ui/Card3DViewerModal";
import { CardItem } from "@/components/ui/StackedCardCarousel";
import { findPhilippineBank } from "@/data/philippineBanks";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export default function Accounts() {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((state) => state.accounts);
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || "$";

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedViewerCard, setSelectedViewerCard] = useState<CardItem | null>(null);
  const [selectedViewerLayout] = useState<CardLayoutRect | null>(null);

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiquid = accounts
    .filter(
      (acc) =>
        acc.type === "bank" || acc.type === "e-wallet" || acc.type === "cash"
    )
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalCredit = accounts
    .filter((acc) => acc.type === "credit card")
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvestments = accounts
    .filter((acc) => acc.type === "investment")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const mapAccountToCardItem = (acc: Account): CardItem => {
    const phBank = findPhilippineBank(acc.bankCode || acc.institution || acc.name);
    const institution = acc.institution || phBank?.shortName || acc.name;
    const isCard = acc.type !== "cash" && acc.type !== "investment";
    const cardNetwork = isCard ? (acc.cardNetwork || (acc.type === "credit card" ? "visa" : "mastercard")) : undefined;
    const cardCategory = isCard ? (acc.cardCategory || (acc.type === "credit card" ? "credit" : "debit")) : undefined;

    return {
      id: acc.id,
      bankName: acc.name,
      institution: institution,
      accountName: acc.name,
      cardType: (cardNetwork as any) || "generic",
      cardNetwork: cardNetwork,
      cardCategory: cardCategory,
      accountType: acc.type,
      cardNumber: isCard ? `•••• ${acc.id.replace(/\D/g, "").slice(-4) || "8421"}` : undefined,
      cardHolder: institution.toUpperCase(),
      expiryDate: isCard ? "12/28" : undefined,
      balance: acc.balance,
      backgroundColor: phBank?.color || (acc.type === "cash" ? "#152E22" : acc.type === "investment" ? "#065F46" : "#1E293B"),
      textColor: "#FFFFFF",
      icon: acc.icon,
      bankCode: acc.bankCode || phBank?.code,
    };
  };

  const filteredAccounts =
    selectedFilter === "all"
      ? accounts
      : accounts.filter((a) => a.type === selectedFilter);

  const filters = [
    { label: "All", value: "all" },
    { label: "Bank", value: "bank" },
    { label: "E-Wallet", value: "e-wallet" },
    { label: "Cash", value: "cash" },
    { label: "Cards", value: "credit card" },
    { label: "Investments", value: "investment" },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <AnimatedBox delay={0} className="h-16 px-5 flex-row items-center justify-between z-50">
        <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
          Accounts & Assets
        </Text>
      </AnimatedBox>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Total Net Worth Hero Card */}
        <AnimatedBox
          delay={30}
          className="mx-5 mt-3 mb-6 p-6 rounded-[28px] bg-surface-container border border-white/10 shadow-xl overflow-hidden relative"
        >
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Total Net Worth
          </Text>

          <View className="my-1">
            <AnimatedCounter
              value={totalNetWorth}
              prefix={currencySymbol}
              decimals={2}
              showDecimalsSmall={true}
              className="text-4xl font-extrabold text-on-surface tracking-tight"
              decimalClassName="text-2xl font-bold text-secondary ml-1"
            />
          </View>

          {/* Asset Breakdown Grid */}
          <View className="flex-row gap-2.5 mt-5 pt-4 border-t border-white/5">
            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="account-balance" size={14} color="#B2C5FF" />
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Liquid
                </Text>
              </View>
              <AnimatedCounter
                value={totalLiquid}
                prefix={currencySymbol}
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>

            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="credit-card" size={14} color="#FFB4AB" />
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Debt/Credit
                </Text>
              </View>
              <AnimatedCounter
                value={totalCredit}
                prefix={currencySymbol}
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>

            <View className="flex-1 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/20">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="trending-up" size={14} color="#4DE082" />
                <Text className="text-[11px] font-medium text-on-surface-variant">
                  Invest
                </Text>
              </View>
              <AnimatedCounter
                value={totalInvestments}
                prefix={currencySymbol}
                decimals={0}
                className="text-sm font-bold text-on-surface"
              />
            </View>
          </View>
        </AnimatedBox>

        {/* Filter Chips */}
        <AnimatedBox delay={60} className="mx-5 mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.map((f) => {
              const isSelected = selectedFilter === f.value;
              return (
                <ScaleButton
                  key={f.value}
                  activeScale={0.92}
                  onPress={() => setSelectedFilter(f.value)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-surface-container border-outline-variant/30"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {f.label}
                  </Text>
                </ScaleButton>
              );
            })}
          </ScrollView>
        </AnimatedBox>

        {/* Accounts List */}
        <AnimatedBox delay={90} className="px-5 mb-8 flex-col gap-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-on-surface tracking-tight">
              All Accounts ({filteredAccounts.length})
            </Text>
          </View>

          {filteredAccounts.map((account) => {
            const isExpanded = expandedId === account.id;
            const isPrimary =
              account.type === "bank" || account.type === "e-wallet";

            return (
              <View
                key={account.id}
                className="bg-surface-container rounded-[24px] border border-outline-variant/30 overflow-hidden shadow-sm"
              >
                <ScaleButton
                  activeScale={0.97}
                  className="p-4 flex-row items-center justify-between"
                  onPress={() => toggleDetails(account.id)}
                >
                  <View className="flex-row items-center gap-3.5">
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${
                        isPrimary ? "bg-primary/20" : "bg-secondary/20"
                      }`}
                    >
                      <MaterialIcons
                        name={account.icon as any}
                        size={24}
                        color={isPrimary ? "#B2C5FF" : "#4DE082"}
                      />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-on-surface">
                        {account.name}
                      </Text>
                      <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
                        <Text className="text-xs text-on-surface-variant font-medium">
                          {account.institution}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-outline-variant" />
                        <View className="bg-surface-container-highest px-2 py-0.5 rounded-md">
                          <Text className="text-[10px] font-semibold uppercase text-primary">
                            {account.type === "cash" || account.type === "investment"
                              ? account.type
                              : account.cardCategory
                              ? `${account.cardCategory}${account.cardNetwork ? ` • ${account.cardNetwork}` : ""}`
                              : account.type}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="items-end">
                    <AnimatedCounter
                      value={account.balance}
                      prefix={currencySymbol}
                      decimals={2}
                      className="text-base font-extrabold text-on-surface"
                    />
                    <MaterialIcons
                      name={isExpanded ? "expand-less" : "expand-more"}
                      size={20}
                      color="#C3C6D6"
                      style={{ marginTop: 2 }}
                    />
                  </View>
                </ScaleButton>

                {/* Collapsible Action Drawer */}
                {isExpanded && (
                  <View className="px-4 pb-4 pt-2 bg-surface-container-low/70 border-t border-outline-variant/20 flex-row gap-2.5">
                    <Link href={"/add-transaction" as any} asChild>
                      <ScaleButton
                        activeScale={0.92}
                        className="flex-1 py-2.5 rounded-xl bg-primary/15 border border-primary/25 items-center justify-center flex-row gap-1.5"
                      >
                        <MaterialIcons name="swap-horiz" size={16} color="#B2C5FF" />
                        <Text className="text-xs font-bold text-primary">
                          Transfer
                        </Text>
                      </ScaleButton>
                    </Link>
                    <ScaleButton
                      activeScale={0.92}
                      onPress={() => setSelectedViewerCard(mapAccountToCardItem(account))}
                      className="flex-1 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 items-center justify-center flex-row gap-1.5"
                    >
                      <MaterialIcons name="3d-rotation" size={16} color="#C084FC" />
                      <Text className="text-xs font-bold text-purple-300">
                        3D View
                      </Text>
                    </ScaleButton>
                    <Link href={"/transactions" as any} asChild>
                      <ScaleButton
                        activeScale={0.92}
                        className="flex-1 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/30 items-center justify-center flex-row gap-1.5"
                      >
                        <MaterialIcons name="history" size={16} color="#C3C6D6" />
                        <Text className="text-xs font-bold text-on-surface">
                          History
                        </Text>
                      </ScaleButton>
                    </Link>
                  </View>
                )}
              </View>
            );
          })}

          {filteredAccounts.length === 0 && (
            <View className="bg-surface-container rounded-[24px] border border-outline-variant/30 p-6 items-center justify-center">
              <MaterialIcons
                name="account-balance-wallet"
                size={36}
                color="#C3C6D6"
                style={{ opacity: 0.6 }}
              />
              <Text className="text-sm font-bold text-on-surface mt-2">
                No Accounts Found
              </Text>
              <Text className="text-xs text-on-surface-variant text-center mt-1 mb-4">
                {accounts.length === 0
                  ? "Get started by adding your first bank, e-wallet, cash, or credit card."
                  : "No accounts match the selected category filter."}
              </Text>
              {accounts.length === 0 && (
                <Link href={"/add-account" as any} asChild>
                  <ScaleButton
                    activeScale={0.92}
                    className="px-4 py-2.5 bg-primary rounded-xl flex-row items-center gap-1.5"
                  >
                    <MaterialIcons name="add" size={18} color="#002C72" />
                    <Text className="text-xs font-extrabold text-on-primary">
                      + Add First Account
                    </Text>
                  </ScaleButton>
                </Link>
              )}
            </View>
          )}
        </AnimatedBox>
      </ScrollView>

      {/* Interactive 3D Card Object Viewer Modal */}
      <Card3DViewerModal
        visible={!!selectedViewerCard}
        card={selectedViewerCard}
        sourceLayout={selectedViewerLayout}
        currencySymbol={currencySymbol}
        onClose={() => setSelectedViewerCard(null)}
      />
    </View>
  );
}
