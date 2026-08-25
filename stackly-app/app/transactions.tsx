import { View, Text, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function Transactions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const transactions = useAppStore((state) => state.transactions);

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
          All Transactions
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-container-padding py-4 flex-col gap-4">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isExpense = tx.type === 'expense';
            
            let bgColor = 'bg-surface-container-high';
            let iconColor = '#c3c6d6';
            let amountColor = 'text-on-surface';

            if (isIncome) {
              bgColor = 'bg-secondary-container/20';
              iconColor = '#4de082';
              amountColor = 'text-secondary';
            } else if (isExpense) {
              bgColor = 'bg-error-container/20';
              iconColor = '#ffb4ab';
            }

            const txDate = new Date(tx.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <View key={tx.id} className="flex-row items-center justify-between bg-surface-container p-4 rounded-xl shadow-sm">
                <View className="flex-row items-center gap-3">
                  <View className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
                    <MaterialIcons name={tx.categoryIcon} size={24} color={iconColor} />
                  </View>
                  <View className="flex-col">
                    <Text className="text-body-lg font-body-lg text-on-surface">
                      {tx.payee}
                    </Text>
                    <Text className="text-label-md font-label-md text-on-surface-variant">
                      {tx.category} • {txDate}
                    </Text>
                  </View>
                </View>
                <Text className={`text-body-lg font-body-lg font-medium ${amountColor}`}>
                  {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
          
          {transactions.length === 0 && (
            <View className="py-20 flex items-center justify-center">
              <MaterialIcons name="receipt-long" size={48} color="#c3c6d6" style={{ opacity: 0.5 }} />
              <Text className="text-body-lg font-body-lg text-on-surface-variant mt-4">
                No transactions yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
