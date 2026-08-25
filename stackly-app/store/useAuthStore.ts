import { create } from "zustand";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // starts loading while we check auth state
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Set up the Firebase observer with error and timeout safety
try {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
} catch {
  useAuthStore.getState().setLoading(false);
}

// Fallback timeout to unblock initial loading if Firebase takes too long
setTimeout(() => {
  if (useAuthStore.getState().isLoading) {
    useAuthStore.getState().setLoading(false);
  }
}, 2500);
