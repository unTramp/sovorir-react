import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PlusIcon } from '../../../icons';
import {
  ACTIVE_SEMANTIC_BLOCK_TYPES,
  semanticBlockLabel,
  type SemanticBlockType,
} from '../../../lib/semanticContent';
import { semanticBlockDescription } from './utils';

interface AddBlockMenuProps {
  disabled?: boolean;
  compact?: boolean;
  align?: 'left' | 'right';
  triggerLabel?: string;
  children?: ReactNode;
  onSelect: (type: SemanticBlockType) => void;
}

export function AddBlockMenu({
  disabled,
  compact = false,
  align = 'left',
  triggerLabel = 'Добавить блок',
  children,
  onSelect,
}: AddBlockMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={`ab-add-block-menu${compact ? ' ab-add-block-menu--compact' : ''}${open ? ' ab-add-block-menu--open' : ''}${align === 'right' ? ' ab-add-block-menu--right' : ''}`}
    >
      <button
        className={`ab-add-block-menu__trigger${compact ? ' ab-add-block-menu__trigger--compact' : ''}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
      >
        {children ?? (
          <>
            <PlusIcon />
            Добавить блок
          </>
        )}
      </button>

      {open && (
        <div className="ab-add-block-menu__menu" role="menu" aria-label="Выбери тип блока">
          <div className="ab-add-block-menu__title">Добавить блок</div>

          {ACTIVE_SEMANTIC_BLOCK_TYPES.map((type) => (
            <button
              key={type}
              className="ab-add-block-menu__option"
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(type);
                setOpen(false);
              }}
            >
              <span className="ab-add-block-menu__option-copy">
                <span className="ab-add-block-menu__option-label">{semanticBlockLabel(type)}</span>
                <span className="ab-add-block-menu__option-description">
                  {semanticBlockDescription(type)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
