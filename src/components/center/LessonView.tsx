import { useEffect, useMemo, useCallback } from 'react';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { lessonPages } from '../../data/lessonPages';
import { LessonControls } from './LessonControls';
import { LessonPageView } from './LessonPageView';

export function LessonView() {
  const isFullscreen = useLessonStore((s) => s.isFullscreen);
  const currentPage = useLessonStore((s) => s.currentPage);
  const setTotalPages = useLessonStore((s) => s.setTotalPages);
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
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'lesson-fullscreen' : ''}`}>
      <LessonControls totalRecords={totalRecords} completedRecords={completedRecords} />
      <LessonPageView
        completedRecords={completedRecords}
        onRecordComplete={handleRecordComplete}
      />
    </div>
  );
}
