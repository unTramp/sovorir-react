export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'needs_revision'
  | 'accepted';

export interface Assignment {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  dueAt: string | null; // ISO date string
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  audioUrl: string | null;
  textContent: string | null;
  submittedAt: string | null;
  createdAt: string;
}

export interface SubmitPayload {
  textContent?: string;
  audioUrl?: string;
}
