export interface PhraseBlock {
  type: 'phrase';
  russian: string;
  armenian: string;
  transcription: string;
  translation: string;
  audioSrc?: string;
  status?: 'new' | 'learned' | 'review';
}

export interface PhraseCardBlock {
  type: 'phraseCard';
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
}

export interface PronunciationPromptBlock {
  type: 'pronunciationPrompt';
  prompt: string;
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
  | PronunciationPromptBlock;

export interface LessonContentSection {
  id: number;
  /** UUID of the section on the server — populated when loading from real API */
  apiId?: string;
  title?: string;
  blocks: ContentBlock[];
  quizId?: string;
  dictionaryWordIds?: string[];
}

// Backward-compatible alias while UI moves from pages to sections.
export type LessonPage = LessonContentSection;
