import type { AdminLessonStatus, AdminSectionType } from '../../../types/admin';

export const ADMIN_NAV_COLLAPSED_STORAGE_KEY = 'sovorir-admin-nav-collapsed';

export interface LessonMetaDraft {
  title: string;
  description: string;
  status: AdminLessonStatus;
}

export interface SectionDraftState {
  title: string;
  type: AdminSectionType;
  contentJson: string;
}
