import { useState } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { FlashcardCard } from './FlashcardCard';
import { dictionary } from '../../data/dictionary';

export function FlashcardDeck() {
  const [revealed, setRevealed] = useState(false);
  const session = useFlashcardStore((s) => s.session);
  const answerCard = useFlashcardStore((s) => s.answerCard);

  if (!session) return null;

  const currentWordId = session.cards[session.currentIndex];
  const word = dictionary.find((w) => w.id === currentWordId);

  if (!word) return null;

  return (
    <div className="flashcard-deck">
      <div className="flashcard-deck__progress">
        {session.currentIndex + 1} / {session.cards.length}
      </div>
      <FlashcardCard key={word.id} word={word} revealed={revealed} onReveal={() => setRevealed(true)} />
      {revealed && <div className="flashcard-deck__buttons" aria-label="Оцените, насколько хорошо вы помните слово">
        <button
          className="flashcard-answer flashcard-answer--again"
          onClick={() => { setRevealed(false); answerCard(word.id, 'again'); }}
        >
          Не помню
        </button>
        <button
          className="flashcard-answer flashcard-answer--hard"
          onClick={() => { setRevealed(false); answerCard(word.id, 'hard'); }}
        >
          Сложно
        </button>
        <button
          className="flashcard-answer flashcard-answer--easy"
          onClick={() => { setRevealed(false); answerCard(word.id, 'easy'); }}
        >
          Легко
        </button>
      </div>}
    </div>
  );
}
