import { useLessonStore } from '../../stores/useLessonStore';

interface Props {
  sectionTitles?: string[];
}

export function LessonControls({ sectionTitles }: Props) {
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const prevSection = useLessonStore((s) => s.prevSection);
  const nextSection = useLessonStore((s) => s.nextSection);
  const toggleFullscreen = useLessonStore((s) => s.toggleFullscreen);
  const isFullscreen = useLessonStore((s) => s.isFullscreen);

  return (
    <div className="lesson-controls">
      <button
        onClick={prevSection}
        disabled={currentSection <= 1}
        className="lesson-controls__chevron"
        aria-label="Предыдущая секция"
      >
        ‹
      </button>
      <div className="lesson-controls__center">
        <span className="lesson-controls__title">{sectionTitles?.[currentSection - 1]}</span>
        {totalSections > 1 && (
          <div className="lesson-controls__dots">
            {Array.from({ length: totalSections }, (_, i) => (
              <span
                key={i}
                className={`lesson-controls__dot ${i + 1 === currentSection ? 'current' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={nextSection}
        disabled={currentSection >= totalSections}
        className="lesson-controls__chevron"
        aria-label="Следующая секция"
      >
        ›
      </button>
      <button
        onClick={toggleFullscreen}
        className="lesson-controls__fullscreen"
        aria-label="Полный экран"
      >
        {isFullscreen ? '\u2715' : '\u26F6'}
      </button>
    </div>
  );
}
