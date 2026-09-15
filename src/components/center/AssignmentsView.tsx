import { useEffect, useState } from 'react';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import { SubmitModal } from '../assignments/SubmitModal';
import type { Assignment } from '../../types/assignment';
import { AssignmentStatus } from '../assignments/AssignmentStatus';
import { getAssignmentUiStatus } from '../../lib/assignmentStatus';
import { ClipboardIcon } from '../../icons';

function formatDueDate(dueAt: string | null): string {
  if (!dueAt) return '';
  const d = new Date(dueAt);
  return `до ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
}

export function AssignmentsView() {
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const { assignments, isLoading, loadAssignments, loadMySubmissions, getSubmissionForAssignment } =
    useAssignmentStore();

  useEffect(() => {
    void loadAssignments();
    void loadMySubmissions();
  }, [loadAssignments, loadMySubmissions]);

  return (
    <div className="view-panel home-screen">
      {isLoading && assignments.length === 0 && (
        <div className="assignments__loading">Загрузка...</div>
      )}

      {!isLoading && assignments.length === 0 && (
        <div className="assignments__empty">
          <div className="assignments__empty-icon"><ClipboardIcon size={28} /></div>
          <p>Заданий пока нет</p>
        </div>
      )}

      <div className="assignments__list">
        {assignments.map((asgn) => {
          const submission = getSubmissionForAssignment(asgn.id);
          const uiStatus = getAssignmentUiStatus(submission?.status, asgn.dueAt);
          const actionLabel = uiStatus === 'pending' || uiStatus === 'overdue'
            ? 'Выполнить'
            : uiStatus === 'revisionRequired'
              ? 'Доработать'
              : 'Посмотреть ответ';

          return (
            <button
              key={asgn.id}
              className="assignment-card surface-card--interactive"
              type="button"
              onClick={() => setActiveAssignment(asgn)}
              aria-label={`${asgn.title}. ${actionLabel}`}
            >
              <div className="assignment-card__top">
                <span className="assignment-card__title">{asgn.title}</span>
                <AssignmentStatus status={uiStatus} />
              </div>

              {asgn.description && (
                <p className="assignment-card__desc">{asgn.description}</p>
              )}

              <div className="assignment-card__bottom">
                {asgn.dueAt && (
                  <span className="assignment-card__due">{formatDueDate(asgn.dueAt)}</span>
                )}
                <span className="assignment-card__submit-btn">{actionLabel} →</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeAssignment && (
        <SubmitModal
          assignment={activeAssignment}
          submission={getSubmissionForAssignment(activeAssignment.id)}
          onClose={() => setActiveAssignment(null)}
        />
      )}
    </div>
  );
}
