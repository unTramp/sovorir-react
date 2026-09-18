import { useEffect, useRef, useState } from 'react';
import type { DialogueBlock } from '../../types/lessonContent';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';
import { StudentBubble } from '../conversation/StudentBubble';
import { TeacherBubble } from '../conversation/TeacherBubble';
import { CharacterMessage, CharacterTyping } from '../conversation/CharacterMessage';

interface Props {
  block: DialogueBlock;
  completed?: boolean;
  onComplete?: () => void;
}

const TYPING_DELAY_MS = 1200;

export function DialogueScene({ block, completed = false, onComplete }: Props) {
  const completedOption = block.options.find((option) => option.correct);
  const [selectedId, setSelectedId] = useState<string | null>(
    completed ? completedOption?.id ?? null : null,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [reply, setReply] = useState<string | null>(
    completed ? completedOption?.reply ?? null : null,
  );
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
      if (pendingAttemptId.current) {
        completeAttempt(pendingAttemptId.current, 'correct', { retryCount });
      }
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
      return;
    }

    if (attemptId) completeAttempt(attemptId, 'incorrect', { retryCount });
    setRetryCount((count) => count + 1);
  };

  return (
    <section
      className="dialogue-scene"
      aria-labelledby={`dialogue-${block.tracking?.interactionId ?? 'instruction'}`}
    >
      <p
        id={`dialogue-${block.tracking?.interactionId ?? 'instruction'}`}
        className="dialogue-scene__instruction"
      >
        {block.instruction}
      </p>

      <div className="dialogue-scene__thread" aria-live="polite">
        <CharacterMessage
          name={block.characterName}
          role={block.characterRole}
          text={block.message}
        />

        {selected && (
          <StudentBubble state={selected.correct ? 'default' : 'error'}>
            <span lang="hy">{selected.text}</span>
          </StudentBubble>
        )}

        {selected && !selected.correct && (
          <TeacherBubble
            text={selected.feedback ?? 'Подумайте, какая фраза лучше подходит к этой ситуации.'}
          />
        )}

        {isTyping && <CharacterTyping name={block.characterName} />}

        {reply && (
          <CharacterMessage
            name={block.characterName}
            role={block.characterRole}
            text={reply}
          />
        )}
      </div>

      {!reply && !isTyping && (
        <div className="dialogue-scene__choices" aria-label="Варианты ответа">
          {block.options.map((option) => {
            const selectedWrong = selectedId === option.id && !option.correct;

            return (
              <button
                key={option.id}
                type="button"
                className={`dialogue-choice${selectedWrong ? ' dialogue-choice--error' : ''}`}
                onClick={() => choose(option.id)}
              >
                <span className="dialogue-choice__text" lang="hy">{option.text}</span>
                {option.translation && (
                  <span className="dialogue-choice__translation">{option.translation}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
