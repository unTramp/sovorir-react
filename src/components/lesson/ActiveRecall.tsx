import { useState } from 'react';
import type { ActiveRecallBlock } from '../../types/lessonContent';
import { useFlashcardStore } from '../../stores/useFlashcardStore';

interface Props {
  block: ActiveRecallBlock;
  completed?: boolean;
  onComplete?: () => void;
}

export function ActiveRecall({ block, completed = false, onComplete }: Props) {
  const [hintVisible, setHintVisible] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(completed);
  const unlockWords = useFlashcardStore((state) => state.unlockWords);

  const finish = () => {
    unlockWords(block.reviewIds);
    onComplete?.();
  };

  return (
    <section className={`active-recall${completed ? ' active-recall--done' : ''}`} aria-live="polite">
      <span className="active-recall__eyebrow">Без подсказки</span>
      <h2 className="active-recall__prompt">{block.prompt}</h2>

      {!answerVisible ? (
        <>
          {hintVisible && <p className="active-recall__hint">{block.hint}</p>}
          <div className="active-recall__actions">
            <button type="button" className="btn btn--primary btn--md" onClick={() => setAnswerVisible(true)}>Я ответил</button>
            {!hintVisible && <button type="button" className="btn btn--ghost btn--md" onClick={() => setHintVisible(true)}>Подсказка</button>}
          </div>
        </>
      ) : (
        <div className="active-recall__answer">
          <strong lang="hy">{block.answer.armenian}</strong>
          <span>{block.answer.transcription}</span>
          <p>{block.answer.translation}</p>
          {!completed && (
            <div className="active-recall__rating" aria-label="Как получилось">
              <button type="button" className="btn btn--secondary btn--md" onClick={finish}>Нужно повторить</button>
              <button type="button" className="btn btn--primary btn--md" onClick={finish}>Получилось</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
