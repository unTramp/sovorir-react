export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation?: string;
}

export interface MatchPairsQuestion {
  type: 'match-pairs';
  pairs: { left: string; right: string }[];
}

export type QuizQuestion = MultipleChoiceQuestion | MatchPairsQuestion;

export interface Quiz {
  id: string;
  sectionId: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  passed: boolean;
  completedAt: number;
}
