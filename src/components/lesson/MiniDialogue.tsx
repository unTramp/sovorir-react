import { useEffect, useRef, useState } from 'react';
import type { DialogueBlock } from '../../types/lessonContent';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';

interface Props {
  block: DialogueBlock;
  completed?: boolean;
  onComplete?: () => void;
}

const TYPING_DELAY_MS = 1200;

export function MiniDialogue({ block, completed = false, onComplete }: Props) {
  const completedOption = block.options.find((option) => option.correct);
  const [selectedId, setSelectedId] = useState<string | null>(completed ? completedOption?.id ?? null : null);
  const [isTyping, setIsTyping] = useState(false);
  const [reply, setReply] = useState<string | null>(completed ? completedOption?.reply ?? null : null);
  const [retryCount, setRetryCount] = useState(0);
  const pendingAttemptId = useRef<string | null>(null);
  const selected = block.options.find((option) => option.id === selectedId);
  const startAttempt = useInteractionAttemptStore((state) => state.startAttempt);
  const completeAttempt = useInteractionAttemptStore((state) => state.completeAttempt);
  const getOrCreateLessonAttemptId = useLessonAttemptSessionStore((state) => state.getOrCreateAttemptId);

  useEffect(() => {
    if (!selected?.correct || completed || !isTyping) return;
    const timer = window.setTimeout(() => {
      setIsTyping(false);
      setReply(selected.reply);
      if (pendingAttemptId.current) completeAttempt(pendingAttemptId.current, 'correct', { retryCount });
      onComplete?.();
    }, TYPING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [completeAttempt, completed, isTyping, onComplete, retryCount, selected]);

  const choose = (id: string) => {
    if (reply || isTyping) return;
    const option = block.options.find((candidate) => candidate.id === id);
    if (!option) return;
    setSelectedId(id);

    let attemptId: string | null = null;
    if (block.tracking) {
      attemptId = startAttempt({
        lessonAttemptId: getOrCreateLessonAttemptId(block.tracking.lessonId),
        lessonId: block.tracking.lessonId,
        lessonRevision: block.tracking.lessonRevision,
        stepId: block.tracking.stepId,
        interactionId: block.tracking.interactionId,
        hintUsed: false,
        retryCount,
        selectedOptionId: option.id,
      });
    }

    if (option.correct) {
      pendingAttemptId.current = attemptId;
      setIsTyping(true);
    } else {
      if (attemptId) completeAttempt(attemptId, 'incorrect', { retryCount });
      setRetryCount((count) => count + 1);
    }
  };

  return (
    <section className="lesson-dialogue" aria-labelledby={`dialogue-${block.tracking?.interactionId ?? 'instruction'}`}>
      <p id={`dialogue-${block.tracking?.interactionId ?? 'instruction'}`} className="lesson-dialogue__instruction">{block.instruction}</p>
      <div className="lesson-dialogue__thread" aria-live="polite">
        <div className="lesson-dialogue__message lesson-dialogue__message--character">
          <span className="lesson-dialogue__speaker">{block.characterName}{block.characterRole ? ` · ${block.characterRole}` : ''}</span>
          <span lang="hy">{block.message}</span>
        </div>
        {selected && (
          <div className={`lesson-dialogue__message lesson-dialogue__message--learner${selected.correct ? '' : ' is-error'}`}>
            <span className="lesson-dialogue__speaker">Вы</span>
            <span lang="hy">{selected.text}</span>
          </div>
        )}
        {selected && !selected.correct && (
          <div className="lesson-dialogue__mentor-feedback" role="status">
            <strong>Лусине</strong>
            <span>{selected.feedback ?? 'Подумайте, какая фраза лучше подходит к этой ситуации.'}</span>
          </div>
        )}
        {isTyping && (
          <div className="lesson-dialogue__typing" aria-label={`${block.characterName} печатает`}>
            <span /><span /><span />
          </div>
        )}
        {reply && (
          <div className="lesson-dialogue__message lesson-dialogue__message--character">
            <span className="lesson-dialogue__speaker">{block.characterName}</span>
            <span lang="hy">{reply}</span>
          </div>
        )}
      </div>
      {!reply && !isTyping && (
        <div className="lesson-dialogue__options" aria-label="Варианты ответа">
          {block.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`lesson-dialogue__option${selectedId === option.id && !option.correct ? ' is-error' : ''}`}
              onClick={() => choose(option.id)}
            >
              <span lang="hy">{option.text}</span>
              {option.translation && <small>{option.translation}</small>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
