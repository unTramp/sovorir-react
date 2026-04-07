import type { AdminLessonStatus } from '../../../types/admin';
import { PHRASE_STATUS_OPTIONS, STATUS_OPTIONS, phraseStatusLabel, statusLabel } from './utils';

export function StatusSegmentedControl({
  value,
  onChange,
  disabled,
  compact = false,
}: {
  value: AdminLessonStatus;
  onChange: (value: AdminLessonStatus) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`ab-segmented${compact ? ' ab-segmented--compact' : ''}`} role="tablist" aria-label="Статус урока">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          type="button"
          className={`ab-segmented__item${value === status ? ' ab-segmented__item--active' : ''}`}
          onClick={() => onChange(status)}
          disabled={disabled}
        >
          {statusLabel(status)}
        </button>
      ))}
    </div>
  );
}

export function PhraseStatusSegmentedControl({
  value,
  onChange,
  disabled,
}: {
  value: (typeof PHRASE_STATUS_OPTIONS)[number];
  onChange: (value: (typeof PHRASE_STATUS_OPTIONS)[number]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="ab-segmented ab-segmented--compact" role="tablist" aria-label="Статус фразы">
      {PHRASE_STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          type="button"
          className={`ab-segmented__item${value === status ? ' ab-segmented__item--active' : ''}`}
          onClick={() => onChange(status)}
          disabled={disabled}
        >
          {phraseStatusLabel(status)}
        </button>
      ))}
    </div>
  );
}
