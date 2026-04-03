import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { HamburgerIcon, FlameIcon } from '../../icons';
import type { SectionType } from '../../types/lesson';

const VIEW_TITLES: Record<SectionType, { title: string; subtitle?: string }> = {
  home: { title: 'Главная' },
  lesson: { title: 'Урок 3' },
  video: { title: 'Видео' },
  audio: { title: 'Аудио' },
  practice: { title: 'Тренировка' },
  dictionary: { title: 'Словарь' },
  notes: { title: 'Заметки' },
  'live-lessons': { title: 'Живые уроки' },
  statistics: { title: 'Статистика' },
  settings: { title: 'Настройки' },
};

export function MobileHeader() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const currentView = useAppStore((s) => s.currentView);
  const streak = useStreakStore((s) => s.currentStreak);
  const currentPage = useLessonStore((s) => s.currentPage);
  const totalPages = useLessonStore((s) => s.totalPages);

  const isLesson = currentView === 'lesson';
  const { title, subtitle } = VIEW_TITLES[currentView] ?? { title: 'Sovorir' };

  return (
    <header className="mobile-header h-14 flex items-center px-4 gap-3 flex-shrink-0 z-30 relative">
      {isLesson ? (
        <button
          className="mobile-header__btn"
          onClick={() => setCurrentView('home')}
          aria-label="Назад"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => toggleSidebar()}
          className="mobile-header__btn"
          aria-label="Меню"
        >
          <HamburgerIcon />
        </button>
      )}

      {isLesson ? (
        <div className="lesson-header__dots">
          {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => (
            <span key={i} className={`lesson-header__dot ${i < currentPage ? 'lesson-header__dot--done' : ''}`} />
          ))}
        </div>
      ) : (
        <>
          <span className="flex-1 text-lg font-semibold text-dark">{title}</span>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </>
      )}

      <div className="mobile-header__streak">
        <FlameIcon size={16} />
        <span>{streak}</span>
      </div>
    </header>
  );
}
