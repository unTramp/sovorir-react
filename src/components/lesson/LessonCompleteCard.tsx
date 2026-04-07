import { useState, useEffect, useCallback } from 'react';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { contentRepository } from '../../lib/contentRepository';
import { QuizContainer } from '../quiz/QuizContainer';
import type { LessonContentSection } from '../../types/lessonContent';
import type { Quiz, QuizResult } from '../../types/quiz';
import {
  subscribeAdminLessonBuilderSync,
} from '../../lib/adminLessonBuilderStorage';

export function LessonCompleteCard() {
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const nextSection = useLessonStore((s) => s.nextSection);
  const completeSection = useLessonProgress((s) => s.completeSection);
  const isSectionCompleted = useLessonProgress((s) => s.isSectionCompleted(currentSection));
  const isQuizPassed = useLessonProgress((s) => s.isQuizPassed(currentSection));
  const saveQuizResult = useLessonProgress((s) => s.saveQuizResult);

  const [allSections, setAllSections] = useState<LessonContentSection[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    contentRepository.getLessonSections().then(setAllSections);
  }, []);

  useEffect(() => {
    const loadSections = () => {
      contentRepository.getLessonSections().then(setAllSections);
    };

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
  }, []);

  useEffect(() => {
    contentRepository.getQuizForSection(currentSection).then(setQuiz);
  }, [currentSection]);

  const section = allSections.find((item) => item.id === currentSection);
  const nextSectionData = allSections.find((item) => item.id === currentSection + 1);

  const currentHeading = section?.blocks.find((b) => b.type === 'heading');

  const nextHeading = nextSectionData?.blocks.find((b) => b.type === 'heading');
  const nextSectionTitle = nextSectionData?.title ?? (nextHeading?.type === 'heading' ? nextHeading.text : '');

  const isLastSection = currentSection >= totalSections;
  const needsQuiz = !!quiz && !isQuizPassed;
  const isCurrentSectionDone = isSectionCompleted;

  const handleQuizComplete = useCallback((result: QuizResult) => {
    saveQuizResult(currentSection, result);
  }, [currentSection, saveQuizResult]);

  const handleContinue = useCallback(() => {
    completeSection(currentSection);
    if (!isLastSection) {
      nextSection();
    }
  }, [completeSection, currentSection, isLastSection, nextSection]);

  const actionLabel = isLastSection
    ? (isCurrentSectionDone ? 'Урок завершён' : 'Завершить урок')
    : needsQuiz
      ? 'Пройдите тест'
      : 'Следующая секция';

  return (
    <>
      <div className="lesson-complete">
        <div className="lesson-complete__title">
          {section?.title ?? (currentHeading?.type === 'heading' ? currentHeading.text : 'Секция завершена')}
        </div>
        <div className="lesson-complete__summary">
          {isLastSection
            ? 'Это последняя секция урока.'
            : `Дальше: ${nextSectionTitle.toLowerCase() || 'следующая секция'}.`}
        </div>
        {!isLastSection && nextSectionTitle && (
          <div className="lesson-complete__next-hint">
            <img
              src="/assets/teacher-avatar.png"
              className="lesson-complete__avatar"
              alt="Лусине"
            />
            <span>Продолжить к: {nextSectionTitle.toLowerCase()}?</span>
          </div>
        )}
        <button
          className="lesson-complete__btn"
          onClick={needsQuiz ? undefined : handleContinue}
          disabled={needsQuiz || (isLastSection && isCurrentSectionDone)}
        >
          {actionLabel}
        </button>
      </div>
      {quiz && (
        <div className="mt-4">
          <QuizContainer quiz={quiz} onComplete={handleQuizComplete} />
        </div>
      )}
    </>
  );
}
