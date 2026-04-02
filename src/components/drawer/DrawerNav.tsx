import { DrawerItem } from './DrawerItem';
import { lessons } from '../../data/lessons';
import { useAppStore } from '../../stores/useAppStore';

function HouseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 10l6-3v10l-6-3" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" />
      <rect x="10" y="7" width="4" height="14" />
      <rect x="17" y="3" width="4" height="18" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function DrawerNav() {
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const currentView = useAppStore((s) => s.currentView);

  const currentLesson = lessons.find((l) => l.status === 'current') || lessons[0];
  const totalLessons = lessons.length;
  const lessonBadge = `${currentLesson.id} / ${totalLessons}`;

  function handleLessonsClick() {
    const firstLessonSection = currentLesson.sections.find((s) => s.type === 'lesson');
    setActiveSection(firstLessonSection?.id ?? 'lesson');
    setCurrentView('lesson');
    toggleSidebar(false);
  }

  return (
    <div className="py-2 px-3" role="list">
      <DrawerItem label="Главная" icon={<HouseIcon />} viewId="home" />

      {/* Уроки — custom click to navigate to lesson section */}
      <div
        className={`drawer-item${currentView === 'lesson' ? ' active' : ''}`}
        role="listitem"
        tabIndex={0}
        onClick={handleLessonsClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLessonsClick(); }
        }}
      >
        <span className="drawer-item__icon-box"><BookOpenIcon /></span>
        <span className="truncate flex-1">Уроки</span>
        <span className="drawer-item-badge">{lessonBadge}</span>
      </div>

      <DrawerItem label="Тренировка" icon={<ZapIcon />} viewId="practice" />
      <DrawerItem label="Живые уроки" icon={<VideoIcon />} viewId="live-lessons" pro />

    </div>
  );
}
