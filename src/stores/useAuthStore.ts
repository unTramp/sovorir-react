import { create } from 'zustand';
import type { Profile } from '../types/api';
import { apiClient, saveTokens, clearTokens, getRefreshToken } from '../lib/apiClient';
import { LoginResponseSchema, ProfileSchema } from '../lib/apiSchemas';
import { useUserStore } from './useUserStore';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  tryRestoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiClient.post<unknown>('/auth/login', { email, password });
      const data = LoginResponseSchema.parse(raw);
      saveTokens(data.accessToken, data.refreshToken);
      useUserStore.getState().setFromProfile(data.profile);
      set({ profile: data.profile, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа';
      set({ error: msg, isLoading: false });
    }
  },

  logout: () => {
    clearTokens();
    set({ profile: null, error: null });
  },

  isAuthenticated: () => get().profile !== null,

  tryRestoreSession: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    set({ isLoading: true });
    try {
      // Re-use apiClient.get which will auto-refresh via the refresh token logic in apiClient
      const raw = await apiClient.get<unknown>('/auth/me');
      const profile = ProfileSchema.parse(raw);
      useUserStore.getState().setFromProfile(profile);
      set({ profile, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },
}));
