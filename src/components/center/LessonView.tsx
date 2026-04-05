import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { contentRepository } from '../../lib/contentRepository';
import { LessonSectionView } from './LessonPageView';
import type { LessonContentSection } from '../../types/lessonContent';

const EMPTY_COMPLETED_RECORDS: number[] = [];

export function LessonView() {
  const [allSections, setAllSections] = useState<LessonContentSection[]>([]);
  const isFullscreen = useLessonStore((s) => s.isFullscreen);
  const currentSection = useLessonStore((s) => s.currentSection);
  const setTotalSections = useLessonStore((s) => s.setTotalSections);
  const completeRecord = useLessonProgress((s) => s.completeRecord);
  const sectionProgress = useLessonProgress((s) => s.sections[currentSection]);

  useEffect(() => {
    contentRepository.getLessonSections().then((sections) => {
      setAllSections(sections);
      setTotalSections(sections.length);
    });
  }, [setTotalSections]);

  const completedSet = sectionProgress?.completedRecords ?? EMPTY_COMPLETED_RECORDS;
  const completedRecords = completedSet.length;

  const nextRecordIndex = useMemo(() => {
    const section = allSections.find((item) => item.id === currentSection);
    if (!section) return 0;
    let recordCounter = 0;
    for (let i = 0; i < section.blocks.length; i++) {
      if (section.blocks[i].type === 'record') {
        if (!completedSet.includes(recordCounter)) return recordCounter;
        recordCounter++;
      }
    }
    return recordCounter;
  }, [allSections, completedSet, currentSection]);

  const handleRecordComplete = useCallback(() => {
    completeRecord(currentSection, nextRecordIndex);
  }, [completeRecord, currentSection, nextRecordIndex]);

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'lesson-fullscreen' : ''}`}>
      <LessonSectionView
        completedRecords={completedRecords}
        onRecordComplete={handleRecordComplete}
      />
    </div>
  );
}
