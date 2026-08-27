import { useEffect, useState } from "react";
import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/useAuthStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    const unsubscribe = navigationRef?.addListener("state", () => {
      setIsNavigationReady(true);
    });
    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, isNavigationReady]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 260,
          gestureEnabled: true,
          contentStyle: { backgroundColor: "#090B10" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(auth)"
          options={{
            animation: "fade",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "fade",
            animationDuration: 220,
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
          name="settings"
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
      </Stack>
    </>
  );
}
