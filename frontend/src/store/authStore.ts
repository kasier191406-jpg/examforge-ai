import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "../services/apiClient";
import type { UserRole } from "../types";

type AuthUser = {
  username: string;
  fullName: string;
  role: UserRole;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (username: string, password: string) => {
        const response = await apiClient.post("/auth/login", { username, password });
        set({
          token: response.data.access_token,
          user: {
            username: response.data.user.username,
            fullName: response.data.user.full_name,
            role: response.data.user.role,
          },
        });
      },
      logout: () => set({ token: null, user: null }),
    }),
    { name: "examforge-auth" },
  ),
);
