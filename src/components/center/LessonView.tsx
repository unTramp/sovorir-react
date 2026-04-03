import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { contentRepository } from '../../lib/contentRepository';
import { LessonPageView } from './LessonPageView';
import type { LessonPage } from '../../types/lessonContent';

export function LessonView() {
  const [allPages, setAllPages] = useState<LessonPage[]>([]);
  const isFullscreen = useLessonStore((s) => s.isFullscreen);
  const currentPage = useLessonStore((s) => s.currentPage);
  const setTotalPages = useLessonStore((s) => s.setTotalPages);
  const { completeRecord, getCompletedCount } = useLessonProgress();

  useEffect(() => {
    contentRepository.getLessonPages().then((pages) => {
      setAllPages(pages);
      setTotalPages(pages.length);
    });
  }, [setTotalPages]);

  const pageTitles = useMemo(() => allPages.map((page) => {
    const heading = page.blocks.find((b) => b.type === 'heading');
    return heading?.type === 'heading' ? heading.text : `Часть ${page.id}`;
  }), [allPages]);

  const completedRecords = getCompletedCount(currentPage);

  const nextRecordIndex = useMemo(() => {
    const page = allPages.find((p) => p.id === currentPage);
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
  }, [currentPage, completedRecords, allPages]);

  const handleRecordComplete = useCallback(() => {
    completeRecord(currentPage, nextRecordIndex);
  }, [completeRecord, currentPage, nextRecordIndex]);

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'lesson-fullscreen' : ''}`}>
      <LessonPageView
        completedRecords={completedRecords}
        onRecordComplete={handleRecordComplete}
      />
    </div>
  );
}
