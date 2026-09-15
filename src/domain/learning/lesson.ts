import type { Interaction } from './interaction';
import type { LearningLevel, MediaAsset, UUID } from './shared';

export type LessonStepType =
  | 'context'
  | 'phrase-intro'
  | 'listen-repeat'
  | 'recognition'
  | 'dialogue'
  | 'active-recall'
  | 'completion';

export type PresentationNode =
  | { id: UUID; type: 'text'; variant: 'body' | 'instruction' | 'note'; text: string }
  | { id: UUID; type: 'learning-item'; itemId: UUID; variant: 'phrase-card' | 'compact-row' }
  | { id: UUID; type: 'mentor-bubble'; text: string; audio?: MediaAsset }
  | { id: UUID; type: 'student-bubble'; text: string; audio?: MediaAsset }
  | { id: UUID; type: 'audio'; title: string; description?: string; asset: MediaAsset }
  | { id: UUID; type: 'rule'; title: string; items: string[] }
  | { id: UUID; type: 'video'; title: string; asset: MediaAsset; thumbnailUrl?: string };

export interface LessonStep {
  id: UUID;
  revision: number;
  order: number;
  type: LessonStepType;
  title?: string;
  objective: string;
  estimatedSeconds?: number;
  mentorMessage?: {
    purpose: 'context' | 'instruction' | 'tip' | 'feedback' | 'culture';
    text: string;
    audio?: MediaAsset;
  };
  learningItemIds: UUID[];
  content: PresentationNode[];
  interactions: Interaction[];
  completion: {
    mode: 'viewed' | 'all-required' | 'any-required';
    requiredInteractionIds?: UUID[];
  };
}

export interface Lesson {
  schemaVersion: 1;
  id: UUID;
  courseId: UUID;
  slug: string;
  revision: number;
  title: string;
  description: string;
  level: LearningLevel;
  estimatedMinutes: number;
  outcomes: string[];
  introMedia?: {
    type: 'none' | 'image' | 'video';
    asset?: MediaAsset;
    poster?: MediaAsset;
  };
  learningItemIds: UUID[];
  steps: LessonStep[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
}

