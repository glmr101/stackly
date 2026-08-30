import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { ScaleButton } from "@/components/ui/ScaleButton";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SignIn() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const google = useGoogleAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to sign in. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || google.loading;
  const displayError = error || google.error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="mb-8 items-center"
        >
          <View className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-[22px] items-center justify-center mb-4 shadow-lg">
            <MaterialIcons
              name="account-balance-wallet"
              size={32}
              color="#B2C5FF"
            />
          </View>
          <Text className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">
            Stackly
          </Text>
          <Text className="text-sm font-medium text-on-surface-variant text-center px-4">
            Master all your personal finances in one place.
          </Text>
        </Animated.View>

        {/* Input Fields */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="flex-col gap-4"
        >
          <View>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
              Email Address
            </Text>
            <View className="bg-surface-container rounded-2xl px-4 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="email" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm h-13 py-3"
                placeholder="you@example.com"
                placeholderTextColor="#C3C6D680"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
              Password
            </Text>
            <View className="bg-surface-container rounded-2xl px-4 flex-row items-center gap-3 border border-outline-variant/30">
              <MaterialIcons name="lock" size={20} color="#C3C6D6" />
              <TextInput
                className="flex-1 text-on-surface text-sm h-13 py-3"
                placeholder="••••••••"
                placeholderTextColor="#C3C6D680"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>

          {displayError ? (
            <View className="bg-error-container/30 p-3.5 rounded-xl border border-error/30">
              <Text className="text-error text-xs font-medium leading-relaxed">
                {displayError}
              </Text>
            </View>
          ) : null}

          {/* Sign In Button */}
          <ScaleButton
            activeScale={0.95}
            className={`w-full py-4 rounded-2xl items-center justify-center mt-2 shadow-lg ${
              isLoading ? "bg-surface-variant" : "bg-primary"
            }`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {loading ? (
              <ActivityIndicator color="#002C72" />
            ) : (
              <Text className="text-on-primary text-base font-extrabold">
                Sign In
              </Text>
            )}
          </ScaleButton>

          {/* Divider */}
          <View className="flex-row items-center gap-4 my-2">
            <View className="flex-1 h-px bg-outline-variant/30" />
            <Text className="text-xs font-semibold text-on-surface-variant">
              or
            </Text>
            <View className="flex-1 h-px bg-outline-variant/30" />
          </View>

          {/* Google Sign-In */}
          <ScaleButton
            activeScale={0.96}
            className={`w-full py-3.5 rounded-2xl items-center justify-center flex-row gap-3 border border-outline-variant/30 bg-surface-container ${
              isLoading || !google.ready ? "opacity-50" : ""
            }`}
            onPress={google.signInWithGoogle}
            disabled={isLoading || !google.ready}
          >
            {google.loading ? (
              <ActivityIndicator color="#B2C5FF" />
            ) : (
              <>
                <Text
                  className="text-lg font-bold"
                  style={{ color: "#4285F4" }}
                >
                  G
                </Text>
                <Text className="text-on-surface text-sm font-bold">
                  Continue with Google
                </Text>
              </>
            )}
          </ScaleButton>
        </Animated.View>

        {/* Footer Link */}
        <View className="mt-8 flex-row items-center justify-center gap-2">
          <Text className="text-xs font-medium text-on-surface-variant">
            Don&apos;t have an account?
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <ScaleButton activeScale={0.92} hitSlop={10}>
              <Text className="text-primary font-bold text-xs">
                Create Account
              </Text>
            </ScaleButton>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
