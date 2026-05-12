import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { contentRepository } from '../../lib/contentRepository';
import { LessonSectionView } from './LessonPageView';
import type { LessonContentSection } from '../../types/lessonContent';
import {
  subscribeAdminLessonBuilderSync,
} from '../../lib/adminLessonBuilderStorage';

type LessonTab = 'materials' | 'dictionary' | 'audio' | 'video';

const LESSON_TABS: { id: LessonTab; label: string }[] = [
  { id: 'materials', label: 'Материалы' },
  { id: 'dictionary', label: 'Словарь' },
  { id: 'audio', label: 'Аудио' },
  { id: 'video', label: 'Видео' },
];

const EMPTY_COMPLETED_RECORDS: number[] = [];

export function LessonView() {
  const [allSections, setAllSections] = useState<LessonContentSection[]>([]);
  const [activeTab, setActiveTab] = useState<LessonTab>('materials');
  const location = useLocation();
  const isFullscreen = useLessonStore((s) => s.isFullscreen);
  const currentSection = useLessonStore((s) => s.currentSection);
  const setCurrentSection = useLessonStore((s) => s.setCurrentSection);
  const setTotalSections = useLessonStore((s) => s.setTotalSections);
  const completeRecord = useLessonProgress((s) => s.completeRecord);
  const sectionProgress = useLessonProgress((s) => s.sections[currentSection]);

  const loadSections = useCallback(() => {
    contentRepository.getLessonSections().then((sections) => {
      setAllSections(sections);
      setTotalSections(sections.length);
    });
  }, [setTotalSections]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (!allSections.length) return;
    const params = new URLSearchParams(location.search);
    const requestedSection = Number(params.get('section'));
    if (!Number.isFinite(requestedSection) || requestedSection < 1) return;

    const boundedSection = Math.min(allSections.length, Math.max(1, requestedSection));
    if (boundedSection !== currentSection) {
      setCurrentSection(boundedSection);
    }
  }, [allSections.length, currentSection, location.search, setCurrentSection]);

  useEffect(() => {
    function handleSync() {
      loadSections();
    }

    function handleFocus() {
      loadSections();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadSections();
      }
    }

    const unsubscribeSync = subscribeAdminLessonBuilderSync(handleSync);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      unsubscribeSync();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadSections]);

  const completedSet = sectionProgress?.completedRecords ?? EMPTY_COMPLETED_RECORDS;
  const completedRecords = completedSet.length;

  const nextRecordIndex = useMemo(() => {
    const section = allSections.find((item) => item.id === currentSection);
    if (!section) return 0;
    let recordCounter = 0;
    for (let i = 0; i < section.blocks.length; i++) {
      if (section.blocks[i].type === 'record' || section.blocks[i].type === 'pronunciationPrompt') {
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
      <div className="lesson-tabs">
        {LESSON_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`lesson-tabs__item${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <LessonSectionView
        completedRecords={completedRecords}
        onRecordComplete={handleRecordComplete}
        activeTab={activeTab}
      />
    </div>
  );
}
