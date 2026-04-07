import { isMockApiEnabled } from '../apiClient';
import { ApiAdminLessonBuilderRepository } from './apiRepository';
import { MockAdminLessonBuilderRepository } from './mockRepository';
import type { AdminLessonBuilderRepository } from './types';

export type {
  AdminDraftStore,
  AdminLessonBuilderRepository,
  CreateBlockInput,
  CreateLessonInput,
  CreateSectionInput,
  UpdateBlockInput,
  UpdateLessonInput,
  UpdateSectionInput,
} from './types';

export const adminLessonBuilderRepository: AdminLessonBuilderRepository = isMockApiEnabled
  ? new MockAdminLessonBuilderRepository()
  : new ApiAdminLessonBuilderRepository();
