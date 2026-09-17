import type { ReactNode } from 'react';

export type PracticeMode = 'flashcards' | 'pronunciation';

interface Props {
  activeMode: PracticeMode;
  onModeChange: (mode: PracticeMode) => void;
  progress: ReactNode;
}

const MODES: { id: PracticeMode; label: string }[] = [
  { id: 'flashcards', label: 'Карточки' },
  { id: 'pronunciation', label: 'Произношение' },
];

export function PracticeModeHeader({ activeMode, onModeChange, progress }: Props) {
  return (
    <div className="practice-mode-header">
      <div className="practice-mode-header__tabs" role="tablist" aria-label="Режим практики">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={`practice-mode-header__tab${activeMode === mode.id ? ' active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeMode === mode.id}
            onClick={() => onModeChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <div className="practice-mode-header__progress" aria-live="polite">{progress}</div>
    </div>
  );
}
