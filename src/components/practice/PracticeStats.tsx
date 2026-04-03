import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { dictionary } from '../../data/dictionary';

export function PracticeStats() {
  const learnedCount = useFlashcardStore((s) => s.getLearnedCount());

  return (
    <span className="text-xs text-muted ml-auto">
      Выучено {learnedCount} из {dictionary.length}
    </span>
  );
}
