import type { ContentBlock } from '../types/lessonContent';
import type { AdminBlockType } from '../types/admin';

export type SemanticBlockType =
  | 'heading'
  | 'text'
  | 'teacherBubble'
  | 'phraseCard'
  | 'rule'
  | 'readingText'
  | 'video';

export const ACTIVE_SEMANTIC_BLOCK_TYPES: SemanticBlockType[] = [
  'heading',
  'text',
  'teacherBubble',
  'phraseCard',
  'rule',
  'readingText',
  'video',
];

export const RESERVED_SEMANTIC_BLOCK_TYPES = ['studentBubble', 'pronunciationPrompt'] as const;

export function semanticBlockLabel(type: SemanticBlockType) {
  switch (type) {
    case 'heading':
      return 'Внутренний заголовок';
    case 'text':
      return 'Поясняющий текст';
    case 'teacherBubble':
      return 'Бабл преподавателя';
    case 'phraseCard':
      return 'Карточка фразы';
    case 'rule':
      return 'Правило';
    case 'readingText':
      return 'Текст для чтения';
    case 'video':
      return 'Видео';
  }
}

export function legacyBlockTypeLabel(type: AdminBlockType) {
  switch (type) {
    case 'heading':
      return semanticBlockLabel('heading');
    case 'text':
      return semanticBlockLabel('text');
    case 'phrase':
      return semanticBlockLabel('phraseCard');
    case 'audio':
      return 'Legacy audio';
    case 'record':
      return 'Legacy record';
    case 'rule':
      return semanticBlockLabel('rule');
    case 'video':
      return semanticBlockLabel('video');
  }
}

export function semanticToLegacyBlockType(type: SemanticBlockType): AdminBlockType {
  switch (type) {
    case 'teacherBubble':
      return 'audio';
    case 'phraseCard':
      return 'phrase';
    case 'readingText':
      return 'text';
    default:
      return type;
  }
}

export function legacyToSemanticBlockType(type: AdminBlockType, content?: ContentBlock): SemanticBlockType {
  switch (type) {
    case 'audio':
      if (content?.type === 'audio' && content.sender === 'teacher') {
        return 'teacherBubble';
      }
      return 'teacherBubble';
    case 'phrase':
      return 'phraseCard';
    case 'text':
      return 'readingText';
    case 'heading':
      return 'heading';
    case 'rule':
      return 'rule';
    case 'video':
      return 'video';
    default:
      return 'text';
  }
}

export function makeDefaultSemanticBlockContent(type: SemanticBlockType): ContentBlock {
  switch (type) {
    case 'heading':
      return { type: 'heading', text: 'Новый заголовок' };
    case 'text':
      return { type: 'text', content: 'Короткий поясняющий текст для секции.' };
    case 'teacherBubble':
      return {
        type: 'audio',
        sender: 'teacher',
        senderName: 'Лусине',
        text: 'Короткое сообщение преподавателя с аудио.',
        src: 'https://example.com/audio.opus',
      };
    case 'phraseCard':
      return {
        type: 'phrase',
        russian: 'Здравствуйте',
        armenian: 'Բարև',
        transcription: 'barev',
        translation: 'Приветствие',
        status: 'new',
      };
    case 'rule':
      return {
        type: 'rule',
        title: 'Короткое правило',
        items: ['Добавьте 2-3 тезиса, которые нужно запомнить ученику.'],
      };
    case 'readingText':
      return {
        type: 'text',
        content: 'Короткий текст для чтения или мини-диалог.',
      };
    case 'video':
      return {
        type: 'video',
        senderName: 'Лусине',
        text: 'Видео-объяснение преподавателя',
        videoSrc: 'https://example.com/video.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      };
  }
}
