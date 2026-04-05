import { create } from 'zustand';
import type { Profile } from '../types/api';
import { apiClient, saveTokens, clearTokens, getRefreshToken } from '../lib/apiClient';
import { LoginResponseSchema, ProfileSchema } from '../lib/apiSchemas';

interface AuthState {
  profile: Profile | null;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  tryRestoreSession: () => Promise<void>;
}

function deriveUser(profile: Profile) {
  const parts = profile.fullName.split(' ');
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    avatarUrl: profile.avatarUrl ?? '/assets/student-avatar.png',
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  profile: null,
  firstName: 'Андрей',
  lastName: 'Дорофеев',
  avatarUrl: '/assets/student-avatar.png',
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiClient.post<unknown>('/auth/login', { email, password });
      const data = LoginResponseSchema.parse(raw);
      saveTokens(data.accessToken, data.refreshToken);
      set({ profile: data.profile, ...deriveUser(data.profile), isLoading: false });
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
      const raw = await apiClient.get<unknown>('/auth/me');
      const profile = ProfileSchema.parse(raw);
      set({ profile, ...deriveUser(profile), isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },
}));
