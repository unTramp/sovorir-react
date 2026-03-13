import { useLessonStore } from '../../stores/useLessonStore';

interface Props {
  pageTitles?: string[];
}

export function LessonControls({ pageTitles }: Props) {
  const { currentPage, totalPages, prevPage, nextPage, toggleFullscreen, isFullscreen } =
    useLessonStore();

  return (
    <div className="lesson-controls">
      <button
        onClick={prevPage}
        disabled={currentPage <= 1}
        className="lesson-controls__chevron"
        aria-label="Предыдущая страница"
      >
        ‹
      </button>
      <div className="lesson-controls__center">
        <span className="lesson-controls__title">{pageTitles?.[currentPage - 1]}</span>
      </div>
      {totalPages > 1 && (
        <div className="lesson-controls__dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i}
              className={`lesson-controls__dot ${i + 1 === currentPage ? 'current' : ''}`}
            />
          ))}
        </div>
      )}
      <button
        onClick={nextPage}
        disabled={currentPage >= totalPages}
        className="lesson-controls__chevron"
        aria-label="Следующая страница"
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
