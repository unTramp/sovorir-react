export interface PhraseBlock {
  type: 'phrase';
  russian: string;
  armenian: string;
  transcription: string;
  translation: string;
  audioSrc?: string;
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

export type ContentBlock = PhraseBlock | HeadingBlock | TextBlock | RuleBlock;

export interface LessonPage {
  id: number;
  blocks: ContentBlock[];
}
