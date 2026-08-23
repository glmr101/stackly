import { View, Text, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Toggle } from "@/components/ui/Toggle";
import { useAppStore } from "@/store/useAppStore";

export default function Subscriptions() {
  const insets = useSafeAreaInsets();
  
  const subs = useAppStore((state) => state.subscriptions);
  const toggleSubscription = useAppStore((state) => state.toggleSubscription);

  const totalMonthlySpend = subs
    .filter((s) => s.active)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-container-padding flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
            Subscriptions
          </Text>
        </View>
        <Link href="/settings" asChild>
          <Pressable className="w-8 h-8 flex items-center justify-center transition-colors">
            <MaterialIcons name="settings" size={24} color="#dfe2f1" />
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-container-padding py-6">
          <Text className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
            Total Monthly Spend
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text className="font-display text-display text-on-surface">
              ${totalMonthlySpend.toFixed(2)}
            </Text>
            <Text className="font-body-md text-body-md text-secondary-fixed">
              /mo
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-4 mt-6">
            <View className="flex-1 bg-surface-container rounded-xl p-card-inner-padding overflow-hidden">
              <View className="flex-col gap-1">
                <Text className="font-label-md text-label-md text-on-surface-variant">
                  Active
                </Text>
                <Text className="font-headline-md text-headline-md text-on-surface">
                  {subs.filter((s) => s.active).length}
                </Text>
              </View>
            </View>
            <View className="flex-1 bg-surface-container rounded-xl p-card-inner-padding overflow-hidden">
              <View className="flex-col gap-1">
                <Text className="font-label-md text-label-md text-on-surface-variant">
                  Upcoming
                </Text>
                <Text className="font-headline-md text-headline-md text-on-surface">
                  Oct 24
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subscription List */}
        <View className="px-container-padding flex-col gap-stack-gap mt-4">
          {subs.map((sub) => {
            const date = new Date(sub.nextChargeDate);
            return (
              <View
                key={sub.id}
                className="bg-surface-container rounded-xl p-card-inner-padding flex-col gap-4 overflow-hidden"
              >
                {/* Brand Glow Illusion */}
                <View
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
                  style={{ backgroundColor: sub.color }}
                />

                <View className="flex-row justify-between items-start z-10">
                  <View className="flex-row gap-3 items-center">
                    <View className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center">
                      <MaterialIcons
                        name={sub.icon}
                        size={24}
                        color={sub.color}
                      />
                    </View>
                    <View>
                      <Text className="font-headline-md text-headline-md text-on-surface">
                        {sub.name}
                      </Text>
                      <Text className="font-body-md text-body-md text-on-surface-variant">
                        {sub.category}
                      </Text>
                    </View>
                  </View>
                  <Toggle
                    value={sub.active}
                    onValueChange={() => toggleSubscription(sub.id)}
                  />
                </View>

                <View className="flex-row justify-between items-end mt-2 z-10">
                  <View className="flex-col gap-1">
                    <Text className="font-label-md text-label-md text-on-surface-variant">
                      Next Charge
                    </Text>
                    <Text className="font-body-md text-body-md text-on-surface flex-row items-center gap-1">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <View className="items-end flex-col gap-1">
                    <Text className="font-label-md text-label-md text-on-surface-variant">
                      {sub.billingCycle.charAt(0).toUpperCase() +
                        sub.billingCycle.slice(1)}
                    </Text>
                    <Text className="font-headline-md text-headline-md text-on-surface">
                      ${sub.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Empty State / Add CTA */}
        <View className="px-container-padding py-8 flex-col items-center justify-center opacity-60">
          <MaterialIcons name="add-circle" size={40} color="#c3c6d6" />
          <Text className="font-body-md text-body-md text-on-surface-variant text-center mt-2">
            Tracking all your subscriptions.{"\n"}You're in control.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
