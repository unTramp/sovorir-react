import { useEffect, useMemo, useCallback } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { LessonSectionView } from './LessonPageView';

type LessonTab = 'materials' | 'dictionary' | 'audio' | 'video';

const LESSON_TABS: { id: LessonTab; label: string }[] = [
  { id: 'materials', label: 'Материалы' },
  { id: 'dictionary', label: 'Словарь' },
  { id: 'audio', label: 'Аудио' },
  { id: 'video', label: 'Видео' },
];

const EMPTY_COMPLETED_RECORDS: number[] = [];

export function LessonView() {
  const [activeTab, setActiveTab] = useState<LessonTab>('materials');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLesson, allCompleted, hasLoaded } = useLessonCatalog();

  // Redirect to home if course complete or no current lesson (once catalog is loaded)
  useEffect(() => {
    if (hasLoaded && (allCompleted || !currentLesson)) {
      navigate('/', { replace: true });
    }
  }, [hasLoaded, allCompleted, currentLesson, navigate]);
  const isFullscreen = useLessonStore((s) => s.isFullscreen);
  const currentSection = useLessonStore((s) => s.currentSection);
  const setCurrentSection = useLessonStore((s) => s.setCurrentSection);
  const setTotalSections = useLessonStore((s) => s.setTotalSections);
  const completeRecord = useLessonProgress((s) => s.completeRecord);
  const sectionProgress = useLessonProgress((s) => s.sections[currentSection]);
  const allSections = useLessonSectionsStore((s) => s.sections);

  // Sync totalSections into useLessonStore whenever sections change
  useEffect(() => {
    setTotalSections(allSections.length);
  }, [allSections.length, setTotalSections]);

  // Jump to section from URL query param
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
