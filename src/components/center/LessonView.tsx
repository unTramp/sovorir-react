import { useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { LessonSectionView } from './LessonPageView';

const EMPTY_COMPLETED_RECORDS: number[] = [];

export function LessonView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLesson, allCompleted, hasLoaded } = useLessonCatalog();
  const currentLessonId = currentLesson?.id;

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
  const sectionsLoading = useLessonSectionsStore((s) => s.isLoading);
  const sectionsError = useLessonSectionsStore((s) => s.error);
  const reloadSections = useLessonSectionsStore((s) => s.reload);

  useEffect(() => {
    if (currentLessonId) reloadSections(true);
  }, [currentLessonId, reloadSections]);

  // Sync totalSections into useLessonStore whenever sections change
  useEffect(() => {
    setTotalSections(allSections.length);
  }, [allSections.length, setTotalSections]);

  // Jump to section from URL query param
  useEffect(() => {
    if (!allSections.length) return;
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get('section');

    if (!sectionParam) {
      navigate(`/lesson?section=${currentSection}`, { replace: true });
      return;
    }

    const requestedSection = Number(sectionParam);
    if (!Number.isFinite(requestedSection) || requestedSection < 1) return;

    const boundedSection = Math.min(allSections.length, Math.max(1, requestedSection));
    if (boundedSection !== currentSection) {
      setCurrentSection(boundedSection);
    }
  }, [allSections.length, currentSection, location.search, navigate, setCurrentSection]);

  const completedSet = sectionProgress?.completedRecords ?? EMPTY_COMPLETED_RECORDS;
  const completedRecords = completedSet.length;

  const nextRecordIndex = useMemo(() => {
    const section = allSections.find((item) => item.id === currentSection);
    if (!section) return 0;
    let recordCounter = 0;
    for (let i = 0; i < section.blocks.length; i++) {
      const blockType = section.blocks[i].type;
      if (blockType === 'record' || blockType === 'pronunciationPrompt' || blockType === 'dialogue' || blockType === 'activeRecall') {
        if (!completedSet.includes(recordCounter)) return recordCounter;
        recordCounter++;
      }
    }
    return recordCounter;
  }, [allSections, completedSet, currentSection]);

  const handleRecordComplete = useCallback(() => {
    completeRecord(currentSection, nextRecordIndex);
  }, [completeRecord, currentSection, nextRecordIndex]);

  if (sectionsLoading && allSections.length === 0) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Загружаем урок…</div>;
  }

  if (sectionsError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-base font-semibold text-dark">Не удалось загрузить урок</div>
        <div className="max-w-sm text-sm text-muted">Проверьте соединение и попробуйте ещё раз.</div>
        <button className="btn btn--primary btn--md" onClick={() => reloadSections(true)}>Повторить</button>
      </div>
    );
  }

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'lesson-fullscreen' : ''}`}>
      <LessonSectionView
        completedRecords={completedRecords}
        onRecordComplete={handleRecordComplete}
      />
    </div>
  );
}
