import type { ContentBlock } from './lessonContent';

export type AdminLessonStatus = 'draft' | 'published' | 'archived';

export type AdminSectionType =
  | 'video'
  | 'dictionary'
  | 'notes'
  | 'ai_practice'
  | 'intro'
  | 'vocabulary'
  | 'grammar'
  | 'practice'
  | 'quiz'
  | 'speaking'
  | 'review';

export type AdminBlockType = ContentBlock['type'];

export interface AdminCourseSummary {
  id: string;
  title: string;
}

export interface AdminLessonSummary {
  id: string;
  courseId: string;
  title: string;
  slug: string | null;
  description: string | null;
  status: AdminLessonStatus;
  orderIndex: number;
  courseTitle: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface AdminLessonBlock {
  id: string;
  sectionId: string;
  orderIndex: number;
  type: AdminBlockType;
  content: ContentBlock;
  createdAt: string;
}

export interface AdminLessonSection {
  id: string;
  lessonId: string;
  title: string;
  orderIndex: number;
  type: AdminSectionType;
  content: Record<string, unknown> | null;
  createdAt: string;
  blocks: AdminLessonBlock[];
}

export interface AdminLessonBuilder {
  id: string;
  courseId: string;
  title: string;
  slug: string | null;
  description: string | null;
  status: AdminLessonStatus;
  orderIndex: number;
  publishedAt: string | null;
  createdAt: string;
  sections: AdminLessonSection[];
}

export interface AdminAiLessonDraftRequest {
  title: string;
  objective?: string;
  vocabulary?: string[];
  grammarFocus?: string;
  sectionCount?: number;
  difficulty?: string;
}

export interface AdminAiLessonDraft {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    type: AdminSectionType;
    content?: Record<string, unknown> | null;
    blocks: ContentBlock[];
  }>;
}

export interface AdminAiQuizDraft {
  title: string;
  questions: Array<
    | {
        type: 'multiple-choice';
        question: string;
        options: [string, string, string, string];
        correctIndex: number;
        explanation?: string;
      }
    | {
        type: 'match-pairs';
        pairs: Array<{ left: string; right: string }>;
      }
  >;
}

export interface AdminAiLessonReview {
  summary: string;
  strengths: string[];
  risks: string[];
  suggestions: string[];
}
