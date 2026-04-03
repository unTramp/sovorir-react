import { useState, useCallback } from 'react';
import type { DictionaryWord } from '../../types/dictionary';

interface Props {
  word: DictionaryWord;
}

export function FlashcardCard({ word }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  // Reset flip when word changes
  const [prevId, setPrevId] = useState(word.id);
  if (word.id !== prevId) {
    setPrevId(word.id);
    setFlipped(false);
  }

  return (
    <div className="flashcard-scene" onClick={handleFlip}>
      <div className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`}>
        <div className="flashcard__face flashcard__front">
          <div className="flashcard__armenian" lang="hy">{word.armenian}</div>
          <div className="flashcard__transcription">{word.transcription}</div>
          <div className="flashcard__hint">Нажмите, чтобы перевернуть</div>
        </div>
        <div className="flashcard__face flashcard__back">
          <div className="flashcard__translation">{word.translation}</div>
          <div className="flashcard__example" lang="hy">{word.example}</div>
          <div className="flashcard__example-tr">{word.exampleTranslation}</div>
        </div>
      </div>
    </div>
  );
}
