import { useState } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { dictionary } from '../../data/dictionary';
import { FlashcardDeck } from '../practice/FlashcardDeck';
import { SessionResult } from '../practice/SessionResult';
import { PracticeStats } from '../practice/PracticeStats';
import { PronunciationTrainer } from '../practice/PronunciationTrainer';
import { PracticeModeHeader } from '../practice/PracticeModeHeader';
import { BrainIcon } from '../../icons';

type PracticeTab = 'flashcards' | 'pronunciation';

export function PracticeView() {
  const [activeTab, setActiveTab] = useState<PracticeTab>('flashcards');
  const session = useFlashcardStore((s) => s.session);
  const startSession = useFlashcardStore((s) => s.startSession);

  const sessionComplete = session && session.currentIndex >= session.cards.length;

  return (
    <div className="view-panel flex flex-col h-full">
      <PracticeModeHeader
        activeMode={activeTab}
        onModeChange={setActiveTab}
        progress={activeTab === 'flashcards' ? <PracticeStats /> : <span>{dictionary.length} слов</span>}
      />

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === 'flashcards' && (
          <div className="max-w-lg mx-auto">
            {!session && (
              <div className="flashcard-start">
                <div className="flashcard-start__icon"><BrainIcon size={28} /></div>
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
        )}

        {activeTab === 'pronunciation' && <PronunciationTrainer />}
      </div>
    </div>
  );
}
