import { adaptCanonicalLessonToLegacySections } from '../lib/canonicalLessonAdapter';
import { lesson1Canonical, lesson1LearningItems } from './lesson1Canonical';

export const lessonPages = adaptCanonicalLessonToLegacySections(lesson1Canonical, lesson1LearningItems);
