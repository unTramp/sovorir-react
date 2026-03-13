import { usePdfStore } from '../../stores/usePdfStore';

interface Props {
  totalRecords?: number;
  completedRecords?: number;
}

export function PdfControls({ totalRecords = 0, completedRecords = 0 }: Props) {
  const { currentPage, totalPages, prevPage, nextPage, toggleFullscreen, isFullscreen } =
    usePdfStore();

  return (
    <div className="h-11 bg-content border-b border-border flex items-center px-4 gap-2 flex-shrink-0">
      <span className="text-base font-semibold text-dark flex-shrink-0">Материалы урока</span>

      {/* Progress dots — centered */}
      <div className="flex-1 flex justify-center">
        {totalRecords > 0 && (
          <div className="lesson-progress">
            {Array.from({ length: totalRecords }, (_, i) => (
              <div
                key={i}
                className={`lesson-progress__dot ${i < completedRecords ? 'completed' : i === completedRecords ? 'current' : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-accent text-muted disabled:opacity-30 transition-colors"
          aria-label="Предыдущая страница"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-normal text-muted min-w-[50px] text-center">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-accent text-muted disabled:opacity-30 transition-colors"
          aria-label="Следующая страница"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-accent text-muted transition-colors ml-1"
          aria-label="Полный экран"
        >
          {isFullscreen ? '\u2715' : '\u26F6'}
        </button>
      </div>
    </div>
  );
}
