import type { Submission } from './assignment';

export interface Review {
  id: string;
  submissionId: string;
  teacherId: string;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  comment: string | null;
  audioCommentUrl: string | null;
  createdAt: string;
}

export interface ReviewPayload {
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  comment?: string;
  status: 'accepted' | 'needs_revision';
}

export interface QueueItem {
  submission: Submission;
  assignmentTitle: string;
  studentName: string;
}
