import type {
  Interaction,
  LearningItem,
  Lesson,
  LessonStep,
  LessonStepType,
  MediaAsset,
  PresentationNode,
  UUID,
} from '../domain/learning';
import type { ContentBlock, LessonContentSection } from '../types/lessonContent';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hash32(value: string, seed: number): number {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Produces a deterministic RFC-4122-shaped UUID for legacy records without UUIDs. */
export function stableLegacyUuid(scope: string, value: string | number): UUID {
  const input = `${scope}:${value}`;
  const hex = [
    hash32(input, 2166136261),
    hash32(input, 2246822519),
    hash32(input, 3266489917),
    hash32(input, 668265263),
  ].map((part) => part.toString(16).padStart(8, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function asUuid(scope: string, value: string | number): UUID {
  const stringValue = String(value);
  return UUID_PATTERN.test(stringValue) ? stringValue : stableLegacyUuid(scope, stringValue);
}

function mimeTypeFor(url: string, media: 'audio' | 'video' = 'audio'): string {
  const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
  if (cleanUrl.endsWith('.mp3')) return 'audio/mpeg';
  if (cleanUrl.endsWith('.m4a') || cleanUrl.endsWith('.mp4')) return media === 'video' ? 'video/mp4' : 'audio/mp4';
  if (cleanUrl.endsWith('.wav')) return 'audio/wav';
  if (cleanUrl.endsWith('.opus') || cleanUrl.endsWith('.ogg')) return 'audio/ogg; codecs=opus';
  if (cleanUrl.endsWith('.webm')) return media === 'video' ? 'video/webm' : 'audio/webm';
  return media === 'video' ? 'video/mp4' : 'audio/mpeg';
}

function mediaAsset(scope: string, url: string, durationSeconds?: number, media: 'audio' | 'video' = 'audio'): MediaAsset {
  return {
    id: stableLegacyUuid('media', `${scope}:${url}`),
    url,
    mimeType: mimeTypeFor(url, media),
    durationMs: durationSeconds == null ? undefined : Math.round(durationSeconds * 1000),
  };
}

function inferStepType(section: LessonContentSection): LessonStepType {
  const kindMap: Partial<Record<NonNullable<LessonContentSection['kind']>, LessonStepType>> = {
    situation: 'context',
    phrases: 'phrase-intro',
    pronunciation: 'listen-repeat',
    dialogue: 'dialogue',
    recall: 'active-recall',
    completion: 'completion',
  };
  if (section.kind) return kindMap[section.kind] ?? 'context';
  if (section.blocks.some((block) => block.type === 'activeRecall')) return 'active-recall';
  if (section.blocks.some((block) => block.type === 'dialogue')) return 'dialogue';
  if (section.blocks.some((block) => block.type === 'record' || block.type === 'pronunciationPrompt')) return 'listen-repeat';
  if (section.blocks.some((block) => block.type === 'phrase' || block.type === 'phraseCard')) return 'phrase-intro';
  return 'context';
}

export interface LegacyLessonMetadata {
  id?: string;
  courseId?: string;
  slug?: string;
  revision?: number;
  title?: string;
  description?: string;
  level?: Lesson['level'];
  estimatedMinutes?: number;
  outcomes?: string[];
  status?: Lesson['status'];
  publishedAt?: string;
}

export interface AdaptedLessonContent {
  lesson: Lesson;
  learningItems: LearningItem[];
}

function phraseKey(block: Extract<ContentBlock, { type: 'phrase' | 'phraseCard' }>): string {
  return block.id ?? `${block.armenian}|${block.translation || block.russian}`;
}

export function adaptLegacyLessonContent(
  sections: LessonContentSection[],
  metadata: LegacyLessonMetadata = {},
): AdaptedLessonContent {
  const lessonId = asUuid('lesson', metadata.id ?? metadata.slug ?? 'legacy-current');
  const courseId = asUuid('course', metadata.courseId ?? 'legacy-course');
  const learningItemsByKey = new Map<string, LearningItem>();
  const legacyLearningItemIds = new Map<string, UUID>();

  sections.forEach((section) => {
    section.blocks.forEach((block) => {
      if (block.type !== 'phrase' && block.type !== 'phraseCard') return;
      const key = phraseKey(block);
      if (learningItemsByKey.has(key)) return;
      const id = asUuid('learning-item', key);
      const item: LearningItem = {
        id,
        revision: 1,
        type: 'phrase',
        armenian: block.armenian,
        transliteration: block.transcription,
        translation: block.translation || block.russian,
        audio: block.audioSrc ? { normal: mediaAsset(`learning-item:${id}`, block.audioSrc) } : undefined,
        contexts: block.context ? [block.context] : [],
        register: 'neutral',
        difficulty: 1,
        tags: [],
        reviewable: block.reviewable ?? false,
      };
      learningItemsByKey.set(key, item);
      legacyLearningItemIds.set(key, id);
      if (block.id) legacyLearningItemIds.set(block.id, id);
    });
  });

  const learningItemIdForRecall = (block: Extract<ContentBlock, { type: 'activeRecall' }>): UUID[] => {
    const ids = block.reviewIds.map((id) => legacyLearningItemIds.get(id)).filter((id): id is UUID => Boolean(id));
    if (ids.length > 0) return ids;
    const existing = [...learningItemsByKey.values()].find((item) => item.armenian === block.answer.armenian);
    if (existing) return [existing.id];

    const key = `recall:${block.answer.armenian}|${block.answer.translation}`;
    const id = stableLegacyUuid('learning-item', key);
    learningItemsByKey.set(key, {
      id,
      revision: 1,
      type: 'phrase',
      armenian: block.answer.armenian,
      transliteration: block.answer.transcription,
      translation: block.answer.translation,
      contexts: [],
      register: 'neutral',
      difficulty: 1,
      tags: [],
      reviewable: true,
    });
    return [id];
  };

  const steps = sections.map<LessonStep>((section, sectionIndex) => {
    const stepId = asUuid(`lesson:${lessonId}:step`, section.apiId ?? section.id);
    const content: PresentationNode[] = [];
    const interactions: Interaction[] = [];

    section.blocks.forEach((block, blockIndex) => {
      const nodeId = stableLegacyUuid(`step:${stepId}:node`, blockIndex);
      const interactionId = stableLegacyUuid(`step:${stepId}:interaction`, `${blockIndex}:${block.type}`);

      switch (block.type) {
        case 'heading':
          if (block.text !== section.title) content.push({ id: nodeId, type: 'text', variant: 'note', text: block.text });
          break;
        case 'text':
        case 'readingText':
          content.push({ id: nodeId, type: 'text', variant: 'body', text: block.content });
          break;
        case 'phrase':
        case 'phraseCard': {
          const itemId = legacyLearningItemIds.get(phraseKey(block));
          if (itemId) content.push({ id: nodeId, type: 'learning-item', itemId, variant: 'phrase-card' });
          break;
        }
        case 'rule':
          content.push({ id: nodeId, type: 'rule', title: block.title, items: block.items });
          break;
        case 'audio':
          content.push({
            id: nodeId,
            type: block.sender === 'teacher' ? 'mentor-bubble' : 'student-bubble',
            text: block.text,
            audio: mediaAsset(`node:${nodeId}`, block.src, block.duration),
          });
          break;
        case 'teacherBubble':
          content.push({ id: nodeId, type: 'mentor-bubble', text: block.text, audio: mediaAsset(`node:${nodeId}`, block.audioSrc, block.duration) });
          break;
        case 'studentBubble':
          content.push({ id: nodeId, type: 'student-bubble', text: block.text, audio: mediaAsset(`node:${nodeId}`, block.audioSrc, block.duration) });
          break;
        case 'audioExample':
          content.push({ id: nodeId, type: 'audio', title: block.title, description: block.description, asset: mediaAsset(`node:${nodeId}`, block.audioSrc, block.duration) });
          break;
        case 'video':
          content.push({
            id: nodeId,
            type: 'video',
            title: block.text ?? block.senderName ?? 'Видео',
            asset: mediaAsset(`node:${nodeId}`, block.videoSrc, block.duration, 'video'),
            thumbnailUrl: block.thumbnail,
            presentation: block.presentation,
            transcript: block.transcript,
          });
          break;
        case 'record':
        case 'pronunciationPrompt':
          interactions.push({
            id: interactionId,
            revision: 1,
            type: 'listen-repeat',
            prompt: block.prompt,
            recordingMode: 'tap-to-record',
            minimumAttempts: 1,
            allowComparison: true,
            required: true,
            learningItemIds: [],
            analyticsKey: `lesson.${lessonId}.${stepId}.listen-repeat`,
          });
          break;
        case 'multipleChoice':
          interactions.push({
            id: interactionId,
            revision: 1,
            type: 'choice',
            prompt: block.question,
            shuffle: false,
            options: block.options.map((text, optionIndex) => ({
              id: stableLegacyUuid(`interaction:${interactionId}:option`, optionIndex),
              text,
              correct: optionIndex === block.correctIndex,
              feedback: optionIndex === block.correctIndex ? block.explanation : undefined,
            })),
            required: true,
            learningItemIds: [],
            analyticsKey: `lesson.${lessonId}.${stepId}.choice`,
          });
          break;
        case 'dialogue':
          interactions.push({
            id: interactionId,
            revision: 1,
            type: 'dialogue',
            context: block.instruction,
            turns: [{ id: stableLegacyUuid(`interaction:${interactionId}:turn`, 0), speaker: 'character', text: block.message }],
            responseMode: 'choice',
            options: block.options.map((option) => ({
              id: asUuid(`interaction:${interactionId}:option`, option.id),
              text: option.text,
              correct: option.correct,
              feedback: option.reply,
            })),
            required: true,
            learningItemIds: [],
            analyticsKey: `lesson.${lessonId}.${stepId}.dialogue`,
          });
          break;
        case 'activeRecall': {
          const learningItemIds = learningItemIdForRecall(block);
          interactions.push({
            id: interactionId,
            revision: 1,
            type: 'recall',
            prompt: block.prompt,
            responseMode: 'self-report',
            hint: { type: 'text', text: block.hint },
            evaluation: 'self-report',
            required: true,
            learningItemIds,
            analyticsKey: `lesson.${lessonId}.${stepId}.recall`,
          });
          break;
        }
      }
    });

    const requiredInteractionIds = interactions.filter((interaction) => interaction.required).map((interaction) => interaction.id);
    const learningItemIds = [...new Set([
      ...content.filter((node): node is Extract<PresentationNode, { type: 'learning-item' }> => node.type === 'learning-item').map((node) => node.itemId),
      ...interactions.flatMap((interaction) => interaction.learningItemIds),
    ])];

    return {
      id: stepId,
      revision: 1,
      order: sectionIndex + 1,
      type: inferStepType(section),
      title: section.title,
      objective: section.objective ?? section.title ?? 'Пройти шаг урока',
      learningItemIds,
      content,
      interactions,
      completion: requiredInteractionIds.length > 0
        ? { mode: 'all-required', requiredInteractionIds }
        : { mode: 'viewed' },
    };
  });

  const learningItems = [...learningItemsByKey.values()];
  return {
    lesson: {
      schemaVersion: 1,
      id: lessonId,
      courseId,
      slug: metadata.slug ?? 'legacy-current-lesson',
      revision: metadata.revision ?? 1,
      title: metadata.title ?? 'Урок',
      description: metadata.description ?? '',
      level: metadata.level ?? 'A0',
      estimatedMinutes: metadata.estimatedMinutes ?? 10,
      outcomes: metadata.outcomes ?? [],
      learningItemIds: learningItems.map((item) => item.id),
      steps,
      status: metadata.status ?? 'published',
      publishedAt: metadata.publishedAt,
    },
    learningItems,
  };
}
