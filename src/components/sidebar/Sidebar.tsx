import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { FlameIcon } from '../../icons';
import { LessonSections } from './LessonSections';
import { StudentProfile } from '../audio/StudentProfile';
import { ProgressCircle } from './ProgressCircle';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { SectionType } from '../../types/lesson';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 4.9 4 4.5 4.5 0 0 1 2.1 4 5 5 0 0 1-2 4v1a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-1a5 5 0 0 1-2-4 4.5 4.5 0 0 1 2.1-4A5 5 0 0 1 12 2z" />
      <path d="M12 2v16" />
      <path d="M8 8h8" />
      <path d="M9 12h6" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 10l6-3v10l-6-3" />
    </svg>
  );
}

function StandaloneNavItem({ label, icon, viewId }: { label: string; icon: React.ReactNode; viewId: SectionType }) {
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { isDesktop } = useMediaQuery();

  const isActive = activeSection === viewId;

  function handleClick() {
    setActiveSection(viewId);
    setCurrentView(viewId);
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
          <StandaloneNavItem label="Главная" icon={<HomeIcon />} viewId="home" />
          <StreakBadge />
        </div>
      </div>
      <LessonSections />
      <div className="px-2 space-y-2 pt-2 pb-2">
        <StandaloneNavItem label="Тренировка" icon={<BrainIcon />} viewId="practice" />
        <StandaloneNavItem label="Живые уроки" icon={<VideoIcon />} viewId="live-lessons" />
      </div>
      <div className="sidebar-ararat">
        <img src="/assets/ararat.png" alt="" />
      </div>
    </aside>
  );
}
