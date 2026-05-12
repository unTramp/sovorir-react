import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReviewStore } from '../../stores/useReviewStore';
import type { QueueItem } from '../../types/review';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '../../lib/apiClient';

const mockQueueItem: QueueItem = {
  submission: {
    id: 'sub-1',
    assignmentId: 'asgn-1',
    studentId: 'student-1',
    status: 'submitted',
    audioUrl: null,
    textContent: 'Ответ студента',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  assignmentTitle: 'Запишите приветствие',
  studentName: 'Андрей Дорофеев',
};

beforeEach(() => {
  useReviewStore.setState({ queue: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

describe('useReviewStore', () => {
  it('loadQueue fetches from /review-queue and stores result', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([mockQueueItem]);
    await useReviewStore.getState().loadQueue();
    expect(apiClient.get).toHaveBeenCalledWith('/review-queue');
    expect(useReviewStore.getState().queue).toEqual([mockQueueItem]);
  });

  it('loadQueue sets error on failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
    await useReviewStore.getState().loadQueue();
    expect(useReviewStore.getState().error).toBe('Network error');
    expect(useReviewStore.getState().queue).toEqual([]);
  });

  it('submitReview removes item from queue optimistically', async () => {
    useReviewStore.setState({ queue: [mockQueueItem] });
    vi.mocked(apiClient.post).mockResolvedValue({});
    await useReviewStore.getState().submitReview('sub-1', {
      grammarScore: 4,
      vocabularyScore: 4,
      pronunciationScore: 3,
      fluencyScore: 5,
      status: 'accepted',
    });
    expect(useReviewStore.getState().queue).toHaveLength(0);
    expect(apiClient.post).toHaveBeenCalledWith('/submissions/sub-1/review', expect.objectContaining({ status: 'accepted' }));
  });

  it('submitReview sets error and rethrows on failure', async () => {
    useReviewStore.setState({ queue: [mockQueueItem] });
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Server error'));
    await expect(
      useReviewStore.getState().submitReview('sub-1', {
        grammarScore: 5, vocabularyScore: 5, pronunciationScore: 5, fluencyScore: 5, status: 'accepted',
      }),
    ).rejects.toThrow();
    expect(useReviewStore.getState().error).toBe('Server error');
  });

  it('setStatus updates submission status in queue optimistically', async () => {
    useReviewStore.setState({ queue: [mockQueueItem] });
    vi.mocked(apiClient.post).mockResolvedValue({});
    await useReviewStore.getState().setStatus('sub-1', 'needs_revision');
    expect(useReviewStore.getState().queue[0].submission.status).toBe('needs_revision');
    expect(apiClient.post).toHaveBeenCalledWith('/submissions/sub-1/status', { status: 'needs_revision' });
  });

  it('setStatus with needs_revision keeps item in queue', async () => {
    useReviewStore.setState({ queue: [mockQueueItem] });
    vi.mocked(apiClient.post).mockResolvedValue({});
    await useReviewStore.getState().setStatus('sub-1', 'needs_revision');
    expect(useReviewStore.getState().queue).toHaveLength(1);
  });
});
