import type { Recording } from '../types/recording';
import type { FlashcardProgress } from '../types/flashcard';
import type { QuizResult } from '../types/quiz';
import type { ContentRepository } from './contentRepository';
import { contentRepository } from './contentRepository';

export interface DataAccessLayer {
  // Content
  getContent(): ContentRepository;

  // Lesson progress
  getPageProgress(pageId: number): { completedRecords: number[] };
  savePageProgress(pageId: number, completedRecords: number[]): void;

  // Flashcards
  getFlashcardProgress(): Record<string, FlashcardProgress>;
  saveFlashcardProgress(progress: Record<string, FlashcardProgress>): void;

  // Recordings
  getRecordings(): Record<string, Recording>;
  saveRecording(meta: Recording, blob: Blob): Promise<void>;
  getRecordingBlob(id: string): Promise<Blob | undefined>;
  deleteRecording(id: string): Promise<void>;

  // Quizzes
  getQuizResults(): Record<number, QuizResult>;
  saveQuizResult(pageId: number, result: QuizResult): void;
}

class LocalDAL implements DataAccessLayer {
  getContent(): ContentRepository {
    return contentRepository;
  }

  private getStore<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed?.state ?? parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  getPageProgress(pageId: number): { completedRecords: number[] } {
    const data = this.getStore<{ pages: Record<number, { completedRecords: number[] }> }>(
      'sovorir-lesson-progress',
      { pages: {} },
    );
    return data.pages[pageId] || { completedRecords: [] };
  }

  savePageProgress(pageId: number, completedRecords: number[]): void {
    const key = 'sovorir-lesson-progress';
    const data = this.getStore<{ pages: Record<number, { completedRecords: number[] }> }>(
      key,
      { pages: {} },
    );
    data.pages[pageId] = { completedRecords };
    localStorage.setItem(key, JSON.stringify({ state: data }));
  }

  getFlashcardProgress(): Record<string, FlashcardProgress> {
    return this.getStore<{ progress: Record<string, FlashcardProgress> }>(
      'sovorir-flashcard-progress',
      { progress: {} },
    ).progress;
  }

  saveFlashcardProgress(progress: Record<string, FlashcardProgress>): void {
    localStorage.setItem(
      'sovorir-flashcard-progress',
      JSON.stringify({ state: { progress } }),
    );
  }

  getRecordings(): Record<string, Recording> {
    return this.getStore<{ recordings: Record<string, Recording> }>(
      'sovorir-recordings-meta',
      { recordings: {} },
    ).recordings;
  }

  async saveRecording(meta: Recording, blob: Blob): Promise<void> {
    const { saveBlob } = await import('./indexedDB');
    await saveBlob(meta.id, blob);
    const recordings = this.getRecordings();
    recordings[meta.id] = meta;
    localStorage.setItem(
      'sovorir-recordings-meta',
      JSON.stringify({ state: { recordings } }),
    );
  }

  async getRecordingBlob(id: string): Promise<Blob | undefined> {
    const { getBlob } = await import('./indexedDB');
    return getBlob(id);
  }

  async deleteRecording(id: string): Promise<void> {
    const { deleteBlob } = await import('./indexedDB');
    await deleteBlob(id);
    const recordings = this.getRecordings();
    delete recordings[id];
    localStorage.setItem(
      'sovorir-recordings-meta',
      JSON.stringify({ state: { recordings } }),
    );
  }

  getQuizResults(): Record<number, QuizResult> {
    return this.getStore<{ quizResults: Record<number, QuizResult> }>(
      'sovorir-lesson-progress',
      { quizResults: {} },
    ).quizResults || {};
  }

  saveQuizResult(pageId: number, result: QuizResult): void {
    const key = 'sovorir-lesson-progress';
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : { state: {} };
    if (!data.state.quizResults) data.state.quizResults = {};
    data.state.quizResults[pageId] = result;
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const dal: DataAccessLayer = new LocalDAL();
