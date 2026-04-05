import { useState, useEffect, useCallback } from 'react';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { contentRepository } from '../../lib/contentRepository';
import { QuizContainer } from '../quiz/QuizContainer';
import type { LessonPage } from '../../types/lessonContent';
import type { Quiz, QuizResult } from '../../types/quiz';

export function LessonCompleteCard() {
  const currentPage = useLessonStore((s) => s.currentPage);
  const totalPages = useLessonStore((s) => s.totalPages);
  const nextPage = useLessonStore((s) => s.nextPage);
  const isQuizPassed = useLessonProgress((s) => s.isQuizPassed(currentPage));
  const saveQuizResult = useLessonProgress((s) => s.saveQuizResult);

  const [allPages, setAllPages] = useState<LessonPage[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    contentRepository.getLessonPages().then(setAllPages);
  }, []);

  useEffect(() => {
    contentRepository.getQuizForPage(currentPage).then(setQuiz);
  }, [currentPage]);

  const page = allPages.find((p) => p.id === currentPage);
  const nextPageData = allPages.find((p) => p.id === currentPage + 1);

  const currentHeading = page?.blocks.find((b) => b.type === 'heading');
  const summaryText = currentHeading?.type === 'heading' ? currentHeading.text : 'этот урок';

  const nextHeading = nextPageData?.blocks.find((b) => b.type === 'heading');
  const nextPageTitle = nextHeading?.type === 'heading' ? nextHeading.text : '';

  const isLastPage = currentPage >= totalPages;
  const needsQuiz = !!quiz && !isQuizPassed;

  const handleQuizComplete = useCallback((result: QuizResult) => {
    saveQuizResult(currentPage, result);
  }, [currentPage, saveQuizResult]);

  return (
    <>
      <div className="lesson-complete">
        <div className="lesson-complete__emoji">🎉</div>
        <div className="lesson-complete__title">Отлично!</div>
        <div className="lesson-complete__summary">
          Вы изучили: {summaryText.toLowerCase()}.
        </div>
        {!isLastPage && nextPageTitle && (
          <div className="lesson-complete__next-hint">
            <img
              src="/assets/teacher-avatar.png"
              className="lesson-complete__avatar"
              alt="Лусине"
            />
            <span>Готовы перейти к: {nextPageTitle.toLowerCase()}?</span>
          </div>
        )}
        <button
          className="lesson-complete__btn"
          onClick={isLastPage ? undefined : nextPage}
          disabled={isLastPage || needsQuiz}
        >
          {isLastPage ? 'Урок завершён ✓' : needsQuiz ? 'Пройдите тест ↓' : 'Следующий урок →'}
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
