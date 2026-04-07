import { StatusSegmentedControl } from './SegmentedControls';
import type { AdminLessonStatus } from '../../../types/admin';
import type { LessonMetaDraft } from './state';

interface LessonMetaPanelProps {
  metaDraft: LessonMetaDraft;
  isCollapsed: boolean;
  saving: boolean;
  onToggleCollapsed: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onStatusChange: (status: AdminLessonStatus) => void;
}

export function LessonMetaPanel({
  metaDraft,
  isCollapsed,
  saving,
  onToggleCollapsed,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
}: LessonMetaPanelProps) {
  return (
    <section className="admin-builder__meta-card">
      <div className="admin-builder__meta-card-top">
        <div className="admin-builder__meta-card-heading">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="7.5" stroke="#8D4A2A" strokeWidth="1.5" />
            <path d="M8.5 7.5v5M8.5 5v1" stroke="#8D4A2A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Параметры урока</span>
        </div>
        <button
          className="ab-btn ab-btn--ghost ab-btn--sm"
          type="button"
          onClick={onToggleCollapsed}
        >
          {isCollapsed ? 'Развернуть' : 'Свернуть'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="admin-builder__meta-grid">
          <div className="admin-builder__meta-field admin-builder__meta-field--status">
            <label className="admin-builder__meta-label" htmlFor="lesson-status">Статус</label>
            <div id="lesson-status" className="admin-builder__status-field">
              <StatusSegmentedControl
                value={metaDraft.status}
                onChange={onStatusChange}
                disabled={saving}
                compact
              />
              <span className="admin-builder__status-field-hint">Состояние публикации этого урока.</span>
            </div>
          </div>

          <div className="admin-builder__meta-field admin-builder__meta-field--title">
            <label className="admin-builder__meta-label" htmlFor="lesson-title">Название урока</label>
            <input
              id="lesson-title"
              className="admin-builder__meta-input"
              value={metaDraft.title}
              onChange={(event) => onTitleChange(event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="admin-builder__meta-field admin-builder__meta-field--description">
            <label className="admin-builder__meta-label" htmlFor="lesson-description">Описание</label>
            <textarea
              id="lesson-description"
              className="admin-builder__meta-input admin-builder__meta-textarea"
              rows={3}
              value={metaDraft.description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              disabled={saving}
            />
          </div>
        </div>
      )}
    </section>
  );
}
