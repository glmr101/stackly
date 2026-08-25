import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const google = useGoogleAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The auth listener in useAuthStore will automatically update state and trigger navigation
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to sign in. Please check your credentials.";
      console.log(e);
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
      <View className="flex-1 px-container-padding justify-center" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        
        <View className="mb-10 flex-col items-center">
          <View className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <MaterialIcons name="account-balance-wallet" size={32} color="#b2c5ff" />
          </View>
          <Text className="text-display font-display text-on-surface mb-2">
            Stackly
          </Text>
          <Text className="text-body-lg font-body-lg text-on-surface-variant text-center">
            Sign in to manage your finances seamlessly.
          </Text>
        </View>

        <View className="flex-col gap-5">
          <View>
            <Text className="font-label-md text-label-md text-on-surface-variant mb-2">
              Email Address
            </Text>
            <View className="bg-surface-container-low rounded-xl px-4 flex-row items-center gap-3">
              <MaterialIcons name="email" size={20} color="#c3c6d6" />
              <TextInput
                className="flex-1 text-on-surface text-body-lg h-14"
                placeholder="you@example.com"
                placeholderTextColor="#c3c6d680"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          <View>
            <Text className="font-label-md text-label-md text-on-surface-variant mb-2">
              Password
            </Text>
            <View className="bg-surface-container-low rounded-xl px-4 flex-row items-center gap-3">
              <MaterialIcons name="lock" size={20} color="#c3c6d6" />
              <TextInput
                className="flex-1 text-on-surface text-body-lg h-14"
                placeholder="••••••••"
                placeholderTextColor="#c3c6d680"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>

          {displayError ? (
            <View className="bg-error-container/20 p-3 rounded-lg border border-error-container">
              <Text className="text-error font-body-sm">{displayError}</Text>
            </View>
          ) : null}

          <Pressable
            className={`w-full py-4 rounded-xl items-center justify-center mt-2 ${
              isLoading ? "bg-surface-variant" : "bg-primary active:bg-primary-container"
            }`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {loading ? (
              <ActivityIndicator color="#002c72" />
            ) : (
              <Text className="text-on-primary text-headline-md font-headline-md">
                Sign In
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-4 my-1">
            <View className="flex-1 h-px bg-outline/30" />
            <Text className="text-label-md font-label-md text-outline">or</Text>
            <View className="flex-1 h-px bg-outline/30" />
          </View>

          {/* Google Sign-In */}
          <Pressable
            className={`w-full py-4 rounded-xl items-center justify-center flex-row gap-3 border border-outline/30 ${
              isLoading || !google.ready ? "opacity-50" : "bg-surface-container active:bg-surface-container-high"
            }`}
            onPress={google.signInWithGoogle}
            disabled={isLoading || !google.ready}
          >
            {google.loading ? (
              <ActivityIndicator color="#b2c5ff" />
            ) : (
              <>
                <Text className="text-xl font-bold" style={{ color: "#4285F4" }}>G</Text>
                <Text className="text-on-surface text-body-lg font-body-lg">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-2">
          <Text className="text-body-md font-body-md text-on-surface-variant">
            Don't have an account?
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable hitSlop={10}>
              <Text className="text-primary font-headline-md text-body-md">
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
