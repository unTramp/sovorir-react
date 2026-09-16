import { useNavigate, useMatch, useLocation } from 'react-router-dom';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { FlameIcon, BackArrowIcon } from '../../icons';
import { NotificationBell } from '../ui/NotificationBell';
import type { SectionType } from '../../types/lesson';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import { useAppStore } from '../../stores/useAppStore';

const VIEW_TITLES: Partial<Record<SectionType, { title: string; subtitle?: string }>> & Record<string, { title: string; subtitle?: string }> = {
  home:                  { title: 'Главная' },
  course:                { title: 'Курс' },
  lesson:                { title: 'Урок 3' },
  video:                 { title: 'Видео' },
  audio:                 { title: 'Аудио' },
  practice:              { title: 'Практика' },
  dictionary:            { title: 'Словарь' },
  notes:                 { title: 'Заметки' },
  'live-lessons':        { title: 'Живые уроки' },
  statistics:            { title: 'Статистика' },
  settings:              { title: 'Профиль' },
  assignments:           { title: 'Задания' },
  teacher:               { title: 'Преподаватель' },
  students:              { title: 'Студенты' },
  'review-queue':        { title: 'Очередь проверки' },
  consultations:         { title: 'Консультации' },
};

function pathnameToKey(pathname: string): string {
  return pathname === '/' ? 'home' : pathname.slice(1);
}

export function MobileHeader() {
  const navigate = useNavigate();
  const streak = useStreakStore((s) => s.currentStreak);
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const setCurrentSection = useLessonStore((s) => s.setCurrentSection);
  const { lessons = [], currentLesson } = useLessonCatalog();
  const selectedLessonId = useAppStore((state) => state.currentLesson);
  const lessonForHeader = lessons.find((lesson) => lesson.id === selectedLessonId) ?? currentLesson;
  const location = useLocation();
  const lessonMatch = useMatch('/lesson');
  const isLesson = !!lessonMatch;
  const showStreak = location.pathname === '/';

  const lessonHeaderTitle = lessonForHeader ? `Урок ${lessonForHeader.id}` : 'Урок';
  const lessonHeaderSubtitle = lessonForHeader?.title;
  const { title, subtitle } = isLesson
    ? { title: lessonHeaderTitle, subtitle: lessonHeaderSubtitle }
    : (VIEW_TITLES[pathnameToKey(location.pathname)] ?? { title: 'Sovorir' });

  const handleLessonBack = () => {
    if (currentSection > 1) {
      const previousSection = currentSection - 1;
      setCurrentSection(previousSection);
      navigate(`/lesson?section=${previousSection}`, { replace: true });
      return;
    }

    navigate('/course');
  };

  return (
    <header className="mobile-header h-14 flex items-center px-4 gap-3 flex-shrink-0 z-30 relative">
      {isLesson ? (
        <button
          className="mobile-header__btn"
          onClick={handleLessonBack}
          aria-label={currentSection > 1 ? 'Предыдущий шаг' : 'Выйти из урока'}
        >
          <BackArrowIcon />
        </button>
      ) : null}

      {isLesson ? (
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-dark truncate">{title}</div>
            {subtitle ? <div className="text-xs text-muted truncate">{subtitle}</div> : null}
          </div>
          <div className="lesson-header__progress" aria-label={`Шаг ${currentSection} из ${totalSections}`}>
            <span className="lesson-header__step">{currentSection} из {totalSections}</span>
            <span className="lesson-header__track" aria-hidden="true">
              <span
                className="lesson-header__fill"
                style={{ width: `${totalSections > 0 ? (currentSection / totalSections) * 100 : 0}%` }}
              />
            </span>
          </div>
        </div>
      ) : (
        <>
          <span className="flex-1 text-lg font-semibold text-dark">{title}</span>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </>
      )}

      {!isLesson && (
        <div className="mobile-header__right">
          {showStreak && (
            <div className="mobile-header__streak">
              <FlameIcon size={16} />
              <span>{streak}</span>
            </div>
          )}
          <NotificationBell />
        </div>
      )}
    </header>
  );
}
