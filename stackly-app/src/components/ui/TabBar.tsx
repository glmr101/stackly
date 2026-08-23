import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link } from 'expo-router';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 24 }]}>
      {/* Pill-shaped Dock */}
      <View className="flex-row items-center bg-surface-container-high rounded-[18px] px-8 h-14 shadow-lg border border-outline-variant/20 gap-8">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = 
            route.name === 'index' ? 'home' : 
            route.name === 'accounts' ? 'account-balance-wallet' : 
            route.name === 'subscriptions' ? 'calendar-today' : 'circle';

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className={`flex items-center justify-center transition-transform active:scale-90`}
            >
              <MaterialIcons
                name={iconName as any}
                size={24}
                color={isFocused ? '#b2c5ff' : '#c3c6d6'} // primary vs on-surface-variant
              />
            </Pressable>
          );
        })}
      </View>
      
      {/* Separate FAB */}
      <Link href="/add-transaction" asChild>
        <Pressable className="w-14 h-14 bg-surface-container-high rounded-[18px] shadow-lg flex items-center justify-center active:scale-95 border border-outline-variant/20 ml-4">
          <MaterialIcons name="add" size={30} color="#b2c5ff" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
