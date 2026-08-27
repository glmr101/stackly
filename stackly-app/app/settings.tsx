import React from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName } from "@/types";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedBox } from "@/components/ui/AnimatedBox";
import { GrabHandle } from "@/components/ui/GrabHandle";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: MaterialIconName;
  color?: string;
  badge?: string;
}

export default function Settings() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const accounts = useAppStore((state) => state.accounts);
  const transactions = useAppStore((state) => state.transactions);

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
    },
    {
      id: "currency",
      title: "Currency & Region",
      subtitle: "USD ($) • United States",
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
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />
      {/* Header */}
      <AnimatedBox delay={0} className="h-16 px-4 flex-row items-center justify-between border-b border-outline-variant/20">
        <View className="flex-row items-center gap-3">
          <ScaleButton
            activeScale={0.88}
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={22} color="#DFE2F1" />
          </ScaleButton>
          <Text className="text-lg font-bold text-on-surface tracking-tight">
            Settings & Profile
          </Text>
        </View>
      </AnimatedBox>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-5 py-5 flex-col gap-6">
          {/* User Profile Hero Card */}
          <AnimatedBox
            delay={60}
            className="p-5 bg-surface-container rounded-[28px] border border-white/10 shadow-lg relative overflow-hidden"
          >
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
          </AnimatedBox>

          {/* General Settings Group */}
          <AnimatedBox delay={120}>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5 px-1">
              General Preferences
            </Text>
            <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
              {generalSettings.map((item, index) => (
                <ScaleButton
                  key={item.id}
                  activeScale={0.98}
                  className={`flex-row items-center justify-between p-4 ${
                    index !== generalSettings.length - 1
                      ? "border-b border-outline-variant/20"
                      : ""
                  }`}
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
                      <Text className="text-sm font-bold text-on-surface">
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#8D909F"
                  />
                </ScaleButton>
              ))}
            </View>
          </AnimatedBox>

          {/* Security Group */}
          <AnimatedBox delay={180}>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5 px-1">
              Security & Data
            </Text>
            <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
              {securitySettings.map((item, index) => (
                <ScaleButton
                  key={item.id}
                  activeScale={0.98}
                  className={`flex-row items-center justify-between p-4 ${
                    index !== securitySettings.length - 1
                      ? "border-b border-outline-variant/20"
                      : ""
                  }`}
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
                      <Text className="text-sm font-bold text-on-surface">
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#8D909F"
                  />
                </ScaleButton>
              ))}
            </View>
          </AnimatedBox>

          {/* Bank Sync Coming Soon Card */}
          <AnimatedBox
            delay={240}
            className="p-5 bg-surface-container-high rounded-[26px] border border-primary/20 relative overflow-hidden shadow-md"
          >
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
          </AnimatedBox>

          {/* Sign Out Button */}
          <AnimatedBox delay={300} className="pt-2 pb-6 flex-col items-center gap-3">
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
          </AnimatedBox>
        </View>
      </ScrollView>
    </View>
  );
}
