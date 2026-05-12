import { useState } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { dictionary } from '../../data/dictionary';
import { FlashcardDeck } from '../practice/FlashcardDeck';
import { SessionResult } from '../practice/SessionResult';
import { PracticeStats } from '../practice/PracticeStats';
import { PronunciationTrainer } from '../practice/PronunciationTrainer';

type PracticeTab = 'flashcards' | 'pronunciation';

const TABS: { id: PracticeTab; label: string }[] = [
  { id: 'flashcards', label: 'Карточки' },
  { id: 'pronunciation', label: 'Произношение' },
];

export function PracticeView() {
  const [activeTab, setActiveTab] = useState<PracticeTab>('flashcards');
  const session = useFlashcardStore((s) => s.session);
  const startSession = useFlashcardStore((s) => s.startSession);

  const sessionComplete = session && session.currentIndex >= session.cards.length;

  return (
    <div className="view-panel flex flex-col h-full">
      <div className="lesson-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`lesson-tabs__item${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {activeTab === 'flashcards' && <PracticeStats />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === 'flashcards' && (
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
        )}

        {activeTab === 'pronunciation' && <PronunciationTrainer />}
      </div>
    </div>
  );
}
