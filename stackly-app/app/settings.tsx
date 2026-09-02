import React, { useState } from "react";
import { View, Text, ScrollView, Image, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName, AppDataSnapshot } from "@/types";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";
import { UndoToast } from "@/components/ui/UndoToast";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: MaterialIconName;
  color?: string;
  badge?: string;
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const accounts = useAppStore((state) => state.accounts);
  const transactions = useAppStore((state) => state.transactions);
  const subscriptions = useAppStore((state) => state.subscriptions);
  const categories = useAppStore((state) => state.categories);
  const budgetGoals = useAppStore((state) => state.budgetGoals);
  const savingsGoals = useAppStore((state) => state.savingsGoals);

  const currency = useAppStore((state) => state.currency);
  const region = useAppStore((state) => state.region);

  const reset = useAppStore((state) => state.reset);
  const resetToDemo = useAppStore((state) => state.resetToDemo);
  const restoreSnapshot = useAppStore((state) => state.restoreSnapshot);

  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    message: string;
    snapshot: AppDataSnapshot | null;
  }>({
    visible: false,
    message: "",
    snapshot: null,
  });

  const email = user?.email || "alex.rivera@example.com";
  const displayName = user?.displayName || email.split("@")[0] || "Alex Rivera";

  const generalSettings: SettingItem[] = [
    {
      id: "profile",
      title: "Account & Profile",
      subtitle: "Personal information, email",
      icon: "person",
      color: "#B2C5FF",
    },
    {
      id: "notifications",
      title: "Bill Reminders",
      subtitle: "Push alerts for upcoming bills",
      icon: "notifications",
      color: "#4DE082",
      badge: "Coming Soon",
    },
    {
      id: "currency",
      title: "Currency & Region",
      subtitle: `${currency?.code || "USD"} (${currency?.symbol || "$"}) • ${region?.name || "United States"}`,
      icon: "attach-money",
      color: "#FBBF24",
    },
  ];

  const securitySettings: SettingItem[] = [
    {
      id: "security",
      title: "Security & Biometrics",
      subtitle: "Face ID / PIN code protection",
      icon: "fingerprint",
      color: "#C084FC",
    },
    {
      id: "backup",
      title: "Data Backup & Export",
      subtitle: "CSV export, cloud backup",
      icon: "cloud-download",
      color: "#38BDF8",
      badge: "Coming Soon",
    },
    {
      id: "reset",
      title: "Reset App Data",
      subtitle: "Wipe all records or restore demo data",
      icon: "restart-alt",
      color: "#FFB4AB",
    },
  ];

  const handleResetPress = () => {
    Alert.alert(
      "Reset App Data",
      "Choose whether to wipe all financial records clean or restore sample demo data. You will have 5 seconds to undo this action.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore Demo",
          onPress: () => {
            const snapshot: AppDataSnapshot = {
              accounts: [...accounts],
              transactions: [...transactions],
              subscriptions: [...subscriptions],
              categories: [...categories],
              budgetGoals: [...budgetGoals],
              savingsGoals: [...savingsGoals],
            };
            resetToDemo();
            setUndoToast({
              visible: true,
              message: "Demo sample data restored",
              snapshot,
            });
          },
        },
        {
          text: "Wipe All Data",
          style: "destructive",
          onPress: () => {
            const snapshot: AppDataSnapshot = {
              accounts: [...accounts],
              transactions: [...transactions],
              subscriptions: [...subscriptions],
              categories: [...categories],
              budgetGoals: [...budgetGoals],
              savingsGoals: [...savingsGoals],
            };
            reset();
            setUndoToast({
              visible: true,
              message: "All financial data wiped",
              snapshot,
            });
          },
        },
      ]
    );
  };

  const handleUndo = () => {
    if (undoToast.snapshot) {
      restoreSnapshot(undoToast.snapshot);
    }
    setUndoToast((prev) => ({ ...prev, visible: false, snapshot: null }));
  };

  const handleDismissUndo = () => {
    setUndoToast((prev) => ({ ...prev, visible: false, snapshot: null }));
  };

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />
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
            Settings & Profile
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-5 py-5 flex-col gap-6">
          {/* User Profile Hero Card */}
          <View className="p-5 bg-surface-container rounded-[28px] border border-white/10 shadow-lg relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <View className="flex-row items-center gap-4">
              <View className="relative">
                <Image
                  source={{
                    uri:
                      user?.photoURL ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2TjDqjInr7Pcb8Q14CybXC2MROHmVU5UK95XWNiyfl8s4qHBLmvEzPHsvh4Jlc8g25maviIP_TyXJx-8RoV4QOBoWlu1F3LFsXmhwJhb8yhcx1unQW3IS8jgM4VUBVBEibKU7lEeswVpMHgc9uuD17BxSyrltHUekEe5UZP-Z5S7wyu7Y9mA9qgmZGiSIw5tcgNTorr9--xfMxD6pdiSmT3XR6mbjnivR1qnDsrAP5HtBieItY30jJA",
                  }}
                  className="w-16 h-16 rounded-2xl border-2 border-primary/40"
                  resizeMode="cover"
                />
                <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary items-center justify-center border-2 border-surface-container">
                  <MaterialIcons name="check" size={12} color="#003915" />
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="text-lg font-bold text-on-surface"
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <View className="bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                    <Text className="text-[10px] font-bold text-primary">
                      PRO
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-xs text-on-surface-variant font-medium mt-0.5"
                  numberOfLines={1}
                >
                  {email}
                </Text>
              </View>
            </View>

            {/* User Stats Mini Strip */}
            <View className="flex-row gap-2 mt-5 pt-4 border-t border-white/5">
              <View className="flex-1 bg-surface-container-low rounded-xl p-2.5 items-center">
                <Text className="text-[11px] text-on-surface-variant font-medium">
                  Accounts
                </Text>
                <Text className="text-sm font-bold text-on-surface mt-0.5">
                  {accounts.length}
                </Text>
              </View>
              <View className="flex-1 bg-surface-container-low rounded-xl p-2.5 items-center">
                <Text className="text-[11px] text-on-surface-variant font-medium">
                  Transactions
                </Text>
                <Text className="text-sm font-bold text-on-surface mt-0.5">
                  {transactions.length}
                </Text>
              </View>
              <View className="flex-1 bg-surface-container-low rounded-xl p-2.5 items-center">
                <Text className="text-[11px] text-on-surface-variant font-medium">
                  Status
                </Text>
                <Text className="text-sm font-bold text-secondary mt-0.5">
                  Synced
                </Text>
              </View>
            </View>
          </View>

          {/* Stackly Pro Subscription Banner */}
          <ScaleButton
            activeScale={0.97}
            onPress={() => router.push("/subscription" as any)}
            className="p-4 rounded-[24px] bg-[#161B2E] border border-primary/30 shadow-md relative overflow-hidden"
          >
            <View className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/20 blur-xl pointer-events-none" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                <View className="w-11 h-11 rounded-2xl bg-primary/20 items-center justify-center border border-primary/30">
                  <MaterialIcons name="star" size={24} color="#B2C5FF" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-extrabold text-white">
                      Stackly Pro
                    </Text>
                    <View className="bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                      <Text className="text-[9px] font-black text-primary uppercase">
                        Upgrade
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-on-surface-variant mt-0.5" numberOfLines={1}>
                    Unlimited cards, accounts & AI forecasts
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#B2C5FF" />
            </View>
          </ScaleButton>

          {/* General Settings Group */}
          <View>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5 px-1">
              General Preferences
            </Text>
            <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
              {generalSettings.map((item, index) => {
                const isDisabled = !!item.badge;
                return (
                  <ScaleButton
                    key={item.id}
                    activeScale={isDisabled ? 1 : 0.98}
                    disabled={isDisabled}
                    onPress={() => {
                      if (item.id === "currency") {
                        router.push("/currency-region" as any);
                      } else if (item.id === "profile") {
                        router.push("/account-profile" as any);
                      }
                    }}
                    className={`flex-row items-center justify-between p-4 ${
                      index !== generalSettings.length - 1
                        ? "border-b border-outline-variant/20"
                        : ""
                    }`}
                    style={{ opacity: isDisabled ? 0.5 : 1 }}
                  >
                    <View className="flex-row items-center gap-3.5">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${item.color || "#B2C5FF"}20` }}
                      >
                        <MaterialIcons
                          name={item.icon}
                          size={20}
                          color={item.color || "#B2C5FF"}
                        />
                      </View>
                      <View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-bold text-on-surface">
                            {item.title}
                          </Text>
                          {item.badge && (
                            <View className="bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                              <Text className="text-[9px] font-bold text-primary uppercase">
                                {item.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        {item.subtitle && (
                          <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!isDisabled && (
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color="#8D909F"
                      />
                    )}
                  </ScaleButton>
                );
              })}
            </View>
          </View>

          {/* Security Group */}
          <View>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5 px-1">
              Security & Data
            </Text>
            <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
              {securitySettings.map((item, index) => {
                const isDisabled = !!item.badge;
                return (
                  <ScaleButton
                    key={item.id}
                    activeScale={isDisabled ? 1 : 0.98}
                    disabled={isDisabled}
                    onPress={() => {
                      if (item.id === "reset") {
                        handleResetPress();
                      } else if (item.id === "security") {
                        router.push("/security-biometrics" as any);
                      }
                    }}
                    className={`flex-row items-center justify-between p-4 ${
                      index !== securitySettings.length - 1
                        ? "border-b border-outline-variant/20"
                        : ""
                    }`}
                    style={{ opacity: isDisabled ? 0.5 : 1 }}
                  >
                    <View className="flex-row items-center gap-3.5">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${item.color || "#B2C5FF"}20` }}
                      >
                        <MaterialIcons
                          name={item.icon}
                          size={20}
                          color={item.color || "#B2C5FF"}
                        />
                      </View>
                      <View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-bold text-on-surface">
                            {item.title}
                          </Text>
                          {item.badge && (
                            <View className="bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                              <Text className="text-[9px] font-bold text-primary uppercase">
                                {item.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        {item.subtitle && (
                          <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!isDisabled && (
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color="#8D909F"
                      />
                    )}
                  </ScaleButton>
                );
              })}
            </View>
          </View>

          {/* Bank Sync Coming Soon Card */}
          <View className="p-5 bg-surface-container-high rounded-[26px] border border-primary/20 relative overflow-hidden shadow-md">
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-primary/20 items-center justify-center">
                  <MaterialIcons
                    name="account-balance"
                    size={18}
                    color="#B2C5FF"
                  />
                </View>
                <Text className="text-sm font-bold text-on-surface">
                  Plaid & Bank Sync
                </Text>
              </View>
              <View className="bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                <Text className="text-[10px] font-bold text-primary uppercase">
                  Coming Soon
                </Text>
              </View>
            </View>

            <Text className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Automatic bank institution synchronization and live transaction
              feeds are currently in private beta.
            </Text>

            <ScaleButton
              activeScale={0.96}
              className="w-full py-3 px-4 bg-surface-container rounded-xl flex-row items-center justify-center gap-2 border border-outline-variant/30 opacity-80"
              disabled
            >
              <MaterialIcons name="lock" size={16} color="#C3C6D6" />
              <Text className="text-xs font-bold text-on-surface-variant">
                Join Sync Waitlist
              </Text>
            </ScaleButton>
          </View>

          {/* Sign Out Button */}
          <View className="pt-2 pb-6 flex-col items-center gap-3">
            <ScaleButton
              activeScale={0.95}
              className="w-full py-4 px-4 bg-error-container/40 rounded-2xl flex-row items-center justify-center gap-2 border border-error/30 shadow-sm"
              onPress={() => {
                signOut(auth).catch(console.error);
              }}
            >
              <MaterialIcons name="logout" size={18} color="#FFB4AB" />
              <Text className="text-sm font-bold text-error">
                Sign Out of Stackly
              </Text>
            </ScaleButton>

            <Text className="text-[11px] font-medium text-outline">
              Stackly v1.0.0 • All data encrypted locally
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 5-Second Undo Toast */}
      <UndoToast
        visible={undoToast.visible}
        message={undoToast.message}
        duration={5000}
        bottomOffset={Math.max(insets.bottom, 24)}
        onUndo={handleUndo}
        onDismiss={handleDismissUndo}
      />
    </View>
  );
}
