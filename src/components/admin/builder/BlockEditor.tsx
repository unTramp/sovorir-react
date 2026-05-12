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

function isDefaultSemanticContent(semanticType: typeof ACTIVE_SEMANTIC_BLOCK_TYPES[number], content: ContentBlock) {
  return JSON.stringify(content) === JSON.stringify(makeDefaultSemanticBlockContent(semanticType));
}

function normalizePreviewText(value: string | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function getBlockPreview(content: ContentBlock) {
  switch (content.type) {
    case 'heading':
      return normalizePreviewText(content.text);
    case 'text':
    case 'readingText':
      return normalizePreviewText(content.content);
    case 'audioExample':
      return normalizePreviewText([content.title, content.description].filter(Boolean).join(' — '));
    case 'multipleChoice':
      return normalizePreviewText(content.question);
    case 'audio':
      return normalizePreviewText(content.text);
    case 'teacherBubble':
      return normalizePreviewText(`${content.teacherName}: ${content.text}`);
    case 'studentBubble':
      return normalizePreviewText(`${content.studentName}: ${content.text}`);
    case 'phrase':
    case 'phraseCard':
      return normalizePreviewText(`${content.armenian} — ${content.translation}`);
    case 'rule':
      return normalizePreviewText([content.title, content.items[0]].filter(Boolean).join(' — '));
    case 'video':
      return normalizePreviewText([content.senderName, content.text].filter(Boolean).join(' — '));
    case 'record':
    case 'pronunciationPrompt':
      return normalizePreviewText(content.prompt);
    default:
      return '';
  }
}

export function BlockEditor({
  block,
  isHighlighted,
  busy,
  onSave,
  onDelete,
  onGripPointerDown,
  onGripPointerUp,
  isDragArmed,
}: {
  block: AdminLessonBlock;
  isHighlighted?: boolean;
  busy: boolean;
  onSave: (blockId: string, patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock }) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
  onGripPointerDown?: () => void;
  onGripPointerUp?: () => void;
  isDragArmed?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const semanticType = legacyToSemanticBlockType(block.type, block.content);
  const previewText = getBlockPreview(block.content);
  const collapsed = isCollapsed && !isHighlighted;

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
    if (nextSemanticType === semanticType) return;

    const shouldConfirmReplace = !isDefaultSemanticContent(semanticType, block.content);
    if (shouldConfirmReplace && typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Сменить тип блока на «${semanticBlockLabel(nextSemanticType)}»?\n\nТекущее содержимое блока будет заменено.`,
      );
      if (!confirmed) return;
    }

    const nextLegacyType = semanticToLegacyBlockType(nextSemanticType);
    const nextContent = makeDefaultSemanticBlockContent(nextSemanticType);
    persistBlockDraft(nextLegacyType, nextContent);
  };

  const handleTypedContentChange = (nextContent: ContentBlock) => {
    persistBlockDraft(block.type, nextContent);
  };

  return (
    <div className={`ab-block-card${isHighlighted ? ' ab-block-card--highlighted' : ''}${collapsed ? ' ab-block-card--collapsed' : ''}`}>
      <div className="ab-block-card__header">
        <div className="ab-block-card__header-left">
          <span
            className={`ab-block-card__grip${isDragArmed ? ' ab-block-card__grip--active' : ''}`}
            onMouseDown={onGripPointerDown}
            onMouseUp={onGripPointerUp}
            onTouchStart={onGripPointerDown}
            onTouchEnd={onGripPointerUp}
          >
            <GripIcon />
          </span>
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
          <button
            className="ab-icon-btn"
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            disabled={busy}
            aria-label={collapsed ? 'Развернуть блок' : 'Свернуть блок'}
          >
            {collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </button>
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

      {collapsed ? (
        <div className="ab-block-card__preview">
          <div className="ab-block-card__preview-label">Содержимое блока</div>
          <div className="ab-block-card__preview-text">
            {previewText || 'Пока нет заполненного содержимого.'}
          </div>
        </div>
      ) : (
        <BlockTypedFields
          blockId={block.id}
          semanticType={semanticType}
          content={block.content}
          busy={busy}
          onChange={handleTypedContentChange}
        />
      )}

      {error && <div className="ab-block-card__error">{error}</div>}
    </div>
  );
}
