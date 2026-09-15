import type { LearningItem } from '../domain/learning';

export interface InteractionTracking {
  lessonId: string;
  lessonRevision: number;
  stepId: string;
  interactionId: string;
  learningItemIds: string[];
}

export interface PhraseBlock {
  type: 'phrase';
  id?: string;
  russian: string;
  armenian: string;
  transcription: string;
  translation: string;
  audioSrc?: string;
  context?: string;
  reviewable?: boolean;
  status?: 'new' | 'learned' | 'review';
  learningItemId?: string;
}

export interface PhraseCardBlock {
  type: 'phraseCard';
  id?: string;
  russian: string;
  armenian: string;
  transcription: string;
  translation: string;
  audioSrc?: string;
  context?: string;
  reviewable?: boolean;
  status?: 'new' | 'learned' | 'review';
  learningItemId?: string;
}

export interface HeadingBlock {
  type: 'heading';
  text: string;
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface ReadingTextBlock {
  type: 'readingText';
  content: string;
}

export interface RuleBlock {
  type: 'rule';
  title: string;
  items: string[];
}

export interface MultipleChoiceBlock {
  type: 'multipleChoice';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation?: string;
}

export interface AudioBubbleBlock {
  type: 'audio';
  sender: 'teacher' | 'student';
  senderName: string;
  text: string;
  duration?: number;
  src: string;
}

export interface AudioExampleBlock {
  type: 'audioExample';
  title: string;
  description?: string;
  audioSrc: string;
  duration?: number;
}

export interface TeacherBubbleBlock {
  type: 'teacherBubble';
  teacherName: string;
  teacherAvatarUrl?: string;
  text: string;
  audioSrc: string;
  duration?: number;
}

export interface StudentBubbleBlock {
  type: 'studentBubble';
  studentName: string;
  text: string;
  audioSrc: string;
  duration?: number;
}

export interface VideoBubbleBlock {
  type: 'video';
  senderName: string;
  text: string;
  videoSrc: string;
  thumbnail: string;
}

export interface RecordBlock {
  type: 'record';
  prompt: string;
  tracking?: InteractionTracking;
}

export interface PronunciationPromptBlock {
  type: 'pronunciationPrompt';
  prompt: string;
  tracking?: InteractionTracking;
}

export interface DialogueBlock {
  type: 'dialogue';
  characterName: string;
  characterRole?: string;
  message: string;
  instruction: string;
  options: Array<{
    id: string;
    text: string;
    translation?: string;
    correct: boolean;
    reply: string;
    feedback?: string;
  }>;
  tracking?: InteractionTracking;
}

export interface ActiveRecallBlock {
  type: 'activeRecall';
  prompt: string;
  hint: string;
  answer: {
    armenian: string;
    transcription: string;
    translation: string;
  };
  reviewIds: string[];
  tracking?: InteractionTracking;
}

export type ContentBlock =
  | PhraseBlock
  | PhraseCardBlock
  | HeadingBlock
  | TextBlock
  | ReadingTextBlock
  | RuleBlock
  | MultipleChoiceBlock
  | AudioBubbleBlock
  | AudioExampleBlock
  | TeacherBubbleBlock
  | StudentBubbleBlock
  | VideoBubbleBlock
  | RecordBlock
  | PronunciationPromptBlock
  | DialogueBlock
  | ActiveRecallBlock;

export interface LessonContentSection {
  id: number;
  /** UUID of the section on the server — populated when loading from real API */
  apiId?: string;
  /** Confirmed server state, used to hydrate local progress across devices. */
  serverCompleted?: boolean;
  canonical?: {
    lessonId: string;
    lessonRevision: number;
    stepId: string;
    learningItems: LearningItem[];
  };
  title?: string;
  kind?: 'situation' | 'phrases' | 'pronunciation' | 'dialogue' | 'recall' | 'completion';
  objective?: string;
  blocks: ContentBlock[];
  quizId?: string;
  dictionaryWordIds?: string[];
}

// Backward-compatible alias while UI moves from pages to sections.
export type LessonPage = LessonContentSection;
