import { useMemo, useState } from 'react';
import { dictionary } from '../../data/dictionary';
import { PronunciationTrainer } from '../practice/PronunciationTrainer';
import { PracticeModeHeader } from '../practice/PracticeModeHeader';
import { MixedPracticeDeck } from '../practice/MixedPracticeDeck';
import { BrainIcon } from '../../icons';
import { useLearningItemStore } from '../../stores/useLearningItemStore';
import { usePracticeSessionStore } from '../../stores/usePracticeSessionStore';
import { buildPracticeQueue } from '../../lib/practiceEngine';

type PracticeTab = 'flashcards' | 'pronunciation';

export function PracticeView() {
  const [activeTab, setActiveTab] = useState<PracticeTab>('flashcards');
  const items = useLearningItemStore((state) => state.items);
  const reviewQueue = useLearningItemStore((state) => state.reviewQueue);
  const session = usePracticeSessionStore((state) => state.session);
  const startSession = usePracticeSessionStore((state) => state.startSession);

  const dueCount = useMemo(() => buildPracticeQueue({
    items,
    reviewQueue,
    limit: Number.MAX_SAFE_INTEGER,
  }).length, [items, reviewQueue]);
  const availableCount = Object.keys(reviewQueue).length;

  const sessionComplete = Boolean(session && session.currentIndex >= session.cards.length);
  const sessionProgress = session
    ? `${Math.min(session.currentIndex + (sessionComplete ? 0 : 1), session.cards.length)} / ${session.cards.length}`
    : dueCount > 0
      ? `${dueCount} к повторению`
      : `${availableCount} в плане`;

  return (
    <div className="view-panel flex flex-col h-full">
      <PracticeModeHeader
        activeMode={activeTab}
        onModeChange={setActiveTab}
        progress={activeTab === 'flashcards' ? <span>{sessionProgress}</span> : <span>{dictionary.length} слов</span>}
      />

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === 'flashcards' && (
          <div className="max-w-lg mx-auto">
            {!session && (
              <div className="flashcard-start">
                <div className="flashcard-start__icon"><BrainIcon size={28} /></div>
                <div className="flashcard-start__title">
                  {availableCount === 0 ? 'Повторение появится после урока' : dueCount === 0 ? 'На сегодня всё' : 'Пора вспомнить'}
                </div>
                <div className="flashcard-start__desc">
                  {availableCount === 0
                    ? 'Фразы из завершённых уроков автоматически попадут сюда и вернутся в нужный день.'
                    : dueCount === 0
                      ? `${availableCount} ${availableCount === 1 ? 'фраза уже в плане' : 'фраз уже в плане'}. Вернём их тогда, когда повторение будет полезнее всего.`
                      : `Сегодня ${dueCount} ${dueCount === 1 ? 'фраза готова' : dueCount < 5 ? 'фразы готовы' : 'фраз готовы'} к смешанному повторению: вспомнить, узнать и понять на слух.`}
                </div>
                {dueCount > 0 && (
                  <button className="flashcard-start__btn" onClick={() => startSession()}>
                    Начать повторение
                  </button>
                )}
              </div>
            )}
            {session && <MixedPracticeDeck />}
          </div>
        )}

        {activeTab === 'pronunciation' && <PronunciationTrainer />}
      </div>
    </div>
  );
}