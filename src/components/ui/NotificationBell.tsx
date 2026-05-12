import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/useNotificationStore';
import type { AppNotification } from '../../types/notification';

const TYPE_ICON: Record<AppNotification['type'], string> = {
  review_ready:          '✅',
  deadline:              '⏰',
  needs_revision:        '✏️',
  consultation_reminder: '📅',
  assignment_accepted:   '🎉',
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'только что';
  if (diff < 3600)  return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, loadNotifications, markRead, markAllRead, unreadCount } =
    useNotificationStore();

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const count = unreadCount();

  const handleItemClick = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    if (n.route) navigate(n.route);
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button
        className="notif-bell__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Уведомления"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="notif-bell__badge">{count > 9 ? '9+' : count}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel__header">
            <span className="notif-panel__title">Уведомления</span>
            {count > 0 && (
              <button className="notif-panel__read-all" onClick={markAllRead}>
                Прочитать все
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <div className="notif-panel__empty">Нет уведомлений</div>
          )}

          <ul className="notif-panel__list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notif-item${n.isRead ? '' : ' notif-item--unread'}`}
                onClick={() => handleItemClick(n)}
              >
                <span className="notif-item__icon">{TYPE_ICON[n.type]}</span>
                <div className="notif-item__body">
                  <div className="notif-item__title">{n.title}</div>
                  <div className="notif-item__text">{n.body}</div>
                  <div className="notif-item__time">{timeAgo(n.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
