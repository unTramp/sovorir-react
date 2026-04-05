import { create } from 'zustand';
import type { Profile } from '../types/api';
import { apiClient, saveTokens, clearTokens, getAccessToken, getRefreshToken } from '../lib/apiClient';
import { LoginResponseSchema, ProfileSchema } from '../lib/apiSchemas';

interface AuthState {
  profile: Profile | null;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isLoading: boolean;
  error: string | null;
  authReady: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  tryRestoreSession: () => Promise<void>;
  initialize: () => Promise<void>;
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
  firstName: '',
  lastName: '',
  avatarUrl: '/assets/student-avatar.png',
  isLoading: false,
  error: null,
  authReady: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiClient.post<unknown>('/auth/login', { email, password });
      const data = LoginResponseSchema.parse(raw);
      saveTokens(data.accessToken, data.refreshToken);
      set({ profile: data.profile, ...deriveUser(data.profile), isLoading: false, authReady: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа';
      set({ error: msg, isLoading: false, authReady: true });
    }
  },

  logout: () => {
    clearTokens();
    set({
      profile: null,
      firstName: '',
      lastName: '',
      avatarUrl: '/assets/student-avatar.png',
      error: null,
      authReady: true,
    });
  },

  isAuthenticated: () => get().profile !== null,

  tryRestoreSession: async () => {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();
    if (!refreshToken && !accessToken) {
      set({ authReady: true, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const raw = await apiClient.get<unknown>('/auth/me');
      const profile = ProfileSchema.parse(raw);
      set({ profile, ...deriveUser(profile), isLoading: false, authReady: true });
    } catch {
      clearTokens();
      set({
        profile: null,
        firstName: '',
        lastName: '',
        avatarUrl: '/assets/student-avatar.png',
        isLoading: false,
        authReady: true,
      });
    }
  },

  initialize: async () => {
    const state = get();
    if (state.authReady || state.isLoading) return;
    await state.tryRestoreSession();
  },
}));
