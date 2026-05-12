import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';
import type { QueueItem, ReviewPayload } from '../types/review';
import type { SubmissionStatus } from '../types/assignment';

interface ReviewState {
  queue: QueueItem[];
  isLoading: boolean;
  error: string | null;

  loadQueue: () => Promise<void>;
  submitReview: (submissionId: string, payload: ReviewPayload) => Promise<void>;
  setStatus: (submissionId: string, status: SubmissionStatus) => Promise<void>;
}

export const useReviewStore = create<ReviewState>()((set) => ({
  queue: [],
  isLoading: false,
  error: null,

  loadQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get<QueueItem[]>('/review-queue');
      set({ queue: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка загрузки очереди', isLoading: false });
    }
  },

  submitReview: async (submissionId, payload) => {
    // Optimistically remove from queue before the request completes
    set((state) => ({
      queue: state.queue.filter((item) => item.submission.id !== submissionId),
    }));
    try {
      await apiClient.post(`/submissions/${submissionId}/review`, payload);
    } catch (err) {
      // Re-load on failure so queue stays consistent
      set({ error: err instanceof Error ? err.message : 'Ошибка сохранения проверки' });
      throw err;
    }
  },

  setStatus: async (submissionId, status) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.submission.id === submissionId
          ? { ...item, submission: { ...item.submission, status } }
          : item,
      ),
    }));
    try {
      await apiClient.post(`/submissions/${submissionId}/status`, { status });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка изменения статуса' });
      throw err;
    }
  },
}));
