import type { MediaAsset, UUID } from './shared';

export type LearningItemType = 'word' | 'phrase' | 'sentence' | 'reply';
export type LearningItemRegister = 'informal' | 'neutral' | 'polite' | 'formal';

export interface LearningItem {
  id: UUID;
  revision: number;
  type: LearningItemType;
  armenian: string;
  transliteration: string;
  translation: string;
  phoneticHint?: string;
  audio?: {
    normal: MediaAsset;
    slow?: MediaAsset;
  };
  contexts: string[];
  register: LearningItemRegister;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  reviewable: boolean;
}

