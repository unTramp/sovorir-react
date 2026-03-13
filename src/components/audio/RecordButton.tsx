import { MicIcon } from '../../icons';

export function RecordButton() {
  return (
    <div className="relative border-t border-border px-3 pt-1 pb-2 flex flex-col items-center flex-shrink-0">
      <button
        className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 -mt-[30px]"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
        aria-label="Записать голос"
      >
        <MicIcon />
      </button>
      <span className="text-xs text-muted mt-1">Записать произношение</span>
    </div>
  );
}
