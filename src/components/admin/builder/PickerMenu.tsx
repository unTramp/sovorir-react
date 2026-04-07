import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '../../../icons';

export function PickerMenu<T extends string>({
  value,
  label,
  options,
  onSelect,
  disabled,
  compact = false,
  className = '',
}: {
  value: T;
  label: (value: T) => string;
  options: Array<{ value: T; label: string; description?: string }>;
  onSelect: (value: T) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div
      ref={ref}
      className={`ab-picker${compact ? ' ab-picker--compact' : ''}${open ? ' ab-picker--open' : ''}${className ? ` ${className}` : ''}`}
    >
      <button
        className="ab-picker__trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ab-picker__trigger-copy">
          <span className="ab-picker__trigger-label">{selected?.label ?? label(value)}</span>
          {selected?.description && (
            <span className="ab-picker__trigger-description">{selected.description}</span>
          )}
        </span>
        <span className="ab-picker__trigger-icon">
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div className="ab-picker__menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              className={`ab-picker__option${option.value === value ? ' ab-picker__option--active' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              <span className="ab-picker__option-copy">
                <span className="ab-picker__option-label">{option.label}</span>
                {option.description && (
                  <span className="ab-picker__option-description">{option.description}</span>
                )}
              </span>
              {option.value === value && (
                <span className="ab-picker__option-check">
                  <CheckIcon />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
