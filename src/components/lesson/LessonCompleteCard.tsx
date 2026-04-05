import { useState, useEffect, useCallback } from 'react';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { contentRepository } from '../../lib/contentRepository';
import { QuizContainer } from '../quiz/QuizContainer';
import type { LessonContentSection } from '../../types/lessonContent';
import type { Quiz, QuizResult } from '../../types/quiz';

export function LessonCompleteCard() {
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const nextSection = useLessonStore((s) => s.nextSection);
  const isQuizPassed = useLessonProgress((s) => s.isQuizPassed(currentSection));
  const saveQuizResult = useLessonProgress((s) => s.saveQuizResult);

  const [allSections, setAllSections] = useState<LessonContentSection[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    contentRepository.getLessonSections().then(setAllSections);
  }, []);

  useEffect(() => {
    contentRepository.getQuizForSection(currentSection).then(setQuiz);
  }, [currentSection]);

  const section = allSections.find((item) => item.id === currentSection);
  const nextSectionData = allSections.find((item) => item.id === currentSection + 1);

  const currentHeading = section?.blocks.find((b) => b.type === 'heading');
  const summaryText = section?.title ?? (currentHeading?.type === 'heading' ? currentHeading.text : 'эту секцию');

  const nextHeading = nextSectionData?.blocks.find((b) => b.type === 'heading');
  const nextSectionTitle = nextSectionData?.title ?? (nextHeading?.type === 'heading' ? nextHeading.text : '');

  const isLastSection = currentSection >= totalSections;
  const needsQuiz = !!quiz && !isQuizPassed;

  const handleQuizComplete = useCallback((result: QuizResult) => {
    saveQuizResult(currentSection, result);
  }, [currentSection, saveQuizResult]);

  return (
    <>
      <div className="lesson-complete">
        <div className="lesson-complete__emoji">🎉</div>
        <div className="lesson-complete__title">Отлично!</div>
        <div className="lesson-complete__summary">
          Вы изучили: {summaryText.toLowerCase()}.
        </div>
        {!isLastSection && nextSectionTitle && (
          <div className="lesson-complete__next-hint">
            <img
              src="/assets/teacher-avatar.png"
              className="lesson-complete__avatar"
              alt="Лусине"
            />
            <span>Готовы перейти к: {nextSectionTitle.toLowerCase()}?</span>
          </div>
        )}
        <button
          className="lesson-complete__btn"
          onClick={isLastSection ? undefined : nextSection}
          disabled={isLastSection || needsQuiz}
        >
          {isLastSection ? 'Урок завершён ✓' : needsQuiz ? 'Пройдите тест ↓' : 'Следующая секция →'}
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
