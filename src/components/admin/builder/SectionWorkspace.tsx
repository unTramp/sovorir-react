import { useRef, useState } from 'react';
import { AddBlockMenu } from './AddBlockMenu';
import { BlockEditor } from './BlockEditor';
import { PickerMenu } from './PickerMenu';
import {
  SECTION_TYPE_OPTIONS,
  getSectionDisplayTitle,
  sectionTypeDescription,
  sectionTypeLabel,
} from './utils';
import { type SemanticBlockType } from '../../../lib/semanticContent';
import { PlusIcon, SettingsGearIcon } from '../../../icons';
import type {
  AdminBlockType,
  AdminLessonSection,
  AdminSectionType,
} from '../../../types/admin';
import type { ContentBlock } from '../../../types/lessonContent';
import type { SectionDraftState } from './state';

interface SectionWorkspaceProps {
  selectedSection: AdminLessonSection | null;
  sectionDraft: SectionDraftState | null;
  orderedBlocks: AdminLessonSection['blocks'];
  highlightedBlockId: string | null;
  saving: boolean;
  onSectionDraftChange: (patch: Partial<SectionDraftState>) => void;
  onCreateBlock: (type: SemanticBlockType) => Promise<void>;
  onReorderBlock: (sectionId: string, draggedBlockId: string, overBlockId: string) => Promise<void>;
  onInsertBelow: (sectionId: string, blockId: string, type: SemanticBlockType) => Promise<void>;
  onSaveBlock: (blockId: string, patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock }) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
}

export function SectionWorkspace({
  selectedSection,
  sectionDraft,
  orderedBlocks,
  highlightedBlockId,
  saving,
  onSectionDraftChange,
  onCreateBlock,
  onReorderBlock,
  onInsertBelow,
  onSaveBlock,
  onDeleteBlock,
}: SectionWorkspaceProps) {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [armedDragBlockId, setArmedDragBlockId] = useState<string | null>(null);
  const armedDragBlockIdRef = useRef<string | null>(null);

  if (!selectedSection || !sectionDraft) {
    return (
      <div className="admin-builder__workspace-empty">
        <SettingsGearIcon size={24} />
        <div>Выбери секцию, чтобы редактировать её блоки.</div>
      </div>
    );
  }

  const sectionDisplayTitle = getSectionDisplayTitle(sectionDraft.title);

  return (
    <section className="admin-builder__blocks-section">
      <div className="admin-builder__blocks-header">
        <div className="admin-builder__blocks-title-row">
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
            <rect width="15" height="2.5" rx="1.25" fill="#8D4A2A" />
            <rect y="4.25" width="11" height="2.5" rx="1.25" fill="#8D4A2A" />
            <rect y="8.5" width="7" height="2.5" rx="1.25" fill="#8D4A2A" />
          </svg>
          <span>Блоки контента:</span>
          <span className="admin-builder__blocks-title-accent">{sectionDisplayTitle}</span>
        </div>

        <div className="admin-builder__section-edit-row">
          <input
            className="admin-builder__section-edit-input"
            value={sectionDraft.title}
            onChange={(event) => onSectionDraftChange({ title: event.target.value })}
            disabled={saving}
            placeholder="Название секции"
            aria-label="Название секции"
          />
          <PickerMenu
            value={sectionDraft.type}
            label={sectionTypeLabel}
            options={SECTION_TYPE_OPTIONS.map((option) => ({
              value: option,
              label: sectionTypeLabel(option),
              description: sectionTypeDescription(option),
            }))}
            onSelect={(nextType) => onSectionDraftChange({ type: nextType as AdminSectionType })}
            disabled={saving}
          />
        </div>
      </div>

      <div className="admin-builder__block-list">
        {orderedBlocks.length === 0 && (
          <div className="admin-builder__blocks-empty-state">
            <div className="admin-builder__blocks-empty">В этой секции пока нет блоков.</div>
            <AddBlockMenu
              disabled={saving}
              align="right"
              onSelect={(type) => void onCreateBlock(type)}
            >
              <>
                <PlusIcon /> Добавить первый блок
              </>
            </AddBlockMenu>
          </div>
        )}

        {orderedBlocks.map((block, index) => (
          <div
            key={block.id}
            className={`admin-builder__block-item${dragOverBlockId === block.id && draggedBlockId && draggedBlockId !== block.id ? ' admin-builder__block-item--drag-over' : ''}`}
            draggable={!saving}
            onDragStart={(event) => {
              if (armedDragBlockIdRef.current !== block.id) {
                event.preventDefault();
                return;
              }
              setDraggedBlockId(block.id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (dragOverBlockId !== block.id) {
                setDragOverBlockId(block.id);
              }
            }}
            onDragLeave={() => {
              if (dragOverBlockId === block.id) {
                setDragOverBlockId(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedBlockId) {
                void onReorderBlock(selectedSection.id, draggedBlockId, block.id);
              }
              setDraggedBlockId(null);
              setDragOverBlockId(null);
            }}
            onDragEnd={() => {
              armedDragBlockIdRef.current = null;
              setArmedDragBlockId(null);
              setDraggedBlockId(null);
              setDragOverBlockId(null);
            }}
          >
            <BlockEditor
              block={block}
              isHighlighted={block.id === highlightedBlockId}
              busy={saving}
              onSave={onSaveBlock}
              onDelete={onDeleteBlock}
              isDragArmed={armedDragBlockId === block.id || draggedBlockId === block.id}
              onGripPointerDown={() => {
                armedDragBlockIdRef.current = block.id;
                setArmedDragBlockId(block.id);
              }}
              onGripPointerUp={() => {
                armedDragBlockIdRef.current = null;
                setArmedDragBlockId(null);
              }}
            />

            <div className="admin-builder__insert-divider-row">
              <AddBlockMenu
                compact
                disabled={saving}
                onSelect={(type) => void onInsertBelow(selectedSection.id, block.id, type)}
                triggerLabel={`Добавить блок после ${index + 1} блока`}
              >
                <PlusIcon />
              </AddBlockMenu>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
