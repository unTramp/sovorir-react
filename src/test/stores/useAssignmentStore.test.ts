import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import type { Assignment, Submission } from '../../types/assignment';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '../../lib/apiClient';

const mockAssignment: Assignment = {
  id: 'asgn-1',
  sectionId: 'sec-1',
  title: 'Тест задание',
  description: 'Описание',
  dueAt: null,
  createdAt: new Date().toISOString(),
};

const mockSubmission: Submission = {
  id: 'sub-1',
  assignmentId: 'asgn-1',
  studentId: 'student-1',
  status: 'submitted',
  audioUrl: null,
  textContent: 'Мой ответ',
  submittedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  useAssignmentStore.setState({ assignments: [], submissions: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

describe('useAssignmentStore', () => {
  it('loadAssignments calls /assignments and stores result', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([mockAssignment]);
    await useAssignmentStore.getState().loadAssignments();
    expect(apiClient.get).toHaveBeenCalledWith('/assignments');
    expect(useAssignmentStore.getState().assignments).toEqual([mockAssignment]);
  });

  it('loadAssignments with sectionId appends query param', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await useAssignmentStore.getState().loadAssignments('sec-1');
    expect(apiClient.get).toHaveBeenCalledWith('/assignments?sectionId=sec-1');
  });

  it('loadAssignments sets error on failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
    await useAssignmentStore.getState().loadAssignments();
    expect(useAssignmentStore.getState().error).toBe('Network error');
  });

  it('loadMySubmissions calls /my-submissions and stores result', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([mockSubmission]);
    await useAssignmentStore.getState().loadMySubmissions();
    expect(apiClient.get).toHaveBeenCalledWith('/my-submissions');
    expect(useAssignmentStore.getState().submissions).toEqual([mockSubmission]);
  });

  it('submitAssignment calls correct endpoint and adds submission', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockSubmission);
    await useAssignmentStore.getState().submitAssignment('asgn-1', { textContent: 'Ответ' });
    expect(apiClient.post).toHaveBeenCalledWith('/assignments/asgn-1/submit', { textContent: 'Ответ' });
    expect(useAssignmentStore.getState().submissions).toContainEqual(mockSubmission);
  });

  it('submitAssignment replaces existing submission for same assignment', async () => {
    const updated = { ...mockSubmission, textContent: 'Новый ответ' };
    useAssignmentStore.setState({ submissions: [mockSubmission] });
    vi.mocked(apiClient.post).mockResolvedValue(updated);
    await useAssignmentStore.getState().submitAssignment('asgn-1', { textContent: 'Новый ответ' });
    expect(useAssignmentStore.getState().submissions).toHaveLength(1);
    expect(useAssignmentStore.getState().submissions[0].textContent).toBe('Новый ответ');
  });

  it('submitAssignment throws and sets error on failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Server error'));
    await expect(
      useAssignmentStore.getState().submitAssignment('asgn-1', {}),
    ).rejects.toThrow();
    expect(useAssignmentStore.getState().error).toBe('Server error');
  });

  it('getSubmissionForAssignment returns correct submission', () => {
    useAssignmentStore.setState({ submissions: [mockSubmission] });
    const result = useAssignmentStore.getState().getSubmissionForAssignment('asgn-1');
    expect(result).toEqual(mockSubmission);
  });

  it('getSubmissionForAssignment returns undefined when not found', () => {
    useAssignmentStore.setState({ submissions: [] });
    const result = useAssignmentStore.getState().getSubmissionForAssignment('unknown');
    expect(result).toBeUndefined();
  });

  it('optimisticallyUpdateStatus updates submission status in store', () => {
    useAssignmentStore.setState({ submissions: [mockSubmission] });
    useAssignmentStore.getState().optimisticallyUpdateStatus('sub-1', 'accepted');
    expect(useAssignmentStore.getState().submissions[0].status).toBe('accepted');
  });
});
