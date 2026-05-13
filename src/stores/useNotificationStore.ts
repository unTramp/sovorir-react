import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';
import { NotificationSchema } from '../lib/apiSchemas';
import type { AppNotification } from '../types/notification';

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;

  loadNotifications: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  loadNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await apiClient.get<unknown>('/notifications');
      const data = NotificationSchema.array().parse(raw) as AppNotification[];
      set({ notifications: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка загрузки', isLoading: false });
    }
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    }));
    // Fire-and-forget — no need to await
    void apiClient.post(`/notifications/${id}/read`, {}).catch(() => null);
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    void apiClient.post('/notifications/read-all', {}).catch(() => null);
  },

  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
