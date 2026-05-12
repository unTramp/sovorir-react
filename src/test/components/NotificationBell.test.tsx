import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationBell } from '../../components/ui/NotificationBell';
import { useNotificationStore } from '../../stores/useNotificationStore';
import type { AppNotification } from '../../types/notification';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const makeNotification = (overrides?: Partial<AppNotification>): AppNotification => ({
  id: 'notif-1',
  type: 'needs_revision',
  title: 'Задание на доработку',
  body: 'Преподаватель оставил комментарий',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

function renderBell() {
  return render(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useNotificationStore.setState({
    notifications: [],
    isLoading: false,
    error: null,
    loadNotifications: vi.fn().mockResolvedValue(undefined),
  } as never);
  vi.clearAllMocks();
});

describe('NotificationBell', () => {
  it('shows badge count when unread > 0', () => {
    useNotificationStore.setState({
      notifications: [
        makeNotification({ id: '1', isRead: false }),
        makeNotification({ id: '2', isRead: false }),
      ],
    } as never);
    renderBell();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows no badge when all read', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ isRead: true })],
    } as never);
    renderBell();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows no badge when no notifications', () => {
    renderBell();
    // Badge text should not exist
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('opens panel on bell click and shows notifications', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ title: 'Задание на доработку' })],
    } as never);
    renderBell();
    fireEvent.click(screen.getByLabelText('Уведомления'));
    expect(screen.getByText('Задание на доработку')).toBeInTheDocument();
  });

  it('shows "Прочитать все" button when there are unread notifications', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ isRead: false })],
    } as never);
    renderBell();
    fireEvent.click(screen.getByLabelText('Уведомления'));
    expect(screen.getByText('Прочитать все')).toBeInTheDocument();
  });

  it('"Прочитать все" calls markAllRead', () => {
    const markAllRead = vi.fn();
    useNotificationStore.setState({
      notifications: [makeNotification({ isRead: false })],
      markAllRead,
    } as never);
    renderBell();
    fireEvent.click(screen.getByLabelText('Уведомления'));
    fireEvent.click(screen.getByText('Прочитать все'));
    expect(markAllRead).toHaveBeenCalledOnce();
  });

  it('shows "9+" badge when unread > 9', () => {
    const manyNotifs = Array.from({ length: 12 }, (_, i) =>
      makeNotification({ id: `n-${i}`, isRead: false }),
    );
    useNotificationStore.setState({ notifications: manyNotifs } as never);
    renderBell();
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    renderBell();
    fireEvent.click(screen.getByLabelText('Уведомления'));
    expect(screen.getByText('Нет уведомлений')).toBeInTheDocument();
  });
});
