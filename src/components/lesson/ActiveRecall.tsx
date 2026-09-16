import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { InteractionAttemptOutcome } from '../../domain/learning';
import type { ActiveRecallBlock } from '../../types/lessonContent';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';

interface Props {
  block: ActiveRecallBlock;
  completed?: boolean;
  onComplete?: () => void;
  actionDock?: HTMLElement | null;
}

export function ActiveRecall({ block, completed = false, onComplete, actionDock }: Props) {
  const [hintSheetOpen, setHintSheetOpen] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(completed);
  const attemptIdRef = useRef<string | null>(null);
  const unlockWords = useFlashcardStore((state) => state.unlockWords);
  const startAttempt = useInteractionAttemptStore((state) => state.startAttempt);
  const completeAttempt = useInteractionAttemptStore((state) => state.completeAttempt);
  const getOrCreateLessonAttemptId = useLessonAttemptSessionStore((state) => state.getOrCreateAttemptId);

  const ensureAttempt = () => {
    if (attemptIdRef.current || !block.tracking) return attemptIdRef.current;
    attemptIdRef.current = startAttempt({
      lessonAttemptId: getOrCreateLessonAttemptId(block.tracking.lessonId),
      lessonId: block.tracking.lessonId,
      lessonRevision: block.tracking.lessonRevision,
      stepId: block.tracking.stepId,
      interactionId: block.tracking.interactionId,
      hintUsed: false,
      retryCount: 0,
    });
    return attemptIdRef.current;
  };

  useEffect(() => {
    if (!hintSheetOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHintSheetOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [hintSheetOpen]);

  const showHint = () => {
    ensureAttempt();
    setHintUsed(true);
    setHintSheetOpen(true);
  };

  const revealAnswer = () => {
    ensureAttempt();
    setHintSheetOpen(false);
    setAnswerVisible(true);
  };

  const finish = (outcome: InteractionAttemptOutcome) => {
    const attemptId = ensureAttempt();
    if (attemptId) completeAttempt(attemptId, outcome, { hintUsed });
    if (!block.tracking) unlockWords(block.reviewIds);
    onComplete?.();
  };

  return (
    <section className={`lesson-dialogue active-recall${completed ? ' active-recall--done' : ''}`} aria-live="polite">
      <p className="lesson-dialogue__instruction">{block.prompt}</p>

      {answerVisible && (
        <div className="lesson-dialogue__thread active-recall__thread">
          <div className="lesson-dialogue__message lesson-dialogue__message--learner active-recall__answer">
            <span className="lesson-dialogue__speaker">Вы</span>
            <strong lang="hy">{block.answer.armenian}</strong>
            <span>{block.answer.transcription}</span>
            <p>{block.answer.translation}</p>
          </div>
        </div>
      )}

      {!completed && actionDock && createPortal(
        <div className="lesson-interaction-actions">
          {!answerVisible ? (
            <>
              <button type="button" className="btn btn--primary btn--md" onClick={revealAnswer}>Я ответил</button>
              <button type="button" className="btn btn--ghost btn--md" onClick={showHint}>Нужна подсказка</button>
            </>
          ) : (
            <div className="active-recall__rating" aria-label="Как получилось">
              <button type="button" className="btn btn--secondary btn--md" onClick={() => finish('needs-review')}>Нужно повторить</button>
              <button type="button" className="btn btn--primary btn--md" onClick={() => finish('correct')}>Получилось</button>
            </div>
          )}
        </div>
      , actionDock)}

      {hintSheetOpen && (
        <div className="lesson-hint-sheet" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setHintSheetOpen(false);
        }}>
          <div className="lesson-hint-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="lesson-hint-title">
            <div className="lesson-hint-sheet__handle" aria-hidden="true" />
            <span className="active-recall__eyebrow">Подсказка Лусине</span>
            <h3 id="lesson-hint-title">Вспомните звучание</h3>
            <p>{block.hint}</p>
            <button type="button" className="btn btn--primary btn--md" onClick={() => setHintSheetOpen(false)}>Попробовать самому</button>
          </div>
        </div>
      )}
    </section>
  );
}
