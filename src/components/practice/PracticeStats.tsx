import { useFlashcardStore } from '../../stores/useFlashcardStore';

export function PracticeStats() {
  const learnedCount = useFlashcardStore((s) => s.getLearnedCount());
  const dueCount = useFlashcardStore((s) => s.getDueCount());

  return (
    <span>
      {dueCount > 0 ? `На повторение ${dueCount}` : `Изучено ${learnedCount}`}
    </span>
  );
}
