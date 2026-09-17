import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignmentsView } from '../../components/center/AssignmentsView';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import type { Assignment, Submission } from '../../types/assignment';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../hooks/useMediaRecorder', () => ({
  useMediaRecorder: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    isRecording: false,
    audioBlob: null,
    audioLevel: 0,
    duration: 0,
    error: null,
  }),
}));

vi.mock('../../components/audio/AudioLevelMeter', () => ({
  AudioLevelMeter: () => null,
}));

const mockAssignment: Assignment = {
  id: 'asgn-1',
  sectionId: 'sec-1',
  title: 'Перевод текста',
  description: 'Переведите текст на армянский',
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
  useAssignmentStore.setState({
    assignments: [],
    submissions: [],
    isLoading: false,
    error: null,
    loadAssignments: vi.fn().mockResolvedValue(undefined),
    loadMySubmissions: vi.fn().mockResolvedValue(undefined),
  } as never);
  vi.clearAllMocks();
});

describe('AssignmentsView', () => {
  it('renders list of assignments', () => {
    useAssignmentStore.setState({ assignments: [mockAssignment] } as never);
    render(<AssignmentsView />);
    expect(screen.getByText('Перевод текста')).toBeInTheDocument();
    expect(screen.getByText('Переведите текст на армянский')).toBeInTheDocument();
  });

  it('shows empty state when no assignments', () => {
    render(<AssignmentsView />);
    expect(screen.getByText('Заданий пока нет')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    useAssignmentStore.setState({ isLoading: true, assignments: [] } as never);
    render(<AssignmentsView />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('shows pending status and an action when no submission', () => {
    useAssignmentStore.setState({ assignments: [mockAssignment], submissions: [] } as never);
    render(<AssignmentsView />);
    expect(screen.getByText('Нужно выполнить')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Перевод текста. Выполнить' })).toBeInTheDocument();
  });

  it('shows correct status badge for submitted assignment', () => {
    useAssignmentStore.setState({
      assignments: [mockAssignment],
      submissions: [mockSubmission],
    } as never);
    render(<AssignmentsView />);
    expect(screen.getByText('Отправлено')).toBeInTheDocument();
  });

  it('shows "Доработать" button for needs_revision status', () => {
    const revisionSubmission = { ...mockSubmission, status: 'needs_revision' as const };
    useAssignmentStore.setState({
      assignments: [mockAssignment],
      submissions: [revisionSubmission],
    } as never);
    render(<AssignmentsView />);
    expect(screen.getByText('Нужна доработка')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Перевод текста. Доработать' })).toBeInTheDocument();
  });

  it('shows a checked assignment as an openable answer', () => {
    const acceptedSubmission = { ...mockSubmission, status: 'accepted' as const };
    useAssignmentStore.setState({
      assignments: [mockAssignment],
      submissions: [acceptedSubmission],
    } as never);
    render(<AssignmentsView />);
    expect(screen.getByText('Проверено')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Перевод текста. Посмотреть ответ' })).toBeInTheDocument();
  });

  it('opens SubmitModal on button click', () => {
    useAssignmentStore.setState({ assignments: [mockAssignment], submissions: [] } as never);
    render(<AssignmentsView />);
    fireEvent.click(screen.getByRole('button', { name: 'Перевод текста. Выполнить' }));
    expect(screen.getByPlaceholderText('Напишите ответ...')).toBeInTheDocument();
  });

  it('opens a submitted assignment in read-only mode', () => {
    useAssignmentStore.setState({
      assignments: [mockAssignment],
      submissions: [mockSubmission],
    } as never);
    render(<AssignmentsView />);

    fireEvent.click(screen.getByRole('button', { name: 'Перевод текста. Посмотреть ответ' }));

    expect(screen.getByDisplayValue('Мой ответ')).toHaveAttribute('readonly');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('marks an unfinished past-due assignment as overdue', () => {
    useAssignmentStore.setState({
      assignments: [{ ...mockAssignment, dueAt: '2020-01-01T00:00:00.000Z' }],
      submissions: [],
    } as never);
    render(<AssignmentsView />);

    expect(screen.getByText('Просрочено')).toBeInTheDocument();
  });
});
