import { View, Text, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const insets = useSafeAreaInsets();
  
  const accounts = useAppStore((state) => state.accounts);
  const transactions = useAppStore((state) => state.transactions);
  const subscriptions = useAppStore((state) => state.subscriptions);

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Derive upcoming bills from active subscriptions (mocking "due date" logic)
  const upcomingBills = subscriptions
    .filter((sub) => sub.active)
    .sort((a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime())
    .slice(0, 3)
    .map((sub) => {
      const date = new Date(sub.nextChargeDate);
      return {
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        dueDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        icon: sub.icon,
      };
    });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 px-container-padding flex-row items-center justify-between z-50">
        <View className="flex-row items-center gap-3">
          <Text className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
            Home
          </Text>
        </View>
        <Link href="/settings" asChild>
          <Pressable className="flex items-center justify-center transition-colors">
            <MaterialIcons name="settings" size={24} color="#c3c6d6" />
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Net Worth */}
        <View className="px-container-padding py-section-gap flex-col items-center justify-center bg-surface-container rounded-b-[32px] overflow-hidden mb-8">
          <Text className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider z-10">
            Total Net Worth
          </Text>
          <Text className="text-numeral-xl font-numeral-xl text-on-surface mt-2 z-10">
            ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <View className="flex-row items-center gap-1 mt-2 z-10 bg-secondary/10 px-2 py-1 rounded-full">
            <MaterialIcons name="trending-up" size={16} color="#4de082" />
            <Text className="text-label-md font-label-md text-secondary">
              +2.4% this month
            </Text>
          </View>
        </View>

        {/* Accounts Horizontal Scroll */}
        <View className="mb-section-gap">
          <View className="px-container-padding mb-4">
            <Text className="text-headline-md font-headline-md text-on-background">
              Accounts
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            snapToInterval={216} // 200 + 16 gap
            snapToAlignment="start"
            decelerationRate="fast"
          >
            {accounts.map((account) => {
              const isPrimary = account.type === 'savings'; // Just to match design colors
              return (
                <View
                  key={account.id}
                  className={`w-[200px] p-4 rounded-xl flex-col justify-between h-32 overflow-hidden shadow-sm ${
                    isPrimary ? 'bg-primary-container' : 'bg-surface-container-high'
                  }`}
                >
                  <View className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <MaterialIcons name={account.icon as any} size={80} color={isPrimary ? '#002665' : '#c3c6d6'} />
                  </View>
                  <View>
                    <Text className={`text-label-md font-label-md uppercase ${isPrimary ? 'text-on-primary-container opacity-80' : 'text-on-surface-variant'}`}>
                      {account.name}
                    </Text>
                    <Text className={`text-headline-lg-mobile font-headline-lg-mobile mt-1 ${isPrimary ? 'text-on-primary-container' : 'text-on-surface'}`}>
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="account-balance" size={14} color={isPrimary ? '#002665' : '#c3c6d6'} />
                    <Text className={`text-label-md font-label-md ${isPrimary ? 'text-on-primary-container opacity-80' : 'text-on-surface-variant'}`}>
                      {account.institution}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Upcoming Bills */}
        <View className="mb-section-gap px-container-padding">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline-md font-headline-md text-on-background">
              Upcoming Bills
            </Text>
            <Text className="text-label-md font-label-md text-primary">View all</Text>
          </View>
          <View className="bg-surface-container rounded-xl p-card-inner-padding shadow-sm flex-col gap-4">
            {upcomingBills.map((bill) => (
              <View key={bill.id} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center">
                    <MaterialIcons name={bill.icon as any} size={20} color="#c3c6d6" />
                  </View>
                  <View className="flex-col">
                    <Text className="text-body-lg font-body-lg text-on-surface">
                      {bill.name}
                    </Text>
                    <Text className="text-label-md font-label-md text-on-surface-variant">
                      {bill.dueDate}
                    </Text>
                  </View>
                </View>
                <Text className="text-body-lg font-body-lg text-on-surface font-medium">
                  -${bill.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-section-gap px-container-padding">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline-md font-headline-md text-on-background">
              Recent Activity
            </Text>
            <Text className="text-label-md font-label-md text-primary">View all</Text>
          </View>
          <View className="flex-col gap-4">
            {transactions.slice(0, 5).map((tx) => {
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

              return (
                <View key={tx.id} className="flex-row items-center justify-between bg-surface-container p-4 rounded-xl shadow-sm">
                  <View className="flex-row items-center gap-3">
                    <View className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
                      <MaterialIcons name={tx.categoryIcon as any} size={24} color={iconColor} />
                    </View>
                    <View className="flex-col">
                      <Text className="text-body-lg font-body-lg text-on-surface">
                        {tx.payee}
                      </Text>
                      <Text className="text-label-md font-label-md text-on-surface-variant">
                        {tx.category}
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-body-lg font-body-lg font-medium ${amountColor}`}>
                    {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
