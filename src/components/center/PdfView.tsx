import { useEffect, useMemo, useCallback } from 'react';
import { usePdfStore } from '../../stores/usePdfStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { lessonPages } from '../../data/lessonPages';
import { PdfControls } from './PdfControls';
import { LessonPageView } from './LessonPageView';

export function PdfView() {
  const isFullscreen = usePdfStore((s) => s.isFullscreen);
  const currentPage = usePdfStore((s) => s.currentPage);
  const setTotalPages = usePdfStore((s) => s.setTotalPages);
  const { completeRecord, getCompletedCount, getTotalRecords } = useLessonProgress();

  useEffect(() => {
    setTotalPages(lessonPages.length);
  }, [setTotalPages]);

  const completedRecords = getCompletedCount(currentPage);
  const totalRecords = getTotalRecords(currentPage);

  // Find the next incomplete record index for this page
  const nextRecordIndex = useMemo(() => {
    const page = lessonPages.find((p) => p.id === currentPage);
    if (!page) return 0;
    const completedSet = useLessonProgress.getState().pages[currentPage]?.completedRecords || [];
    let recordCounter = 0;
    for (let i = 0; i < page.blocks.length; i++) {
      if (page.blocks[i].type === 'record') {
        if (!completedSet.includes(recordCounter)) return recordCounter;
        recordCounter++;
      }
    }
    return recordCounter;
  }, [currentPage, completedRecords]);

  const handleRecordComplete = useCallback(() => {
    completeRecord(currentPage, nextRecordIndex);
  }, [completeRecord, currentPage, nextRecordIndex]);

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'pdf-fullscreen' : ''}`}>
      <PdfControls totalRecords={totalRecords} completedRecords={completedRecords} />
      <LessonPageView
        completedRecords={completedRecords}
        onRecordComplete={handleRecordComplete}
      />
    </div>
  );
}
