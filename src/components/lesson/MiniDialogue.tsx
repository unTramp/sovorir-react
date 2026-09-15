import { useEffect, useState } from 'react';
import type { DialogueBlock } from '../../types/lessonContent';

interface Props {
  block: DialogueBlock;
  completed?: boolean;
  onComplete?: () => void;
}

export function MiniDialogue({ block, completed = false, onComplete }: Props) {
  const completedOption = block.options.find((option) => option.correct);
  const [selectedId, setSelectedId] = useState<string | null>(completed ? completedOption?.id ?? null : null);
  const [isTyping, setIsTyping] = useState(false);
  const [reply, setReply] = useState<string | null>(completed ? completedOption?.reply ?? null : null);
  const selected = block.options.find((option) => option.id === selectedId);

  useEffect(() => {
    if (!selected?.correct || completed || !isTyping) return;
    const timer = window.setTimeout(() => {
      setIsTyping(false);
      setReply(selected.reply);
      onComplete?.();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [completed, isTyping, onComplete, selected]);

  const choose = (id: string) => {
    if (reply || isTyping) return;
    setSelectedId(id);
    if (block.options.find((option) => option.id === id)?.correct) setIsTyping(true);
  };

  return (
    <section className="lesson-dialogue" aria-labelledby="dialogue-instruction">
      <p id="dialogue-instruction" className="lesson-dialogue__instruction">{block.instruction}</p>
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
          {selected && !selected.correct && <p className="lesson-dialogue__feedback">Попробуйте выбрать вежливое приветствие.</p>}
        </div>
      )}
    </section>
  );
}
