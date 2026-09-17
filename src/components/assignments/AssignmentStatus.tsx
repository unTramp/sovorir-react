import type { AssignmentUiStatus } from '../../lib/assignmentStatus';

const STATUS_LABEL: Record<AssignmentUiStatus, string> = {
  pending: 'Нужно выполнить',
  submitted: 'Отправлено',
  reviewing: 'На проверке',
  checked: 'Проверено',
  revisionRequired: 'Нужна доработка',
  overdue: 'Просрочено',
};

export function AssignmentStatus({ status }: { status: AssignmentUiStatus }) {
  return (
    <span className={`assignment-status assignment-status--${status}`} data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}
