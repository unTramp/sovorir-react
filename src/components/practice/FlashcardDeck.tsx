import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { FlashcardCard } from './FlashcardCard';
import { dictionary } from '../../data/dictionary';

export function FlashcardDeck() {
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
      <FlashcardCard key={word.id} word={word} />
      <div className="flashcard-deck__buttons">
        <button
          className="flashcard-answer flashcard-answer--again"
          onClick={() => answerCard(word.id, 'again')}
        >
          Не помню
        </button>
        <button
          className="flashcard-answer flashcard-answer--hard"
          onClick={() => answerCard(word.id, 'hard')}
        >
          Сложно
        </button>
        <button
          className="flashcard-answer flashcard-answer--easy"
          onClick={() => answerCard(word.id, 'easy')}
        >
          Легко
        </button>
      </div>
    </div>
  );
}
