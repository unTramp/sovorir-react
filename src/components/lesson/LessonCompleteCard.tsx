import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { contentRepository } from '../../lib/contentRepository';
import { QuizContainer } from '../quiz/QuizContainer';
import type { Quiz, QuizResult } from '../../types/quiz';

export function LessonCompleteCard() {
  const navigate = useNavigate();
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const nextSection = useLessonStore((s) => s.nextSection);
  const completeSection = useLessonProgress((s) => s.completeSection);
  const isSectionCompleted = useLessonProgress((s) => s.isSectionCompleted(currentSection));
  const isQuizPassed = useLessonProgress((s) => s.isQuizPassed(currentSection));
  const saveQuizResult = useLessonProgress((s) => s.saveQuizResult);

  const allSections = useLessonSectionsStore((s) => s.sections);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

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
        {isLastSection && isCurrentSectionDone ? (
          <button
            className="lesson-complete__btn"
            onClick={() => navigate('/')}
          >
            На главную
          </button>
        ) : (
          <button
            className="lesson-complete__btn"
            onClick={needsQuiz ? undefined : handleContinue}
            disabled={needsQuiz}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {quiz && (
        <div className="mt-4">
          <QuizContainer quiz={quiz} onComplete={handleQuizComplete} />
        </div>
      )}
    </>
  );
}
