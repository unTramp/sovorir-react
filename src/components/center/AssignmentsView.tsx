import { useEffect, useState } from 'react';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import { SubmitModal } from '../assignments/SubmitModal';
import type { Assignment, SubmissionStatus } from '../../types/assignment';

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: 'Черновик',
  submitted: 'Отправлено',
  in_review: 'На проверке',
  needs_revision: 'На доработку',
  accepted: 'Принято',
};

const STATUS_CLASS: Record<SubmissionStatus, string> = {
  draft: 'badge--draft',
  submitted: 'badge--submitted',
  in_review: 'badge--review',
  needs_revision: 'badge--revision',
  accepted: 'badge--accepted',
};

function formatDueDate(dueAt: string | null): string {
  if (!dueAt) return '';
  const d = new Date(dueAt);
  return `до ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
}

export function AssignmentsView() {
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const { assignments, submissions, isLoading, loadAssignments, loadMySubmissions, getSubmissionForAssignment } =
    useAssignmentStore();

  useEffect(() => {
    void loadAssignments();
    void loadMySubmissions();
  }, [loadAssignments, loadMySubmissions]);

  return (
    <div className="view-panel home-screen">
      <div className="home-greeting-section">
        <h1 className="assignments__title">Задания</h1>
      </div>

      {isLoading && assignments.length === 0 && (
        <div className="assignments__loading">Загрузка...</div>
      )}

      {!isLoading && assignments.length === 0 && (
        <div className="assignments__empty">
          <div className="assignments__empty-icon">📋</div>
          <p>Заданий пока нет</p>
        </div>
      )}

      <div className="assignments__list">
        {assignments.map((asgn) => {
          const submission = getSubmissionForAssignment(asgn.id);
          const status = submission?.status;
          const canSubmit = !status || status === 'needs_revision';

          return (
            <div key={asgn.id} className="assignment-card">
              <div className="assignment-card__top">
                <span className="assignment-card__title">{asgn.title}</span>
                {status && (
                  <span className={`badge ${STATUS_CLASS[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                )}
              </div>

              {asgn.description && (
                <p className="assignment-card__desc">{asgn.description}</p>
              )}

              <div className="assignment-card__bottom">
                {asgn.dueAt && (
                  <span className="assignment-card__due">{formatDueDate(asgn.dueAt)}</span>
                )}
                {canSubmit && (
                  <button
                    className="assignment-card__submit-btn"
                    onClick={() => setActiveAssignment(asgn)}
                  >
                    {status === 'needs_revision' ? 'Доработать' : 'Отправить'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeAssignment && (
        <SubmitModal
          assignment={activeAssignment}
          onClose={() => setActiveAssignment(null)}
        />
      )}
    </div>
  );
}
