import { useNavigate } from 'react-router-dom';
import { BackArrowIcon, CheckIcon, LockIcon } from '../../icons';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import type { Lesson } from '../../types/lesson';
import { useAppStore } from '../../stores/useAppStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { getLessonPath, getResumeSectionNumber } from '../../lib/lessonNavigation';

function lessonMeta(lesson: Lesson) {
  const availableSections = lesson.sections.filter((section) => section.type !== 'video');
  const completedSections = availableSections.filter((section) => section.status === 'completed').length;
  const percent = availableSections.length > 0
    ? Math.round((completedSections / availableSections.length) * 100)
    : 0;

  return { count: availableSections.length, percent };
}

export function CourseView() {
  const navigate = useNavigate();
  const { lessons, isLoading, error } = useLessonCatalog();
  const setCurrentLesson = useAppStore((state) => state.setCurrentLesson);
  const setCurrentSection = useLessonStore((state) => state.setCurrentSection);
  const selectLesson = useLessonSectionsStore((state) => state.selectLesson);

  const openLesson = (lesson: Lesson) => {
    const resumeSection = getResumeSectionNumber(lesson);
    setCurrentLesson(lesson.id);
    setCurrentSection(resumeSection);
    selectLesson(lesson.apiId);
    navigate(getLessonPath(lesson.apiId, resumeSection));
  };

  if (isLoading && lessons.length === 0) {
    return <div className="course-state">Загружаем курс…</div>;
  }

  if (error && lessons.length === 0) {
    return <div className="course-state">Не удалось загрузить курс</div>;
  }

  return (
    <div className="course-screen">
      <div className="course-intro">
        <span className="course-intro__eyebrow">Ваш путь</span>
        <h1>Армянский для общения</h1>
        <p>Короткие последовательные уроки с голосом преподавателя и практикой.</p>
      </div>

      <div className="course-list" aria-label="Уроки курса">
        {lessons.map((lesson) => {
          const { count, percent } = lessonMeta(lesson);
          const isLocked = lesson.status === 'locked';
          const isCompleted = lesson.status === 'completed';

          return (
            <button
              key={lesson.id}
              className={`course-card course-card--${lesson.status} ${lesson.status === 'current' ? 'surface-card--interactive' : 'surface-card'}`}
              type="button"
              disabled={isLocked}
              onClick={() => openLesson(lesson)}
            >
              <span className="course-card__number">
                {isCompleted ? <CheckIcon /> : isLocked ? <LockIcon /> : lesson.id}
              </span>
              <span className="course-card__content">
                <span className="course-card__status">
                  {isCompleted ? 'Можно повторить' : isLocked ? 'Откроется после предыдущего урока' : 'Текущий урок'}
                </span>
                <span className="course-card__title">{lesson.title}</span>
                <span className="course-card__meta">{count} {count === 1 ? 'раздел' : count < 5 ? 'раздела' : 'разделов'}</span>
                {!isLocked && (
                  <span className="course-card__progress" aria-label={`Пройдено ${percent}%`}>
                    <span style={{ width: `${percent}%` }} />
                  </span>
                )}
              </span>
              {!isLocked && <span className="course-card__arrow"><BackArrowIcon /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
