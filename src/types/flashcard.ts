export interface FlashcardProgress {
  wordId: string;
  interval: number;     // days until next review
  nextReview: number;   // timestamp
  easeFactor: number;   // SM-2 ease factor
}

export interface FlashcardSession {
  cards: string[];       // wordId[]
  currentIndex: number;
  results: Record<string, 'again' | 'hard' | 'easy'>;
}
