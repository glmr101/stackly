import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, AppState, AppStateStatus } from "react-native";
import "../global.css";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as LocalAuthentication from "expo-local-authentication";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { ScaleButton } from "@/components/ui/ScaleButton";

// Configure Reanimated logger to suppress strict-mode development warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const biometricLockEnabled = useAppStore(
    (state) => state.biometricLockEnabled
  );

  const [isLocked, setIsLocked] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isAuthenticatingRef = useRef(false);

  // On initial mount, if biometric lock is enabled, lock the app
  useEffect(() => {
    if (biometricLockEnabled && user) {
      setIsLocked(true);
    }
    setAuthChecked(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for app state changes (background → foreground)
  // Ignore transitions caused by the biometric prompt itself
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current === "background" &&
          nextAppState === "active" &&
          biometricLockEnabled &&
          user &&
          !isAuthenticatingRef.current
        ) {
          setIsLocked(true);
        }
        appStateRef.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, [biometricLockEnabled, user]);

  const handleUnlock = useCallback(async () => {
    if (isAuthenticatingRef.current) return;
    isAuthenticatingRef.current = true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Stackly",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        setIsLocked(false);
      }
    } catch {
      // Authentication error — user can retry via button
    } finally {
      // Small delay to let AppState settle after the prompt dismisses
      setTimeout(() => {
        isAuthenticatingRef.current = false;
      }, 500);
    }
  }, []);

  // Auto-prompt biometric once when locked
  useEffect(() => {
    if (isLocked && authChecked) {
      handleUnlock();
    }
  }, [isLocked, authChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, rootNavigationState?.key, router]);

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
          name="edit-account"
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
          name="account-profile"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 280,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="security-biometrics"
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

      {/* Biometric Lock Overlay */}
      {isLocked && user && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#090B10",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="items-center gap-6">
            <View className="w-20 h-20 rounded-3xl bg-primary/20 items-center justify-center border border-primary/30">
              <MaterialIcons name="lock" size={36} color="#B2C5FF" />
            </View>

            <View className="items-center gap-1.5">
              <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
                Stackly
              </Text>
              <Text className="text-sm text-on-surface-variant font-medium">
                Locked — authenticate to continue
              </Text>
            </View>

            <ScaleButton
              activeScale={0.95}
              className="mt-4 px-8 py-3.5 bg-primary/20 rounded-2xl border border-primary/30 flex-row items-center gap-2.5"
              onPress={handleUnlock}
            >
              <MaterialIcons name="fingerprint" size={20} color="#B2C5FF" />
              <Text className="text-sm font-bold text-primary">Unlock</Text>
            </ScaleButton>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}
