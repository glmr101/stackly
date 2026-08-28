import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";

type BillingCycle = "monthly" | "yearly";

export default function AddSubscription() {
  const router = useRouter();

  const addSubscription = useAppStore((state) => state.addSubscription);
  const categories = useAppStore((state) => state.categories);
  const currency = useAppStore((state) => state.currency);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [nextChargeDate, setNextChargeDate] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0]
  );
  const [selectedColor, setSelectedColor] = useState("#B2C5FF");

  const colors = [
    "#B2C5FF",
    "#4DE082",
    "#FFB4AB",
    "#C084FC",
    "#FBBF24",
    "#38BDF8",
  ];

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !name.trim()) {
      return;
    }

    addSubscription({
      name: name.trim(),
      categoryId: selectedCategoryId || undefined,
      amount: parsedAmount,
      billingCycle,
      nextChargeDate: new Date(nextChargeDate).toISOString(),
      icon: "subscriptions",
      active: true,
      color: selectedColor,
    });

    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              Add Subscription
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Hero Input */}
          <View className="mx-5 mt-5 mb-6 p-6 rounded-[28px] bg-surface-container border border-outline-variant/30 items-center">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Recurring Amount
            </Text>

            <View className="flex-row items-center justify-center w-full my-2">
              <Text className="text-3xl font-extrabold text-on-surface-variant mr-1">
                {currency?.symbol || "$"}
              </Text>
              <TextInput
                className="text-4xl font-extrabold text-on-surface text-center min-w-[120px] p-0"
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#C3C6D650"
                value={amount}
                onChangeText={setAmount}
                autoFocus={true}
              />
            </View>
          </View>

          {/* Billing Cycle */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Billing Frequency
            </Text>
            <SegmentedControl<BillingCycle>
              options={[
                { value: "monthly" as const, label: "Monthly" },
                { value: "yearly" as const, label: "Yearly" },
              ]}
              selectedValue={billingCycle}
              onChange={setBillingCycle}
            />
          </View>

          {/* Service Name & Next Charge Date */}
          <View className="px-5 flex-col gap-3 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Subscription Details
            </Text>

            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="label" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Service Name (e.g. Netflix, Figma)"
                placeholderTextColor="#C3C6D680"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="event" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm p-3 h-12"
                placeholder="Next Charge Date (YYYY-MM-DD)"
                placeholderTextColor="#C3C6D680"
                value={nextChargeDate}
                onChangeText={setNextChargeDate}
              />
            </View>
          </View>

          {/* Category Chips */}
          <View className="px-5 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories
                .filter((c) => c.type === "expense")
                .map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <ScaleButton
                      key={cat.id}
                      activeScale={0.92}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      className={`px-4 py-2.5 rounded-2xl border flex-row items-center gap-2 ${
                        isSelected
                          ? "bg-primary/20 border-primary"
                          : "bg-surface-container border-outline-variant/30"
                      }`}
                    >
                      <MaterialIcons
                        name={cat.icon as any}
                        size={16}
                        color={isSelected ? "#B2C5FF" : "#C3C6D6"}
                      />
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </ScaleButton>
                  );
                })}
            </ScrollView>
          </View>

          {/* Color Accent Picker */}
          <View className="px-5 mb-8">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Brand Accent Color
            </Text>
            <View className="flex-row gap-3">
              {colors.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <ScaleButton
                    key={c}
                    activeScale={0.88}
                    onPress={() => setSelectedColor(c)}
                    className="w-10 h-10 rounded-full items-center justify-center border-2"
                    style={{
                      backgroundColor: c,
                      borderColor: isSelected ? "#FFFFFF" : "transparent",
                    }}
                  >
                    {isSelected && (
                      <MaterialIcons name="check" size={18} color="#000000" />
                    )}
                  </ScaleButton>
                );
              })}
            </View>
          </View>

          {/* Save Action */}
          <View className="px-5">
            <ScaleButton
              activeScale={0.95}
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={22} color="#002C72" />
              <Text className="text-base font-extrabold text-on-primary">
                Save Subscription
              </Text>
            </ScaleButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
