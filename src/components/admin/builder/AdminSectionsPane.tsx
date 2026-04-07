import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../../../icons';
import { sectionTypeLabel, statusLabel } from './utils';
import type { AdminLessonSection, AdminLessonStatus } from '../../../types/admin';

interface AdminSectionsPaneProps {
  displayedLessonTitle: string;
  sections: AdminLessonSection[];
  selectedSectionId: string | null;
  lessonStatus: AdminLessonStatus;
  saving: boolean;
  dragSectionId: string | null;
  dragOverSectionId: string | null;
  setDragSectionId: (value: string | null) => void;
  setDragOverSectionId: (value: string | null) => void;
  onSelectSection: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onDropSection: (dragId: string, overId: string) => void;
}

export function AdminSectionsPane({
  displayedLessonTitle,
  sections,
  selectedSectionId,
  lessonStatus,
  saving,
  dragSectionId,
  dragOverSectionId,
  setDragSectionId,
  setDragOverSectionId,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onMoveSection,
  onDropSection,
}: AdminSectionsPaneProps) {
  return (
    <aside className="admin-builder__sections-pane">
      <div className="admin-builder__sections-header">
        <div className="admin-builder__sections-lesson-title">{displayedLessonTitle}</div>
        <div className="admin-builder__sections-sync">
          <span className="admin-builder__sync-dot" />
          Локальная синхронизация активна
        </div>
        <button
          className="admin-builder__add-section-btn"
          type="button"
          onClick={onAddSection}
          disabled={saving}
        >
          <PlusIcon /> Добавить секцию
        </button>
      </div>

      <div className="admin-builder__sections-list">
        {sections.length === 0 && (
          <div className="admin-builder__sections-empty">Секций пока нет.</div>
        )}

        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`admin-builder__section-rail-item${selectedSectionId === section.id ? ' admin-builder__section-rail-item--active' : ''}`}
          >
            <div className="admin-builder__section-rail-marker" aria-hidden="true">
              {index < sections.length - 1 && <span className="admin-builder__section-rail-line" />}
              <span className="admin-builder__section-rail-dot" />
            </div>

            <div
              draggable={!saving}
              className={`admin-builder__section-card${selectedSectionId === section.id ? ' admin-builder__section-card--active' : ''}`}
              onClick={() => onSelectSection(section.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectSection(section.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={selectedSectionId === section.id}
              onDragStart={() => setDragSectionId(section.id)}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragOverSectionId !== section.id) {
                  setDragOverSectionId(section.id);
                }
              }}
              onDragLeave={() => {
                if (dragOverSectionId === section.id) {
                  setDragOverSectionId(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragSectionId) {
                  onDropSection(dragSectionId, section.id);
                }
                setDragSectionId(null);
                setDragOverSectionId(null);
              }}
              onDragEnd={() => {
                setDragSectionId(null);
                setDragOverSectionId(null);
              }}
            >
              <div className="admin-builder__section-card-top">
                <span className="admin-builder__section-type-label">{sectionTypeLabel(section.type)}</span>
                <div className="admin-builder__section-card-top-right admin-builder__section-card-top-right--actions">
                  <div className="admin-builder__section-card-move admin-builder__section-card-move--top">
                    <button
                      className="ab-icon-btn ab-icon-btn--tiny"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMoveSection(section.id, 'up');
                      }}
                      disabled={saving || index === 0}
                      aria-label="Переместить секцию вверх"
                    >
                      <ChevronUpIcon />
                    </button>
                    <button
                      className="ab-icon-btn ab-icon-btn--tiny"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMoveSection(section.id, 'down');
                      }}
                      disabled={saving || index === sections.length - 1}
                      aria-label="Переместить секцию вниз"
                    >
                      <ChevronDownIcon />
                    </button>
                  </div>
                  <span className="admin-builder__section-card-action-divider" aria-hidden="true" />
                  <button
                    className="ab-delete-action ab-delete-action--danger admin-builder__section-card-delete-btn"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    disabled={saving}
                    aria-label="Удалить секцию"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="admin-builder__section-card-main">
                <div className="admin-builder__section-card-title">{section.title}</div>
              </div>

              <div className="admin-builder__section-card-bottom">
                <div className="admin-builder__section-card-meta">
                  {section.blocks.length} {section.blocks.length === 1 ? 'блок' : 'блоков'}
                </div>
                <span className={`ab-status-badge ab-status-badge--${lessonStatus}`}>
                  {statusLabel(lessonStatus)}
                </span>
              </div>

              {dragOverSectionId === section.id && dragSectionId && dragSectionId !== section.id && (
                <div className="admin-builder__section-card-drop-indicator">Отпустите, чтобы переместить</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
