import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // The auth listener in useAuthStore will automatically update state and trigger navigation
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to create account.";
      console.log(e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-container-padding justify-center" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        
        <Pressable
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container absolute left-4 z-10"
          style={{ top: insets.top + 16 }}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#dfe2f1" />
        </Pressable>

        <View className="mb-10 flex-col items-center mt-12">
          <View className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <MaterialIcons name="person-add" size={32} color="#b2c5ff" />
          </View>
          <Text className="text-display font-display text-on-surface mb-2">
            Create Account
          </Text>
          <Text className="text-body-lg font-body-lg text-on-surface-variant text-center">
            Join Stackly to master your money.
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
                editable={!loading}
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
                editable={!loading}
              />
            </View>
          </View>

          {error ? (
            <View className="bg-error-container/20 p-3 rounded-lg border border-error-container">
              <Text className="text-error font-body-sm">{error}</Text>
            </View>
          ) : null}

          <Pressable
            className={`w-full py-4 rounded-xl items-center justify-center mt-2 ${
              loading ? "bg-surface-variant" : "bg-primary active:bg-primary-container"
            }`}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#002c72" />
            ) : (
              <Text className="text-on-primary text-headline-md font-headline-md">
                Create Account
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-2">
          <Text className="text-body-md font-body-md text-on-surface-variant">
            Already have an account?
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable hitSlop={10}>
              <Text className="text-primary font-headline-md text-body-md">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
