import { lesson1Reference } from './lesson1Reference';
import type { LessonPage } from '../types/lessonContent';

export const lessonPages: LessonPage[] = lesson1Reference.sections.map((section, index) => ({
  id: index + 1,
  title: section.title,
  blocks: section.blocks,
}));
