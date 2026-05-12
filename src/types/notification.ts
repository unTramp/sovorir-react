export type NotificationType =
  | 'review_ready'
  | 'deadline'
  | 'needs_revision'
  | 'consultation_reminder'
  | 'assignment_accepted';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  /** Optional deep-link route */
  route?: string;
}
