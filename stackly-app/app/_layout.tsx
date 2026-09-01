import { useEffect } from "react";
import "../global.css";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/useAuthStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, rootNavigationState?.key]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#090B10" }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 220,
          gestureEnabled: true,
          contentStyle: { backgroundColor: "#090B10" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(auth)"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="add-account"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="add-subscription"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="edit-subscription"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="set-budget"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="add-savings-goal"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="contribute-savings"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="currency-region"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="transactions"
          options={{
            animation: "slide_from_right",
            animationDuration: 260,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            animation: "slide_from_right",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
