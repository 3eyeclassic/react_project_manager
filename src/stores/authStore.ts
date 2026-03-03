import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEMO_USER_EMAIL = import.meta.env.VITE_DEMO_USER_EMAIL ?? "demo@example.com";

export interface AuthState {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      setDemoMode: (value) => set({ isDemoMode: value }),
    }),
    { name: "auth-store" }
  )
);

export function isDemoUser(email: string | undefined): boolean {
  return email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase();
}
