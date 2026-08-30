import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budget & Savings',
        }}
      />
    </Tabs>
  );
}
