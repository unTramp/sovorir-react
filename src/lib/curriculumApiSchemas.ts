import { z } from 'zod';
import { LearningItemSchema } from '../domain/learning/schemas';

const UUID = z.string().uuid();

const InteractionTrackingSchema = z.object({
  lessonId: z.string().min(1),
  lessonRevision: z.number().int().positive(),
  stepId: z.string().min(1),
  interactionId: z.string().min(1),
  learningItemIds: z.array(z.string().min(1)),
});

const PhraseBaseSchema = z.object({
  id: z.string().optional(),
  russian: z.string(),
  armenian: z.string(),
  transcription: z.string(),
  translation: z.string(),
  audioSrc: z.string().optional(),
  context: z.string().optional(),
  reviewable: z.boolean().optional(),
  status: z.enum(['new', 'learned', 'review']).optional(),
  learningItemId: z.string().optional(),
});

export const ContentBlockSchema = z.discriminatedUnion('type', [
  PhraseBaseSchema.extend({ type: z.literal('phrase') }),
  PhraseBaseSchema.extend({ type: z.literal('phraseCard') }),
  z.object({ type: z.literal('heading'), text: z.string() }),
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('readingText'), content: z.string() }),
  z.object({ type: z.literal('rule'), title: z.string(), items: z.array(z.string()) }),
  z.object({
    type: z.literal('multipleChoice'),
    question: z.string(),
    options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
  }),
  z.object({
    type: z.literal('audio'),
    sender: z.enum(['teacher', 'student']),
    senderName: z.string(),
    text: z.string(),
    duration: z.number().optional(),
    src: z.string(),
  }),
  z.object({
    type: z.literal('audioExample'),
    title: z.string(),
    description: z.string().optional(),
    audioSrc: z.string(),
    duration: z.number().optional(),
  }),
  z.object({
    type: z.literal('teacherBubble'),
    teacherName: z.string(),
    teacherAvatarUrl: z.string().optional(),
    text: z.string(),
    audioSrc: z.string(),
    duration: z.number().optional(),
  }),
  z.object({
    type: z.literal('studentBubble'),
    studentName: z.string(),
    text: z.string(),
    audioSrc: z.string(),
    duration: z.number().optional(),
  }),
  z.object({
    type: z.literal('video'),
    senderName: z.string(),
    text: z.string(),
    videoSrc: z.string(),
    thumbnail: z.string(),
  }),
  z.object({ type: z.literal('record'), prompt: z.string(), tracking: InteractionTrackingSchema.optional() }),
  z.object({ type: z.literal('pronunciationPrompt'), prompt: z.string(), tracking: InteractionTrackingSchema.optional() }),
  z.object({
    type: z.literal('dialogue'),
    characterName: z.string(),
    characterRole: z.string().optional(),
    message: z.string(),
    instruction: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      translation: z.string().optional(),
      correct: z.boolean(),
      reply: z.string(),
      feedback: z.string().optional(),
    })),
    tracking: InteractionTrackingSchema.optional(),
  }),
  z.object({
    type: z.literal('activeRecall'),
    prompt: z.string(),
    hint: z.string(),
    answer: z.object({ armenian: z.string(), transcription: z.string(), translation: z.string() }),
    reviewIds: z.array(z.string()),
    tracking: InteractionTrackingSchema.optional(),
  }),
]);

export const ApiCourseSchema = z.object({
  id: UUID,
  title: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const ApiCourseListSchema = z.array(ApiCourseSchema);

export const ApiLessonSectionSummarySchema = z.object({
  id: UUID,
  lessonId: UUID,
  orderIndex: z.number().int(),
  type: z.string(),
  title: z.string(),
  createdAt: z.string(),
  completed: z.boolean(),
});

export const ApiCourseLessonSchema = z.object({
  id: UUID,
  courseId: UUID,
  orderIndex: z.number().int(),
  title: z.string(),
  slug: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  totalSections: z.number().int().nonnegative(),
  completedSections: z.number().int().nonnegative(),
  sections: z.array(ApiLessonSectionSummarySchema),
});

export const ApiCourseLessonListSchema = z.array(ApiCourseLessonSchema);

export const ApiLessonBlockSchema = z.object({
  id: UUID,
  sectionId: UUID,
  orderIndex: z.number().int(),
  type: z.string(),
  content: ContentBlockSchema,
  createdAt: z.string(),
}).superRefine((block, ctx) => {
  if (block.type !== block.content.type) {
    ctx.addIssue({
      code: 'custom',
      path: ['type'],
      message: `Block type ${block.type} does not match content type ${block.content.type}`,
    });
  }
});

export const ApiLessonDetailSchema = z.object({
  id: UUID,
  courseId: UUID,
  orderIndex: z.number().int(),
  title: z.string(),
  slug: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  sections: z.array(z.object({
    id: UUID,
    lessonId: UUID,
    orderIndex: z.number().int(),
    type: z.string(),
    title: z.string(),
    content: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string(),
    blocks: z.array(ApiLessonBlockSchema),
    progress: z.object({ completed: z.boolean() }).nullable(),
  })),
});

export const ApiLearningItemSchema = LearningItemSchema.extend({
  stableKey: z.string().min(1),
  schoolId: UUID,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ApiLearningItemListSchema = z.array(ApiLearningItemSchema);

export type ApiCourse = z.infer<typeof ApiCourseSchema>;
export type ApiCourseLesson = z.infer<typeof ApiCourseLessonSchema>;
export type ApiLessonSectionSummary = z.infer<typeof ApiLessonSectionSummarySchema>;
export type ApiLessonDetail = z.infer<typeof ApiLessonDetailSchema>;
export type ApiLearningItem = z.infer<typeof ApiLearningItemSchema>;
