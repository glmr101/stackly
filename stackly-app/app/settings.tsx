import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName } from "@/types";

interface SettingLink {
  title: string;
  icon: MaterialIconName;
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const reset = useAppStore((state) => state.reset);

  const email = user?.email || "alex.rivera@example.com";
  const displayName = user?.displayName || email.split("@")[0] || "Alex Rivera";

  const settingsLinks: SettingLink[] = [
    { title: "Account Info", icon: "person" },
    { title: "Preferences", icon: "tune" },
    { title: "Notifications", icon: "notifications" },
    { title: "Security & Privacy", icon: "security" },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-container-padding flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable
            className="flex items-center justify-center rounded-full p-2 active:bg-surface-container-high transition-colors -ml-2"
            onPress={() => router.back()}
          >
            <MaterialIcons name="chevron-left" size={28} color="#dfe2f1" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-container-padding py-6 flex-col gap-section-gap">
          {/* User Overview */}
          <View className="flex-row items-center gap-4 bg-surface-container rounded-xl p-card-inner-padding shadow-sm">
            <Image
              source={{
                uri: user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuA2TjDqjInr7Pcb8Q14CybXC2MROHmVU5UK95XWNiyfl8s4qHBLmvEzPHsvh4Jlc8g25maviIP_TyXJx-8RoV4QOBoWlu1F3LFsXmhwJhb8yhcx1unQW3IS8jgM4VUBVBEibKU7lEeswVpMHgc9uuD17BxSyrltHUekEe5UZP-Z5S7wyu7Y9mA9qgmZGiSIw5tcgNTorr9--xfMxD6pdiSmT3XR6mbjnivR1qnDsrAP5HtBieItY30jJA",
              }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
            <View className="flex-col flex-1">
              <Text className="text-headline-md font-headline-md text-on-surface" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="text-body-md font-body-md text-on-surface-variant" numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>

          {/* Main Navigation List */}
          <View className="flex-col bg-surface-container rounded-xl overflow-hidden shadow-sm">
            {settingsLinks.map((link, index) => (
              <Pressable
                key={link.title}
                className={`flex-row items-center justify-between p-4 bg-surface-container active:bg-surface-container-high ${
                  index !== settingsLinks.length - 1
                    ? "border-b border-surface-container-high"
                    : ""
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name={link.icon} size={24} color="#b2c5ff" />
                  <Text className="text-body-lg font-body-lg text-on-surface">
                    {link.title}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#c3c6d6" />
              </Pressable>
            ))}
          </View>

          {/* Bank Sync Coming Soon Card */}
          <View className="flex-col bg-surface-container-high rounded-xl p-card-inner-padding relative overflow-hidden shadow-md">
            {/* Decorative Background Element */}
            <View className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-[24px]" />
            <View className="flex-row items-center gap-3 mb-3 z-10">
              <View className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <MaterialIcons name="account-balance" size={20} color="#002665" />
              </View>
              <Text className="text-headline-md font-headline-md text-on-surface">
                Bank Sync
              </Text>
            </View>
            <Text className="text-body-md font-body-md text-on-surface-variant mb-5 z-10">
              Currently operating in manual entry mode. Automatic institution
              synchronization is in development to provide seamless, secure
              transaction imports.
            </Text>
            <Pressable
              className="w-full py-3 px-4 bg-surface-variant rounded-lg flex-row items-center justify-center gap-2 opacity-70 z-10"
              disabled
            >
              <MaterialIcons name="sync-disabled" size={20} color="#c3c6d6" />
              <Text className="text-body-lg font-body-lg font-medium text-on-surface-variant">
                Connect Bank (Coming Soon)
              </Text>
            </Pressable>
          </View>

          {/* Sign Out Section */}
          <View className="pt-4 pb-8 flex-col items-center gap-4">
            <Pressable 
              className="w-full py-3.5 px-4 bg-error-container rounded-lg flex-row items-center justify-center gap-2 active:bg-error shadow-sm"
              onPress={() => {
                reset();
                signOut(auth).catch(console.error);
              }}
            >
              <MaterialIcons name="logout" size={20} color="#ffdad6" />
              <Text className="text-body-lg font-body-lg font-medium text-on-error-container">
                Sign Out
              </Text>
            </Pressable>
            <Text className="text-label-md font-label-md text-outline">
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
