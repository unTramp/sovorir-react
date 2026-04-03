import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { dictionary } from '../../data/dictionary';
import { FlashcardDeck } from '../practice/FlashcardDeck';
import { SessionResult } from '../practice/SessionResult';
import { PracticeStats } from '../practice/PracticeStats';

export function PracticeView() {
  const session = useFlashcardStore((s) => s.session);
  const startSession = useFlashcardStore((s) => s.startSession);

  const sessionComplete = session && session.currentIndex >= session.cards.length;

  return (
    <div className="view-panel flex flex-col h-full">
      <div className="h-11 bg-content border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <span className="text-base font-semibold text-dark">Тренировка</span>
        <PracticeStats />
      </div>
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="max-w-lg mx-auto">
          {!session && (
            <div className="flashcard-start">
              <div className="flashcard-start__emoji">🧠</div>
              <div className="flashcard-start__title">Карточки для запоминания</div>
              <div className="flashcard-start__desc">
                {dictionary.length} слов из словаря урока. Повторяйте каждый день — интервальное запоминание поможет выучить слова надолго.
              </div>
              <button className="flashcard-start__btn" onClick={startSession}>
                Начать тренировку
              </button>
            </div>
          )}
          {session && !sessionComplete && <FlashcardDeck />}
          {session && sessionComplete && <SessionResult />}
        </div>
      </div>
    </div>
  );
}
