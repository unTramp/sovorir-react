import { useMemo } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';

export function SessionResult() {
  const session = useFlashcardStore((s) => s.session);
  const startSession = useFlashcardStore((s) => s.startSession);

  const stats = useMemo(() => {
    if (!session) return { easy: 0, hard: 0, again: 0 };
    const results = Object.values(session.results);
    return {
      easy: results.filter((r) => r === 'easy').length,
      hard: results.filter((r) => r === 'hard').length,
      again: results.filter((r) => r === 'again').length,
    };
  }, [session]);

  if (!session) return null;

  return (
    <div className="flashcard-result">
      <div className="flashcard-result__emoji">
        {stats.again === 0 ? '🎉' : stats.easy > stats.again ? '👍' : '💪'}
      </div>
      <div className="flashcard-result__title">Тренировка завершена!</div>
      <div className="flashcard-result__stats">
        <div className="flashcard-result__stat flashcard-result__stat--easy">
          <span className="flashcard-result__count">{stats.easy}</span>
          <span className="flashcard-result__label">Легко</span>
        </div>
        <div className="flashcard-result__stat flashcard-result__stat--hard">
          <span className="flashcard-result__count">{stats.hard}</span>
          <span className="flashcard-result__label">Сложно</span>
        </div>
        <div className="flashcard-result__stat flashcard-result__stat--again">
          <span className="flashcard-result__count">{stats.again}</span>
          <span className="flashcard-result__label">Не помню</span>
        </div>
      </div>
      <button className="flashcard-result__btn" onClick={startSession}>
        Ещё раз
      </button>
    </div>
  );
}
