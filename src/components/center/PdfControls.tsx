import { usePdfStore } from '../../stores/usePdfStore';
import { MinusIcon, PlusIcon } from '../../icons';

export function PdfControls() {
  const { currentPage, totalPages, scale, zoomIn, zoomOut, prevPage, nextPage, toggleFullscreen, isFullscreen } =
    usePdfStore();

  return (
    <div className="h-11 bg-rightpanel border-b border-border flex items-center justify-between px-4 gap-2 flex-shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-primary text-muted disabled:opacity-30 transition-colors"
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
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-primary text-muted disabled:opacity-30 transition-colors"
          aria-label="Следующая страница"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-primary text-muted transition-colors"
          aria-label="Уменьшить"
        >
          <MinusIcon />
        </button>
        <span className="text-xs font-normal text-muted min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-primary text-muted transition-colors"
          aria-label="Увеличить"
        >
          <PlusIcon />
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-primary text-muted transition-colors ml-1"
          aria-label="Полный экран"
        >
          {isFullscreen ? '\u2715' : '\u26F6'}
        </button>
      </div>
    </div>
  );
}
