import { useEffect, useState, useMemo } from 'react';
import { usePdfStore } from '../../stores/usePdfStore';
import { lessonPages } from '../../data/lessonPages';
import { PdfControls } from './PdfControls';
import { LessonPageView } from './LessonPageView';

export function PdfView() {
  const isFullscreen = usePdfStore((s) => s.isFullscreen);
  const currentPage = usePdfStore((s) => s.currentPage);
  const setTotalPages = usePdfStore((s) => s.setTotalPages);
  const [completedRecords, setCompletedRecords] = useState(0);

  useEffect(() => {
    setTotalPages(lessonPages.length);
  }, [setTotalPages]);

  // Reset on page change
  useEffect(() => {
    setCompletedRecords(0);
  }, [currentPage]);

  const page = lessonPages.find((p) => p.id === currentPage);
  const totalRecords = useMemo(() => {
    if (!page) return 0;
    return page.blocks.filter((b) => b.type === 'record').length;
  }, [page]);

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'pdf-fullscreen' : ''}`}>
      <PdfControls totalRecords={totalRecords} completedRecords={completedRecords} />
      <LessonPageView
        completedRecords={completedRecords}
        onRecordComplete={() => setCompletedRecords((p) => p + 1)}
      />
    </div>
  );
}
