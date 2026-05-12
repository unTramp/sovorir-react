import { useNavigate, useMatch } from 'react-router-dom';
import { HouseIcon, BookOpenIcon, ZapIcon, SettingsGearIcon } from '../../icons';

const TABS = [
  { label: 'Главная',  path: '/',         icon: HouseIcon },
  { label: 'Уроки',   path: '/lesson',    icon: BookOpenIcon },
  { label: 'Тренажёр', path: '/practice', icon: ZapIcon },
  { label: 'Профиль', path: '/settings',  icon: SettingsGearIcon },
] as const;

function Tab({ label, path, icon: Icon }: (typeof TABS)[number]) {
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
  return (
    <nav className="bottom-tab-bar">
      {TABS.map((tab) => (
        <Tab key={tab.path} {...tab} />
      ))}
    </nav>
  );
}
