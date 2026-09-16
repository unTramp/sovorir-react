import { useNavigate, useMatch, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  HouseIcon,
  BookOpenIcon,
  ZapIcon,
  UserIcon,
  ClipboardIcon,
} from '../../icons';

type TabConfig = { label: string; path: string; icon: React.ComponentType<{ size?: number }> };

const STUDENT_TABS: TabConfig[] = [
  { label: 'Главная',   path: '/',             icon: HouseIcon },
  { label: 'Курс',      path: '/course',        icon: BookOpenIcon },
  { label: 'Практика',  path: '/practice',      icon: ZapIcon },
  { label: 'Профиль',  path: '/settings',      icon: UserIcon },
];

const TEACHER_TABS: TabConfig[] = [
  { label: 'Главная',   path: '/',          icon: HouseIcon },
  { label: 'Проверка',  path: '/review-queue', icon: ClipboardIcon },
  { label: 'Профиль',   path: '/settings',  icon: UserIcon },
];

const ADMIN_TABS: TabConfig[] = [
  { label: 'Главная',   path: '/',          icon: HouseIcon },
  { label: 'Профиль',   path: '/settings',  icon: UserIcon },
];

function Tab({ label, path, icon: Icon }: TabConfig) {
  const navigate = useNavigate();
  const match = useMatch(path === '/' ? { path: '/', end: true } : path);
  const isActive = !!match;

  return (
    <button
      className={`bottom-tab-bar__item${isActive ? ' active' : ''}`}
      onClick={() => navigate(path)}
      aria-label={label}
    >
      <Icon size={22} />
      <span className="bottom-tab-bar__label">{label}</span>
    </button>
  );
}

export function BottomTabBar() {
  const role = useAuthStore((s) => s.profile?.role);
  const location = useLocation();
  const tabs = role === 'teacher' ? TEACHER_TABS : role === 'admin' ? ADMIN_TABS : STUDENT_TABS;

  if (location.pathname === '/lesson') return null;

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab) => (
        <Tab key={tab.path} {...tab} />
      ))}
    </nav>
  );
}
