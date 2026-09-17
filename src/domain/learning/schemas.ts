import { z } from 'zod';

export const UUIDSchema = z.string().uuid();

export const MediaAssetSchema = z.object({
  id: UUIDSchema,
  url: z.string().min(1),
  mimeType: z.string().min(1),
  durationMs: z.number().nonnegative().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  checksum: z.string().optional(),
});

export const LearningItemSchema = z.object({
  id: UUIDSchema,
  revision: z.number().int().positive(),
  type: z.enum(['word', 'phrase', 'sentence', 'reply']),
  armenian: z.string().min(1),
  transliteration: z.string(),
  translation: z.string().min(1),
  phoneticHint: z.string().optional(),
  audio: z.object({ normal: MediaAssetSchema, slow: MediaAssetSchema.optional() }).optional(),
  contexts: z.array(z.string()),
  register: z.enum(['informal', 'neutral', 'polite', 'formal']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  tags: z.array(z.string()),
  reviewable: z.boolean(),
});

const InteractionBaseSchema = z.object({
  id: UUIDSchema,
  revision: z.number().int().positive(),
  required: z.boolean(),
  learningItemIds: z.array(UUIDSchema),
  analyticsKey: z.string().min(1),
});

export const InteractionSchema = z.discriminatedUnion('type', [
  InteractionBaseSchema.extend({
    type: z.literal('listen-repeat'), prompt: z.string(), referenceAudio: MediaAssetSchema.optional(),
    recordingMode: z.literal('tap-to-record'), minimumAttempts: z.number().int().positive(), allowComparison: z.boolean(),
  }),
  InteractionBaseSchema.extend({
    type: z.literal('choice'), prompt: z.string(), shuffle: z.boolean(),
    options: z.array(z.object({ id: UUIDSchema, text: z.string(), learningItemId: UUIDSchema.optional(), correct: z.boolean(), feedback: z.string().optional() })),
  }),
  InteractionBaseSchema.extend({
    type: z.literal('dialogue'), context: z.string(),
    turns: z.array(z.object({ id: UUIDSchema, speaker: z.enum(['mentor', 'student', 'character']), text: z.string().optional(), audio: MediaAssetSchema.optional() })),
    responseMode: z.enum(['choice', 'voice']),
    options: z.array(z.object({ id: UUIDSchema, text: z.string(), correct: z.boolean(), feedback: z.string(), reply: z.string().optional() })).optional(),
  }),
  InteractionBaseSchema.extend({
    type: z.literal('recall'), prompt: z.string(), responseMode: z.enum(['voice', 'self-report']),
    hint: z.object({ type: z.enum(['text', 'reveal-item', 'audio']), text: z.string().optional(), learningItemId: UUIDSchema.optional(), audio: MediaAssetSchema.optional() }).optional(),
    evaluation: z.literal('self-report'),
  }),
]);

export const InteractionAttemptSchema = z.object({
  id: UUIDSchema,
  lessonAttemptId: UUIDSchema,
  lessonId: UUIDSchema,
  lessonRevision: z.number().int().positive(),
  stepId: UUIDSchema,
  interactionId: UUIDSchema,
  status: z.enum(['started', 'completed', 'skipped']),
  outcome: z.enum(['correct', 'incorrect', 'needs-review', 'completed']).optional(),
  hintUsed: z.boolean(),
  retryCount: z.number().int().nonnegative(),
  selectedOptionId: UUIDSchema.optional(),
  recordingId: UUIDSchema.optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export const PresentationNodeSchema = z.discriminatedUnion('type', [
  z.object({ id: UUIDSchema, type: z.literal('text'), variant: z.enum(['body', 'instruction', 'note']), text: z.string() }),
  z.object({ id: UUIDSchema, type: z.literal('learning-item'), itemId: UUIDSchema, variant: z.enum(['phrase-card', 'compact-row']) }),
  z.object({ id: UUIDSchema, type: z.literal('mentor-bubble'), text: z.string(), audio: MediaAssetSchema.optional() }),
  z.object({ id: UUIDSchema, type: z.literal('student-bubble'), text: z.string(), audio: MediaAssetSchema.optional() }),
  z.object({ id: UUIDSchema, type: z.literal('audio'), title: z.string(), description: z.string().optional(), asset: MediaAssetSchema }),
  z.object({ id: UUIDSchema, type: z.literal('rule'), title: z.string(), items: z.array(z.string()) }),
  z.object({ id: UUIDSchema, type: z.literal('video'), title: z.string(), asset: MediaAssetSchema, thumbnailUrl: z.string().optional() }),
]);

export const LessonStepSchema = z.object({
  id: UUIDSchema,
  revision: z.number().int().positive(),
  order: z.number().int().positive(),
  type: z.enum(['context', 'phrase-intro', 'listen-repeat', 'recognition', 'dialogue', 'active-recall', 'completion']),
  title: z.string().optional(),
  objective: z.string().min(1),
  estimatedSeconds: z.number().int().positive().optional(),
  mentorMessage: z.object({
    purpose: z.enum(['context', 'instruction', 'tip', 'feedback', 'culture']),
    text: z.string(),
    audio: MediaAssetSchema.optional(),
  }).optional(),
  learningItemIds: z.array(UUIDSchema),
  content: z.array(PresentationNodeSchema),
  interactions: z.array(InteractionSchema),
  completion: z.object({
    mode: z.enum(['viewed', 'all-required', 'any-required']),
    requiredInteractionIds: z.array(UUIDSchema).optional(),
  }),
});

export const LessonSchema = z.object({
  schemaVersion: z.literal(1),
  id: UUIDSchema,
  courseId: UUIDSchema,
  slug: z.string().min(1),
  revision: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  level: z.enum(['A0', 'A1', 'A2', 'B1']),
  estimatedMinutes: z.number().int().positive(),
  outcomes: z.array(z.string()),
  introMedia: z.object({
    type: z.enum(['none', 'image', 'video']),
    asset: MediaAssetSchema.optional(),
    poster: MediaAssetSchema.optional(),
  }).optional(),
  learningItemIds: z.array(UUIDSchema),
  steps: z.array(LessonStepSchema),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.string().datetime().optional(),
});
