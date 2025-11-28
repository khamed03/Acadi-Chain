"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      address: null,
      hydrated: false,
      login: ({ token, role, address }) => set({ token, role, address }),
      logout: () => set({ token: null, role: null, address: null }),
      setHydrated: (b) => set({ hydrated: b }),
    }),
    { name: "acadi-auth" }
  )
);
