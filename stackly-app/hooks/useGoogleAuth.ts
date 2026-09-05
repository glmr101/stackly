import { useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      setError("");
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .catch((e: unknown) => {
          const message =
            e instanceof Error ? e.message : "Google sign-in failed";
          setError(message);
        })
        .finally(() => setLoading(false));
    } else if (response?.type === "error") {
      setError((response.error as any)?.message || "Google sign-in failed");
      setLoading(false);
    }
  }, [response]);

  const signInWithGoogle = async () => {
    setError("");
    setLoading(true);
    await promptAsync();
  };

  return {
    signInWithGoogle,
    loading,
    error,
    ready: !!request,
  };
}
