export interface PhraseBlock {
  type: 'phrase';
  russian: string;
  armenian: string;
  transcription: string;
  translation: string;
  audioSrc?: string;
  status?: 'new' | 'learned' | 'review';
}

export interface HeadingBlock {
  type: 'heading';
  text: string;
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface RuleBlock {
  type: 'rule';
  title: string;
  items: string[];
}

export interface AudioBubbleBlock {
  type: 'audio';
  sender: 'teacher' | 'student';
  senderName: string;
  text: string;
  duration: number;
  src: string;
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
}

export type ContentBlock = PhraseBlock | HeadingBlock | TextBlock | RuleBlock | AudioBubbleBlock | VideoBubbleBlock | RecordBlock;

export interface LessonContentSection {
  id: number;
  title?: string;
  blocks: ContentBlock[];
  quizId?: string;
  dictionaryWordIds?: string[];
}

// Backward-compatible alias while UI moves from pages to sections.
export type LessonPage = LessonContentSection;
