import { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress, syncCompletedSectionsToServer } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { useLessonCatalogStore } from '../../stores/useLessonCatalogStore';
import { contentRepository } from '../../lib/contentRepository';
import { getLessonPath } from '../../lib/lessonNavigation';
import { QuizContainer } from '../quiz/QuizContainer';
import type { Quiz, QuizResult } from '../../types/quiz';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';
import { handoffLessonItemsToReview } from '../../lib/lessonReviewHandoff';

export function LessonCompleteCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSection = useLessonStore((s) => s.currentSection);
  const totalSections = useLessonStore((s) => s.totalSections);
  const nextSection = useLessonStore((s) => s.nextSection);
  const completeSection = useLessonProgress((s) => s.completeSection);
  const isSectionCompleted = useLessonProgress((s) => s.isSectionCompleted(currentSection));
  const interactionsComplete = useLessonProgress((s) => s.areSectionInteractionsComplete(currentSection));
  const completionStatus = useLessonProgress((s) => s.sections[currentSection]?.completionStatus);
  const completionError = useLessonProgress((s) => s.sections[currentSection]?.completionError);
  const isQuizPassed = useLessonProgress((s) => s.isQuizPassed(currentSection));
  const saveQuizResult = useLessonProgress((s) => s.saveQuizResult);
  const unlockWords = useFlashcardStore((s) => s.unlockWords);
  const finishLessonAttempt = useLessonAttemptSessionStore((s) => s.finishAttempt);

  const allSections = useLessonSectionsStore((s) => s.sections);
  const canonical = allSections.find((section) => section.canonical)?.canonical;
  const routeLessonId = new URLSearchParams(location.search).get('lesson') ?? undefined;
  const lessonApiId = canonical?.lessonId ?? routeLessonId;
  const lessonTitle = useLessonCatalogStore((s) => (
    lessonApiId ? s.lessons.find((lesson) => lesson.apiId === lessonApiId)?.title : undefined
  ));
  const recapItems = canonical?.learningItems.slice(0, 5) ?? [];
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    contentRepository.getQuizForSection(currentSection).then(setQuiz);
  }, [currentSection]);

  const nextSectionData = allSections.find((item) => item.id === currentSection + 1);

  const nextHeading = nextSectionData?.blocks.find((b) => b.type === 'heading');
  const nextSectionTitle = nextSectionData?.title ?? (nextHeading?.type === 'heading' ? nextHeading.text : '');

  const isLastSection = currentSection >= totalSections;
  const needsQuiz = !!quiz && !isQuizPassed;
  const isCurrentSectionDone = isSectionCompleted;

  const handleQuizComplete = useCallback((result: QuizResult) => {
    saveQuizResult(currentSection, result);
  }, [currentSection, saveQuizResult]);

  const handleContinue = () => {
    void (async () => {
      const confirmed = await completeSection(currentSection);
      if (!confirmed) return;

      if (isLastSection) {
        if (canonical) {
          handoffLessonItemsToReview(canonical.lessonId, canonical.learningItems);
          finishLessonAttempt(canonical.lessonId);
        }
        const reviewIds = allSections.flatMap((section) => section.blocks.flatMap((block) => {
          if ((block.type === 'phrase' || block.type === 'phraseCard') && block.reviewable && block.id) return [block.id];
          if (block.type === 'activeRecall') return block.reviewIds;
          return [];
        }));
        unlockWords(reviewIds);
      }
      if (!isLastSection) {
        const nextSectionNumber = currentSection + 1;
        nextSection();
        navigate(getLessonPath(lessonApiId, nextSectionNumber));
      }
    })();
  };

  return (
    <>
      {quiz && (
        <div className="mt-4">
          <QuizContainer quiz={quiz} onComplete={handleQuizComplete} />
        </div>
      )}

      {isLastSection ? (
        isCurrentSectionDone ? (
          <div className="lesson-complete lesson-complete--done">
            <div className="lesson-complete__title">Урок завершён!</div>
            <div className="lesson-complete__summary">
              {lessonTitle
                ? `Вы завершили «${lessonTitle}». Новые фразы уже добавлены в план повторения.`
                : 'Новые фразы уже добавлены в план повторения.'}
            </div>
            {recapItems.length > 0 && (
              <ul className="lesson-complete__skills" aria-label="Ключевые фразы урока">
                {recapItems.map((item) => (
                  <li key={item.id}>
                    <span lang="hy">{item.armenian}</span> — {item.translation}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="lesson-complete__btn"
              onClick={() => {
                void (async () => {
                  // Sync all completed sections to server (handles any missed fire-and-forget)
                  await syncCompletedSectionsToServer();
                  // Reset lesson view state so next lesson starts from section 1
                  useLessonStore.getState().setCurrentSection(1);
                  // Invalidate caches so HomeView fetches fresh lesson statuses
                  useLessonSectionsStore.getState().reload(true);
                  await useLessonCatalogStore.getState().reloadLessons();
                  navigate('/');
                })();
              }}
            >
              На главную
            </button>
          </div>
        ) : (
          <div className="lesson-action-dock lesson-action-dock--finish" role="region" aria-label="Завершение урока">
            <div className="lesson-action-dock__content">
              <span className="lesson-action-dock__eyebrow">Готово</span>
              <span className="lesson-action-dock__title">Все фразы пройдены</span>
            </div>
            {completionError && <div className="lesson-record-sticky__error" role="alert">{completionError}</div>}
            <button
              className="lesson-action-dock__btn"
              onClick={needsQuiz || !interactionsComplete ? undefined : handleContinue}
              disabled={needsQuiz || !interactionsComplete || completionStatus === 'syncing'}
            >
              {completionStatus === 'syncing' ? 'Сохраняем…' : needsQuiz ? 'Сначала ответьте' : 'Завершить урок'}
            </button>
          </div>
        )
      ) : (
        <div className="lesson-action-dock" role="region" aria-label="Переход к следующему разделу">
          <div className="lesson-action-dock__content">
            <span className="lesson-action-dock__eyebrow">Дальше</span>
            <span className="lesson-action-dock__title">{nextSectionTitle || 'Следующий шаг'}</span>
          </div>
          {completionError && <div className="lesson-record-sticky__error" role="alert">{completionError}</div>}
          <button
            className="lesson-action-dock__btn"
            onClick={needsQuiz || !interactionsComplete ? undefined : handleContinue}
            disabled={needsQuiz || !interactionsComplete || completionStatus === 'syncing'}
          >
            <span>{completionStatus === 'syncing' ? 'Сохраняем…' : needsQuiz ? 'Сначала ответьте' : 'Продолжить'}</span>
            {!needsQuiz && <span aria-hidden="true">→</span>}
          </button>
        </div>
      )}
    </>
  );
}
