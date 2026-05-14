import { useNavigate, useMatch } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import {
  HouseIcon,
  BookOpenIcon,
  ZapIcon,
  SettingsGearIcon,
  ClipboardIcon,
  UsersIcon,
  BarChartIcon,
} from '../../icons';

type TabConfig = { label: string; path: string; icon: React.ComponentType<{ size?: number }> };

const STUDENT_TABS: TabConfig[] = [
  { label: 'Главная',   path: '/',             icon: HouseIcon },
  { label: 'Уроки',    path: '/lesson',        icon: BookOpenIcon },
  { label: 'Задания',  path: '/assignments',   icon: ClipboardIcon },
  { label: 'Профиль',  path: '/settings',      icon: SettingsGearIcon },
];

const TEACHER_TABS: TabConfig[] = [
  { label: 'Главная',   path: '/',          icon: HouseIcon },
  { label: 'Задания',   path: '/teacher',   icon: ClipboardIcon },
  { label: 'Студенты',  path: '/students',  icon: UsersIcon },
  { label: 'Профиль',   path: '/settings',  icon: SettingsGearIcon },
];

const ADMIN_TABS: TabConfig[] = [
  { label: 'Главная',   path: '/',          icon: HouseIcon },
  { label: 'Уроки',     path: '/lesson',    icon: BookOpenIcon },
  { label: 'Аналитика', path: '/statistics',icon: BarChartIcon },
  { label: 'Профиль',   path: '/settings',  icon: SettingsGearIcon },
];

function Tab({ label, path, icon: Icon }: TabConfig) {
  const navigate = useNavigate();
  const match = useMatch(path === '/' ? { path: '/', end: true } : path);
  const isActive = !!match;
  const { currentLesson, allCompleted } = useLessonCatalog();

  function handleClick() {
    // If this is the lessons tab and course is done or no current lesson — go home
    if (path === '/lesson' && (allCompleted || !currentLesson)) {
      navigate('/');
      return;
    }
    navigate(path);
  }

  return (
    <button
      className={`bottom-tab-bar__item${isActive ? ' active' : ''}`}
      onClick={handleClick}
      aria-label={label}
    >
      <Icon size={22} />
      <span className="bottom-tab-bar__label">{label}</span>
    </button>
  );
}

export function BottomTabBar() {
  const role = useAuthStore((s) => s.profile?.role);
  const tabs = role === 'teacher' ? TEACHER_TABS : role === 'admin' ? ADMIN_TABS : STUDENT_TABS;

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab) => (
        <Tab key={tab.path} {...tab} />
      ))}
    </nav>
  );
}
