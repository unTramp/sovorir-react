import type { ContentBlock } from '../types/lessonContent';
import type { AdminBlockType } from '../types/admin';

export type SemanticBlockType =
  | 'heading'
  | 'text'
  | 'audioExample'
  | 'pronunciationPrompt'
  | 'multipleChoice'
  | 'teacherBubble'
  | 'phraseCard'
  | 'rule'
  | 'readingText'
  | 'video';

export const ACTIVE_SEMANTIC_BLOCK_TYPES: SemanticBlockType[] = [
  'heading',
  'text',
  'audioExample',
  'pronunciationPrompt',
  'multipleChoice',
  'teacherBubble',
  'phraseCard',
  'rule',
  'readingText',
  'video',
];

export const RESERVED_SEMANTIC_BLOCK_TYPES = ['studentBubble'] as const;

export function semanticBlockLabel(type: SemanticBlockType) {
  switch (type) {
    case 'heading':
      return 'Внутренний заголовок';
    case 'text':
      return 'Поясняющий текст';
    case 'audioExample':
      return 'Аудио-пример';
    case 'pronunciationPrompt':
      return 'Запись ответа';
    case 'multipleChoice':
      return 'Тест с выбором';
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
    case 'audioExample':
      return semanticBlockLabel('audioExample');
    case 'pronunciationPrompt':
      return semanticBlockLabel('pronunciationPrompt');
    case 'multipleChoice':
      return semanticBlockLabel('multipleChoice');
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
    case 'audioExample':
      return 'audioExample';
    case 'pronunciationPrompt':
      return 'pronunciationPrompt';
    case 'multipleChoice':
      return 'multipleChoice';
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
    case 'audioExample':
      return 'audioExample';
    case 'pronunciationPrompt':
    case 'record':
      return 'pronunciationPrompt';
    case 'multipleChoice':
      return 'multipleChoice';
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
    case 'audioExample':
      return {
        type: 'audioExample',
        title: 'Новый аудио-пример',
        description: 'Короткое описание того, что нужно прослушать.',
        audioSrc: 'https://example.com/audio-example.opus',
      };
    case 'pronunciationPrompt':
      return {
        type: 'pronunciationPrompt',
        prompt: 'Повторите фразу: Բարև',
      };
    case 'multipleChoice':
      return {
        type: 'multipleChoice',
        question: 'Выберите правильный вариант',
        options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
        correctIndex: 0,
        explanation: 'Короткое пояснение, почему этот ответ правильный.',
      };
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
