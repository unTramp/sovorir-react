import { useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';
import { completedRecordIndicesFromAttempts, latestLessonAttemptId } from '../../lib/interactionResume';
import { LessonSectionView } from './LessonPageView';
import { useAppStore } from '../../stores/useAppStore';

const EMPTY_COMPLETED_RECORDS: number[] = [];

export function LessonView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lessons = [], currentLesson, hasLoaded } = useLessonCatalog();
  const selectedLessonId = useAppStore((state) => state.currentLesson);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId && lesson.status !== 'locked');
  const lessonToOpen = selectedLesson ?? currentLesson;
  const currentLessonId = lessonToOpen?.id;
  const lessonApiId = lessonToOpen?.apiId;
  const selectLesson = useLessonSectionsStore((state) => state.selectLesson);
  const hydrateLessonAttempts = useInteractionAttemptStore((state) => state.hydrateLessonAttempts);
  const attempts = useInteractionAttemptStore((state) => state.attempts);
  const adoptAttemptId = useLessonAttemptSessionStore((state) => state.adoptAttemptId);
  const activeAttemptId = useLessonAttemptSessionStore((state) => (
    lessonApiId ? state.attemptIds[lessonApiId] : undefined
  ));

  // Redirect to home if course complete or no current lesson (once catalog is loaded)
  useEffect(() => {
    if (hasLoaded && !lessonToOpen) {
      navigate('/', { replace: true });
    }
  }, [hasLoaded, lessonToOpen, navigate]);
  const isFullscreen = useLessonStore((s) => s.isFullscreen);
  const currentSection = useLessonStore((s) => s.currentSection);
  const setCurrentSection = useLessonStore((s) => s.setCurrentSection);
  const setTotalSections = useLessonStore((s) => s.setTotalSections);
  const completeRecord = useLessonProgress((s) => s.completeRecord);
  const retryRecord = useLessonProgress((s) => s.retryRecord);
  const sectionProgress = useLessonProgress((s) => s.sections[currentSection]);
  const allSections = useLessonSectionsStore((s) => s.sections);
  const sectionsLoading = useLessonSectionsStore((s) => s.isLoading);
  const sectionsError = useLessonSectionsStore((s) => s.error);
  const reloadSections = useLessonSectionsStore((s) => s.reload);
  const attemptList = useMemo(() => Object.values(attempts), [attempts]);

  useEffect(() => {
    if (!lessonToOpen) return;
    selectLesson(lessonToOpen.apiId);
    reloadSections(true);
  }, [currentLessonId, lessonToOpen, reloadSections, selectLesson]);

  useEffect(() => {
    if (!lessonApiId) return;
    void hydrateLessonAttempts(lessonApiId);
  }, [hydrateLessonAttempts, lessonApiId]);

  useEffect(() => {
    if (!lessonApiId || lessonToOpen?.status !== 'current' || activeAttemptId) return;
    const latestAttemptId = latestLessonAttemptId(attemptList, lessonApiId);
    if (latestAttemptId) adoptAttemptId(lessonApiId, latestAttemptId);
  }, [activeAttemptId, adoptAttemptId, attemptList, lessonApiId, lessonToOpen?.status]);

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

  const currentSectionData = useMemo(
    () => allSections.find((item) => item.id === currentSection),
    [allSections, currentSection],
  );

  const hydratedCompletedRecords = useMemo(() => {
    if (sectionProgress || lessonToOpen?.status !== 'current') return EMPTY_COMPLETED_RECORDS;
    return completedRecordIndicesFromAttempts(currentSectionData, attemptList, activeAttemptId);
  }, [activeAttemptId, attemptList, currentSectionData, lessonToOpen?.status, sectionProgress]);

  useEffect(() => {
    if (sectionProgress || hydratedCompletedRecords.length === 0) return;
    useLessonProgress.setState((state) => {
      if (state.sections[currentSection]) return {};
      return {
        sections: {
          ...state.sections,
          [currentSection]: {
            completedRecords: hydratedCompletedRecords,
            completed: false,
            completionStatus: 'idle',
          },
        },
      };
    });
  }, [currentSection, hydratedCompletedRecords, sectionProgress]);

  const completedSet = sectionProgress?.completedRecords ?? hydratedCompletedRecords;
  const completedRecords = completedSet.length;

  const nextRecordIndex = useMemo(() => {
    const section = currentSectionData;
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
  }, [completedSet, currentSectionData]);

  const handleRecordComplete = useCallback(() => {
    completeRecord(currentSection, nextRecordIndex);
  }, [completeRecord, currentSection, nextRecordIndex]);

  const handleRecordRetry = useCallback((recordIndex: number) => {
    retryRecord(currentSection, recordIndex);
  }, [currentSection, retryRecord]);

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
        onRecordRetry={handleRecordRetry}
      />
    </div>
  );
}
