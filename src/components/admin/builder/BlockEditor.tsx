import { useState } from 'react';
import {
  ACTIVE_SEMANTIC_BLOCK_TYPES,
  legacyToSemanticBlockType,
  makeDefaultSemanticBlockContent,
  semanticBlockLabel,
  semanticToLegacyBlockType,
} from '../../../lib/semanticContent';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '../../../icons';
import type { AdminBlockType, AdminLessonBlock } from '../../../types/admin';
import type { ContentBlock } from '../../../types/lessonContent';
import { PickerMenu } from './PickerMenu';
import { semanticBlockDescription } from './utils';
import { BlockTypedFields } from './BlockTypedFields';

function GripIcon() {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
      <circle cx="6" cy="2" r="1.5" fill="currentColor" />
      <circle cx="2" cy="6.5" r="1.5" fill="currentColor" />
      <circle cx="6" cy="6.5" r="1.5" fill="currentColor" />
      <circle cx="2" cy="11" r="1.5" fill="currentColor" />
      <circle cx="6" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function BlockEditor({
  block,
  isHighlighted,
  canMoveUp,
  canMoveDown,
  busy,
  onMove,
  onSave,
  onDelete,
}: {
  block: AdminLessonBlock;
  isHighlighted?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  busy: boolean;
  onMove: (blockId: string, direction: 'up' | 'down') => Promise<void>;
  onSave: (blockId: string, patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock }) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const semanticType = legacyToSemanticBlockType(block.type, block.content);

  const persistBlockDraft = (nextType: AdminBlockType, nextContent: ContentBlock) => {
    setError(null);
    void onSave(block.id, {
      orderIndex: block.orderIndex,
      type: nextType,
      content: nextContent,
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Не удалось обновить блок');
    });
  };

  const handleTypeSelect = (nextTypeValue: string) => {
    const nextSemanticType = nextTypeValue as typeof semanticType;
    const nextLegacyType = semanticToLegacyBlockType(nextSemanticType);
    const nextContent = makeDefaultSemanticBlockContent(nextSemanticType);
    persistBlockDraft(nextLegacyType, nextContent);
  };

  const handleTypedContentChange = (nextContent: ContentBlock) => {
    persistBlockDraft(block.type, nextContent);
  };

  return (
    <div className={`ab-block-card${isHighlighted ? ' ab-block-card--highlighted' : ''}`}>
      <div className="ab-block-card__header">
        <div className="ab-block-card__header-left">
          <span className="ab-block-card__grip"><GripIcon /></span>
          <PickerMenu
            compact
            value={semanticType}
            label={semanticBlockLabel}
            options={ACTIVE_SEMANTIC_BLOCK_TYPES.map((opt) => ({
              value: opt,
              label: semanticBlockLabel(opt),
              description: semanticBlockDescription(opt),
            }))}
            onSelect={handleTypeSelect}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__header-actions">
          <div className="ab-block-card__move-btns ab-block-card__move-btns--header">
            <button
              className="ab-icon-btn"
              type="button"
              onClick={() => void onMove(block.id, 'up')}
              disabled={busy || !canMoveUp}
              aria-label="Переместить вверх"
            >
              <ChevronUpIcon />
            </button>
            <button
              className="ab-icon-btn"
              type="button"
              onClick={() => void onMove(block.id, 'down')}
              disabled={busy || !canMoveDown}
              aria-label="Переместить вниз"
            >
              <ChevronDownIcon />
            </button>
          </div>
          <span className="ab-block-card__header-action-divider" aria-hidden="true" />
          <button
            className="ab-delete-action ab-delete-action--danger ab-block-card__delete-btn"
            type="button"
            onClick={() => void onDelete(block.id)}
            disabled={busy}
            aria-label="Удалить блок"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <BlockTypedFields
        blockId={block.id}
        semanticType={semanticType}
        content={block.content}
        busy={busy}
        onChange={handleTypedContentChange}
      />

      {error && <div className="ab-block-card__error">{error}</div>}
    </div>
  );
}
