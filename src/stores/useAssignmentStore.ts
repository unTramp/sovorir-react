import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';
import type { Assignment, Submission, SubmitPayload, SubmissionStatus } from '../types/assignment';

interface AssignmentState {
  assignments: Assignment[];
  submissions: Submission[];
  isLoading: boolean;
  error: string | null;

  loadAssignments: (sectionId?: string) => Promise<void>;
  loadMySubmissions: () => Promise<void>;
  submitAssignment: (assignmentId: string, payload: SubmitPayload) => Promise<void>;
  getSubmissionForAssignment: (assignmentId: string) => Submission | undefined;
  optimisticallyUpdateStatus: (submissionId: string, status: SubmissionStatus) => void;
}

export const useAssignmentStore = create<AssignmentState>()((set, get) => ({
  assignments: [],
  submissions: [],
  isLoading: false,
  error: null,

  loadAssignments: async (sectionId) => {
    set({ isLoading: true, error: null });
    try {
      const path = sectionId ? `/assignments?sectionId=${sectionId}` : '/assignments';
      const data = await apiClient.get<Assignment[]>(path);
      set({ assignments: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка загрузки заданий', isLoading: false });
    }
  },

  loadMySubmissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get<Submission[]>('/my-submissions');
      set({ submissions: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка загрузки сабмитов', isLoading: false });
    }
  },

  submitAssignment: async (assignmentId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const submission = await apiClient.post<Submission>(
        `/assignments/${assignmentId}/submit`,
        payload,
      );
      set((state) => ({
        submissions: [
          ...state.submissions.filter((s) => s.assignmentId !== assignmentId),
          submission,
        ],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка отправки задания', isLoading: false });
      throw err;
    }
  },

  getSubmissionForAssignment: (assignmentId) => {
    return get().submissions.find((s) => s.assignmentId === assignmentId);
  },

  optimisticallyUpdateStatus: (submissionId, status) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId ? { ...s, status } : s,
      ),
    }));
  },
}));
