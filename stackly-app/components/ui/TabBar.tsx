import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link } from 'expo-router';
import { MaterialIconName } from '@/types';
import { ScaleButton } from './ScaleButton';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MAX_ACCOUNT_COUNT } from '@/constants';
import { useAppStore } from '@/store/useAppStore';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const accounts = useAppStore((s) => s.accounts);

  const currentRouteName = state.routes[state.index].name;
  let fabHref = '/add-transaction';
  if (currentRouteName === 'accounts') {
    fabHref = accounts.length >= MAX_ACCOUNT_COUNT ? '/subscription' : '/add-account';
  } else if (currentRouteName === 'subscriptions') {
    fabHref = '/add-subscription';
  } else if (currentRouteName === 'budgets') {
    fabHref = '/set-budget';
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Pill-shaped Floating Dock */}
      <View className="flex-row items-center bg-[#131722]/95 rounded-[26px] px-3 h-16 shadow-2xl border border-white/10 gap-1.5 backdrop-blur-xl">
        {state.routes.map((route, index) => {
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

          const iconName: MaterialIconName =
            route.name === 'index'
              ? 'home-filled'
              : route.name === 'accounts'
              ? 'account-balance-wallet'
              : route.name === 'subscriptions'
              ? 'calendar-today'
              : route.name === 'budgets'
              ? 'pie-chart'
              : 'circle';

          const label =
            route.name === 'index'
              ? 'Home'
              : route.name === 'accounts'
              ? 'Accounts'
              : route.name === 'subscriptions'
              ? 'Recurring'
              : route.name === 'budgets'
              ? 'Budgets'
              : route.name;

          return (
            <ScaleButton
              key={route.key}
              activeScale={0.88}
              onPress={onPress}
              className={`flex-row items-center justify-center py-2.5 px-3 rounded-[18px] ${
                isFocused
                  ? 'bg-primary/15 border border-primary/25'
                  : 'bg-transparent'
              }`}
            >
              <MaterialIcons
                name={iconName}
                size={22}
                color={isFocused ? '#B2C5FF' : '#8D909F'}
              />
              {isFocused && (
                <Animated.View entering={FadeIn.duration(200)} className="ml-1.5">
                  <Text className="text-xs font-bold text-primary tracking-tight">
                    {label}
                  </Text>
                </Animated.View>
              )}
            </ScaleButton>
          );
        })}
      </View>

      {/* Floating Action Button (FAB) */}
      <Link href={fabHref as any} asChild>
        <ScaleButton
          activeScale={0.88}
          className="w-14 h-14 bg-primary rounded-[22px] shadow-xl flex items-center justify-center ml-3 border border-white/20"
          style={styles.fabShadow}
        >
          <MaterialIcons name="add" size={30} color="#002C72" />
        </ScaleButton>
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
    paddingHorizontal: 16,
  },
  fabShadow: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default TabBar;
