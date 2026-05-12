import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationStore } from '../../stores/useNotificationStore';
import type { AppNotification } from '../../types/notification';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '../../lib/apiClient';

const makeNotification = (overrides?: Partial<AppNotification>): AppNotification => ({
  id: 'notif-1',
  type: 'needs_revision',
  title: 'Задание на доработку',
  body: 'Комментарий преподавателя',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  useNotificationStore.setState({ notifications: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

describe('useNotificationStore', () => {
  it('loadNotifications fetches from /notifications', async () => {
    const notif = makeNotification();
    vi.mocked(apiClient.get).mockResolvedValue([notif]);
    await useNotificationStore.getState().loadNotifications();
    expect(apiClient.get).toHaveBeenCalledWith('/notifications');
    expect(useNotificationStore.getState().notifications).toEqual([notif]);
  });

  it('loadNotifications sets error on failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
    await useNotificationStore.getState().loadNotifications();
    expect(useNotificationStore.getState().error).toBe('Network error');
  });

  it('unreadCount returns correct count', () => {
    useNotificationStore.setState({
      notifications: [
        makeNotification({ id: '1', isRead: false }),
        makeNotification({ id: '2', isRead: true }),
        makeNotification({ id: '3', isRead: false }),
      ],
    });
    expect(useNotificationStore.getState().unreadCount()).toBe(2);
  });

  it('unreadCount returns 0 when all read', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ isRead: true })],
    });
    expect(useNotificationStore.getState().unreadCount()).toBe(0);
  });

  it('markRead sets notification as read', () => {
    vi.mocked(apiClient.post).mockResolvedValue({});
    useNotificationStore.setState({ notifications: [makeNotification({ id: 'notif-1', isRead: false })] });
    useNotificationStore.getState().markRead('notif-1');
    expect(useNotificationStore.getState().notifications[0].isRead).toBe(true);
  });

  it('markRead calls /notifications/:id/read', () => {
    vi.mocked(apiClient.post).mockResolvedValue({});
    useNotificationStore.setState({ notifications: [makeNotification({ id: 'notif-1' })] });
    useNotificationStore.getState().markRead('notif-1');
    expect(apiClient.post).toHaveBeenCalledWith('/notifications/notif-1/read', {});
  });

  it('markAllRead sets all notifications as read', () => {
    vi.mocked(apiClient.post).mockResolvedValue({});
    useNotificationStore.setState({
      notifications: [
        makeNotification({ id: '1', isRead: false }),
        makeNotification({ id: '2', isRead: false }),
      ],
    });
    useNotificationStore.getState().markAllRead();
    const { notifications } = useNotificationStore.getState();
    expect(notifications.every((n) => n.isRead)).toBe(true);
  });

  it('new review_ready notification appears after load', async () => {
    const reviewNotif = makeNotification({ type: 'review_ready', title: 'Новая работа на проверку' });
    vi.mocked(apiClient.get).mockResolvedValue([reviewNotif]);
    await useNotificationStore.getState().loadNotifications();
    expect(useNotificationStore.getState().notifications[0].type).toBe('review_ready');
  });
});
