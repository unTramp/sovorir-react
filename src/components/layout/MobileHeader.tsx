import { useNavigate, useMatch, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { HamburgerIcon, FlameIcon, BackArrowIcon } from '../../icons';
import type { SectionType } from '../../types/lesson';

const VIEW_TITLES: Partial<Record<SectionType, { title: string; subtitle?: string }>> & Record<string, { title: string; subtitle?: string }> = {
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

function pathnameToKey(pathname: string): string {
  return pathname === '/' ? 'home' : pathname.slice(1);
}

export function MobileHeader() {
  const navigate = useNavigate();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const streak = useStreakStore((s) => s.currentStreak);
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const location = useLocation();
  const lessonMatch = useMatch('/lesson');
  const isLesson = !!lessonMatch;

  const { title, subtitle } = VIEW_TITLES[pathnameToKey(location.pathname)] ?? { title: 'Sovorir' };

  return (
    <header className="mobile-header h-14 flex items-center px-4 gap-3 flex-shrink-0 z-30 relative">
      {isLesson ? (
        <button
          className="mobile-header__btn"
          onClick={() => navigate('/')}
          aria-label="Назад"
        >
          <BackArrowIcon />
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
          {totalSections > 0 && Array.from({ length: totalSections }, (_, i) => (
            <span key={i} className={`lesson-header__dot ${i < currentSection ? 'lesson-header__dot--done' : ''}`} />
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
