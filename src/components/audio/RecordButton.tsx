import { MicIcon, MicSmallIcon } from '../../icons';

export function RecordButton() {
  return (
    <div className="border-t border-border px-3 py-1.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <MicSmallIcon />
        <span className="text-xs text-muted">Записать произношение</span>
      </div>
      <button
        className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-105 hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
        aria-label="Записать голос"
      >
        <MicIcon />
      </button>
    </div>
  );
}
