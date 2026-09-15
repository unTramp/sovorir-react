import type { MediaAsset, UUID } from './shared';

interface InteractionBase {
  id: UUID;
  revision: number;
  required: boolean;
  learningItemIds: UUID[];
  analyticsKey: string;
}

export interface ListenRepeatInteraction extends InteractionBase {
  type: 'listen-repeat';
  prompt: string;
  referenceAudio?: MediaAsset;
  recordingMode: 'tap-to-record';
  minimumAttempts: number;
  allowComparison: boolean;
}

export interface ChoiceInteraction extends InteractionBase {
  type: 'choice';
  prompt: string;
  shuffle: boolean;
  options: Array<{
    id: UUID;
    text: string;
    learningItemId?: UUID;
    correct: boolean;
    feedback?: string;
  }>;
}

export interface DialogueInteraction extends InteractionBase {
  type: 'dialogue';
  context: string;
  turns: Array<{
    id: UUID;
    speaker: 'mentor' | 'student' | 'character';
    text?: string;
    audio?: MediaAsset;
  }>;
  responseMode: 'choice' | 'voice';
  options?: Array<{
    id: UUID;
    text: string;
    correct: boolean;
    feedback: string;
  }>;
}

export interface RecallInteraction extends InteractionBase {
  type: 'recall';
  prompt: string;
  responseMode: 'voice' | 'self-report';
  hint?: {
    type: 'text' | 'reveal-item' | 'audio';
    text?: string;
    learningItemId?: UUID;
    audio?: MediaAsset;
  };
  evaluation: 'self-report';
}

export type Interaction =
  | ListenRepeatInteraction
  | ChoiceInteraction
  | DialogueInteraction
  | RecallInteraction;

export type InteractionAttemptStatus = 'started' | 'completed' | 'skipped';
export type InteractionAttemptOutcome = 'correct' | 'incorrect' | 'needs-review' | 'completed';

export interface InteractionAttempt {
  id: UUID;
  lessonAttemptId: UUID;
  lessonId: UUID;
  lessonRevision: number;
  stepId: UUID;
  interactionId: UUID;
  status: InteractionAttemptStatus;
  outcome?: InteractionAttemptOutcome;
  hintUsed: boolean;
  retryCount: number;
  selectedOptionId?: UUID;
  recordingId?: UUID;
  startedAt: string;
  completedAt?: string;
}

