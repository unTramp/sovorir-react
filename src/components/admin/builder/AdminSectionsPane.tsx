import { PlusIcon, TrashIcon } from '../../../icons';
import { getSectionDisplayTitle, sectionTypeLabel } from './utils';
import type { AdminLessonSection } from '../../../types/admin';

function SectionGripIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
      <circle cx="3" cy="2.25" r="1.25" fill="currentColor" />
      <circle cx="7" cy="2.25" r="1.25" fill="currentColor" />
      <circle cx="3" cy="7" r="1.25" fill="currentColor" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" />
      <circle cx="3" cy="11.75" r="1.25" fill="currentColor" />
      <circle cx="7" cy="11.75" r="1.25" fill="currentColor" />
    </svg>
  );
}

interface AdminSectionsPaneProps {
  displayedLessonTitle: string;
  sections: AdminLessonSection[];
  selectedSectionId: string | null;
  hasUnsavedChanges: boolean;
  saving: boolean;
  dragSectionId: string | null;
  dragOverSectionId: string | null;
  setDragSectionId: (value: string | null) => void;
  setDragOverSectionId: (value: string | null) => void;
  onSelectSection: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onDropSection: (dragId: string, overId: string) => void;
}

export function AdminSectionsPane({
  displayedLessonTitle,
  sections,
  selectedSectionId,
  hasUnsavedChanges,
  saving,
  dragSectionId,
  dragOverSectionId,
  setDragSectionId,
  setDragOverSectionId,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onDropSection,
}: AdminSectionsPaneProps) {
  return (
    <aside className="admin-builder__sections-pane">
      <div className="admin-builder__sections-header">
        <div className="admin-builder__sections-lesson-title">{displayedLessonTitle}</div>
        <div className={`admin-builder__sections-sync${hasUnsavedChanges ? ' admin-builder__sections-sync--dirty' : ''}`}>
          <span className="admin-builder__sync-dot" />
          {hasUnsavedChanges ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
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
              <span className="admin-builder__section-rail-dot">
                <span className="admin-builder__section-rail-step">{index + 1}</span>
              </span>
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
                <div className="admin-builder__section-card-context">
                  <span className="admin-builder__section-step-label">Шаг {index + 1}</span>
                  <span className="admin-builder__section-card-context-divider" aria-hidden="true">·</span>
                  <span className="admin-builder__section-type-label">{sectionTypeLabel(section.type)}</span>
                </div>
                <div className="admin-builder__section-card-top-right admin-builder__section-card-top-right--actions">
                  <span
                    className="admin-builder__section-card-drag"
                    aria-label="Перетащите, чтобы изменить порядок секций"
                    title="Перетащите, чтобы изменить порядок секций"
                  >
                    <SectionGripIcon />
                  </span>
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
                <div className="admin-builder__section-card-title">{getSectionDisplayTitle(section.title)}</div>
              </div>

              <div className="admin-builder__section-card-bottom">
                <div className="admin-builder__section-card-meta">
                  {section.blocks.length} {section.blocks.length === 1 ? 'блок' : 'блоков'}
                </div>
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
