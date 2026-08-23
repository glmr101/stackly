import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName } from "@/types";

type TransactionType = "expense" | "income" | "transfer";

interface CategoryOption {
  name: string;
  icon: MaterialIconName;
}

export default function AddTransaction() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const storeAccounts = useAppStore((state) => state.accounts);
  const addTransaction = useAppStore((state) => state.addTransaction);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  // Select first account by default if available
  const [selectedAccountId, setSelectedAccountId] = useState(storeAccounts[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");

  const categories: CategoryOption[] = [
    { name: "Food", icon: "restaurant" },
    { name: "Shop", icon: "shopping-bag" },
    { name: "Transit", icon: "directions-car" },
    { name: "Income", icon: "payments" },
    { name: "More", icon: "more-horiz" },
  ];

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !selectedAccountId) {
      // Very basic validation
      return;
    }

    const cat = categories.find(c => c.name === selectedCategory);
    
    addTransaction({
      type,
      amount: parsedAmount,
      accountId: selectedAccountId,
      category: selectedCategory,
      categoryIcon: cat?.icon || 'category',
      payee: merchant || 'Unknown Merchant',
      note,
      date: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-4 flex-row items-center gap-4">
        <Pressable
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#dfe2f1" />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-on-surface">
          Add Transaction
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Segmented Control */}
        <View className="bg-surface-container-low rounded-[32px] p-1 mx-4 mt-4 flex-row items-center justify-between mb-8 shadow-sm">
          {["Expense", "Income", "Transfer"].map((tLabel) => {
            const tValue = tLabel.toLowerCase() as TransactionType;
            const isSelected = type === tValue;
            return (
              <Pressable
                key={tValue}
                className={`flex-1 py-3 px-4 rounded-[28px] ${
                  isSelected ? "bg-primary" : ""
                }`}
                onPress={() => setType(tValue)}
              >
                <Text
                  className={`font-headline-md text-body-md text-center ${
                    isSelected ? "text-on-primary" : "text-on-surface-variant"
                  }`}
                >
                  {tLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Amount */}
        <View className="px-6 mb-10 flex-col items-center">
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

        {/* Account Selector */}
        <View className="px-4 mb-8">
          <Text className="text-on-surface text-label-md uppercase tracking-wider mb-4 px-2 opacity-80">
            Account
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
          >
            {storeAccounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <Pressable
                  key={acc.id}
                  className={`rounded-xl px-5 py-4 flex-col items-start gap-2 ${
                    isSelected
                      ? "bg-primary/10 border border-primary shadow-sm"
                      : "bg-surface-container-low"
                  }`}
                  onPress={() => setSelectedAccountId(acc.id)}
                >
                  <MaterialIcons
                    name={acc.icon}
                    size={24}
                    color={isSelected ? "#b2c5ff" : "#c3c6d6"}
                  />
                  <Text
                    className={`text-body-md font-headline-md ${
                      isSelected ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {acc.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Selector */}
        <View className="px-4 mb-8">
          <Text className="text-on-surface text-label-md uppercase tracking-wider mb-4 px-2 opacity-80">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <Pressable
                  key={cat.name}
                  className={`flex-col items-center justify-center gap-2 w-[22%] aspect-square rounded-2xl ${
                    isSelected
                      ? "bg-tertiary-container/20 border border-tertiary-container/30"
                      : "bg-surface-container-low"
                  }`}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <View
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected
                        ? "bg-tertiary-container"
                        : "bg-surface-container-high"
                    }`}
                  >
                    <MaterialIcons
                      name={cat.icon}
                      size={20}
                      color={isSelected ? "#5c000d" : "#c3c6d6"} // on-tertiary-container vs on-surface-variant
                    />
                  </View>
                  <Text
                    className={`text-label-md ${
                      isSelected ? "text-tertiary-container" : "text-on-surface-variant"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Inputs */}
        <View className="px-4 flex-col gap-4 mb-10">
          <View className="bg-surface-container-low rounded-xl px-4 py-1 flex-row items-center gap-3">
            <MaterialIcons name="storefront" size={20} color="#c3c6d6" />
            <TextInput
              className="flex-1 text-on-surface text-body-lg p-3 h-14"
              placeholder="Merchant or Payee"
              placeholderTextColor="#c3c6d680"
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>
          <View className="bg-surface-container-low rounded-xl px-4 py-3 flex-row items-start gap-3">
            <MaterialIcons
              name="notes"
              size={20}
              color="#c3c6d6"
              style={{ marginTop: 4 }}
            />
            <TextInput
              className="flex-1 text-on-surface text-body-md pt-0"
              placeholder="Add a note (optional)"
              placeholderTextColor="#c3c6d680"
              multiline
              numberOfLines={2}
              value={note}
              onChangeText={setNote}
              style={{ minHeight: 60, textAlignVertical: "top" }}
            />
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
              Save Transaction
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
