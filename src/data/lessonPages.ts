import { lesson1Draft } from './lesson1Draft';
import type { LessonPage } from '../types/lessonContent';

export const lessonPages: LessonPage[] = lesson1Draft.sections.map((section, index) => ({
  id: index + 1,
  title: section.title,
  blocks: section.blocks,
}));
