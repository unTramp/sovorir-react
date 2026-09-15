import type { SubmissionStatus } from '../types/assignment';

export type AssignmentUiStatus =
  | 'pending'
  | 'submitted'
  | 'reviewing'
  | 'checked'
  | 'revisionRequired'
  | 'overdue';

export function getAssignmentUiStatus(status: SubmissionStatus | undefined, dueAt: string | null): AssignmentUiStatus {
  if ((!status || status === 'draft') && dueAt && new Date(dueAt).getTime() < Date.now()) return 'overdue';
  if (!status || status === 'draft') return 'pending';
  if (status === 'in_review') return 'reviewing';
  if (status === 'accepted') return 'checked';
  if (status === 'needs_revision') return 'revisionRequired';
  return 'submitted';
}
