import { lessons } from '../../data/lessons';
import { SectionItem } from './SectionItem';

export function LessonSections() {
  const currentLesson = lessons.find((l) => l.status === 'current') || lessons[0];

  return (
    <div className="flex-1 overflow-y-auto py-2 px-2 min-h-0" role="tree" aria-label="Навигация по урокам">
      {/* Current Lesson Header */}
      <div className="px-2 pt-2 pb-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 px-2">
          Урок {currentLesson.id}
        </div>
        <div className="text-base font-semibold text-dark px-2 leading-snug">
          {currentLesson.title}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-0.5 pb-4" role="list">
        {currentLesson.sections.map((section) => (
          <SectionItem key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
