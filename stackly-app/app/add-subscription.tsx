import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

type BillingCycle = "monthly" | "yearly";

export default function AddSubscription() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const addSubscription = useAppStore((state) => state.addSubscription);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextChargeDate, setNextChargeDate] = useState(""); // Simplified text input for mock, could use datetime picker in real app

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !name || !nextChargeDate) {
      // Very basic validation
      return;
    }

    addSubscription({
      name,
      category: category || "General",
      amount: parsedAmount,
      billingCycle,
      nextChargeDate: new Date(nextChargeDate).toISOString(), // Assumes valid date string like "2023-11-01"
      icon: "subscriptions", // default icon
      active: true,
      color: "#b2c5ff", // primary color default
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
          Add Subscription
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        {/* Amount */}
        <View className="px-6 mt-8 mb-10 flex-col items-center">
          <Text className="text-on-surface-variant text-label-md uppercase tracking-wider mb-2 opacity-80">
            Amount
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
              value={amount}
              onChangeText={setAmount}
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
              placeholder="Service Name (e.g. Netflix)"
              placeholderTextColor="#c3c6d680"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View className="bg-surface-container-low rounded-xl px-4 py-1 flex-row items-center gap-3">
            <MaterialIcons name="category" size={20} color="#c3c6d6" />
            <TextInput
              className="flex-1 text-on-surface text-body-lg p-3 h-14"
              placeholder="Category (e.g. Entertainment)"
              placeholderTextColor="#c3c6d680"
              value={category}
              onChangeText={setCategory}
            />
          </View>
          <View className="bg-surface-container-low rounded-xl px-4 py-1 flex-row items-center gap-3">
            <MaterialIcons name="event" size={20} color="#c3c6d6" />
            <TextInput
              className="flex-1 text-on-surface text-body-lg p-3 h-14"
              placeholder="Next Charge Date (YYYY-MM-DD)"
              placeholderTextColor="#c3c6d680"
              value={nextChargeDate}
              onChangeText={setNextChargeDate}
            />
          </View>
        </View>

        {/* Billing Cycle */}
        <View className="px-4 mb-10">
          <Text className="text-on-surface text-label-md uppercase tracking-wider mb-4 px-2 opacity-80">
            Billing Cycle
          </Text>
          <View className="flex-row items-center justify-between gap-4">
            <Pressable
              className={`flex-1 py-3 px-4 rounded-xl border ${
                billingCycle === "monthly" ? "bg-primary-container border-primary" : "bg-surface-container-low border-outline/10"
              }`}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text className={`text-center font-body-md ${billingCycle === "monthly" ? "text-on-primary-container" : "text-on-surface-variant"}`}>Monthly</Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-3 px-4 rounded-xl border ${
                billingCycle === "yearly" ? "bg-primary-container border-primary" : "bg-surface-container-low border-outline/10"
              }`}
              onPress={() => setBillingCycle("yearly")}
            >
              <Text className={`text-center font-body-md ${billingCycle === "yearly" ? "text-on-primary-container" : "text-on-surface-variant"}`}>Yearly</Text>
            </Pressable>
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
              Save Subscription
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
