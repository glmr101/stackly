import React from "react";
import { View, Text, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";

export default function AccountProfile() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const email = user?.email || "—";
  const displayName = user?.displayName || email.split("@")[0] || "User";
  const photoURL = user?.photoURL;

  const creationTime = user?.metadata?.creationTime;
  const memberSince = creationTime
    ? new Date(creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            Account & Profile
          </Text>
        </View>
      </View>

      <View className="px-5 py-5 flex-col gap-6">
        {/* Profile photo + name hero */}
        <View className="p-5 bg-surface-container rounded-[28px] border border-white/10 shadow-lg items-center relative overflow-hidden">
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              className="w-20 h-20 rounded-3xl border-2 border-primary/40"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-3xl bg-primary/20 border-2 border-primary/40 items-center justify-center">
              <Text className="text-2xl font-extrabold text-primary">
                {initials}
              </Text>
            </View>
          )}

          <Text className="text-lg font-bold text-on-surface mt-3">
            {displayName}
          </Text>
          <Text className="text-xs text-on-surface-variant font-medium mt-1">
            {email}
          </Text>
        </View>

        {/* Details card */}
        <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
          {/* Email row */}
          <View className="flex-row items-center justify-between p-4 border-b border-outline-variant/20">
            <View className="flex-row items-center gap-3.5">
              <View className="w-10 h-10 rounded-xl bg-[#B2C5FF20] items-center justify-center">
                <MaterialIcons name="email" size={20} color="#B2C5FF" />
              </View>
              <View>
                <Text className="text-xs text-on-surface-variant font-medium">
                  Email Address
                </Text>
                <Text className="text-sm font-bold text-on-surface mt-0.5">
                  {email}
                </Text>
              </View>
            </View>
          </View>

          {/* Display Name row */}
          <View className="flex-row items-center justify-between p-4 border-b border-outline-variant/20">
            <View className="flex-row items-center gap-3.5">
              <View className="w-10 h-10 rounded-xl bg-[#4DE08220] items-center justify-center">
                <MaterialIcons name="person" size={20} color="#4DE082" />
              </View>
              <View>
                <Text className="text-xs text-on-surface-variant font-medium">
                  Display Name
                </Text>
                <Text className="text-sm font-bold text-on-surface mt-0.5">
                  {displayName}
                </Text>
              </View>
            </View>
          </View>

          {/* Member Since row */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3.5">
              <View className="w-10 h-10 rounded-xl bg-[#FBBF2420] items-center justify-center">
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#FBBF24"
                />
              </View>
              <View>
                <Text className="text-xs text-on-surface-variant font-medium">
                  Member Since
                </Text>
                <Text className="text-sm font-bold text-on-surface mt-0.5">
                  {memberSince}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Read-only note */}
        <View className="px-1">
          <Text className="text-xs text-outline leading-relaxed">
            Profile information is managed through your Firebase account. To
            update your email or display name, visit your account provider
            settings.
          </Text>
        </View>
      </View>
    </View>
  );
}
