import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { FlameIcon, HouseIcon, BrainIcon, FilmIcon } from '../../icons';
import { LessonSections } from './LessonSections';
import { StudentProfile } from '../audio/StudentProfile';
import { ProgressCircle } from './ProgressCircle';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { SectionType } from '../../types/lesson';

function StandaloneNavItem({ label, icon, viewId }: { label: string; icon: React.ReactNode; viewId: SectionType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { isDesktop } = useMediaQuery();

  const path = viewId === 'home' ? '/' : `/${viewId}`;
  const isActive = location.pathname === path;

  function handleClick() {
    setActiveSection(viewId);
    navigate(path);
    if (!isDesktop) toggleSidebar(false);
  }

  return (
    <div
      className={`sidebar-tree-item flex items-center gap-2 text-[13px] ${isActive ? 'active' : ''}`}
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function StreakBadge() {
  const streak = useStreakStore((s) => s.currentStreak);
  if (streak <= 0) return null;
  return <span className="home-streak" style={{ fontSize: 11, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><FlameIcon size={11} /> {streak}</span>;
}

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <aside
      className={`sidebar-desktop flex flex-col h-full overflow-hidden ${
        sidebarOpen ? 'open' : ''
      }`}
    >
      <StudentProfile />
      <ProgressCircle />
      <div className="px-2 space-y-2 pt-2 pb-2">
        <div className="flex items-center gap-2">
          <StandaloneNavItem label="Главная" icon={<HouseIcon size={16} />} viewId="home" />
          <StreakBadge />
        </div>
      </div>
      <LessonSections />
      <div className="px-2 space-y-2 pt-2 pb-2">
        <StandaloneNavItem label="Тренировка" icon={<BrainIcon />} viewId="practice" />
        <StandaloneNavItem label="Живые уроки" icon={<FilmIcon size={16} />} viewId="live-lessons" />
      </div>
      <div className="sidebar-ararat">
        <img src="/assets/ararat.png" alt="" />
      </div>
    </aside>
  );
}
