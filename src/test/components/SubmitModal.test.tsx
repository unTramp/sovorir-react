import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitModal } from '../../components/assignments/SubmitModal';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import type { Assignment } from '../../types/assignment';

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
  title: 'Тест задание',
  description: 'Описание задания',
  dueAt: null,
  createdAt: new Date().toISOString(),
};

const mockOnClose = vi.fn();

beforeEach(() => {
  useAssignmentStore.setState({ assignments: [], submissions: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

describe('SubmitModal', () => {
  it('renders text input and record button', () => {
    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Напишите ответ...')).toBeInTheDocument();
    expect(screen.getByText(/Удерживайте для записи/)).toBeInTheDocument();
  });

  it('shows assignment title and description', () => {
    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    expect(screen.getByText('Тест задание')).toBeInTheDocument();
    expect(screen.getByText('Описание задания')).toBeInTheDocument();
  });

  it('submit button disabled when no content', () => {
    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    const submitBtn = screen.getByText('Отправить');
    expect(submitBtn).toBeDisabled();
  });

  it('submit button enabled when text entered', () => {
    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    const textarea = screen.getByPlaceholderText('Напишите ответ...');
    fireEvent.change(textarea, { target: { value: 'Мой ответ' } });
    expect(screen.getByText('Отправить')).not.toBeDisabled();
  });

  it('shows success state after submission', async () => {
    useAssignmentStore.setState({
      submitAssignment: vi.fn().mockResolvedValue(undefined),
    } as never);

    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    const textarea = screen.getByPlaceholderText('Напишите ответ...');
    fireEvent.change(textarea, { target: { value: 'Мой ответ' } });
    fireEvent.click(screen.getByText('Отправить'));

    await waitFor(() => {
      expect(screen.getByText('Задание отправлено!')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    useAssignmentStore.setState({
      submitAssignment: vi.fn().mockRejectedValue(new Error('Server error')),
    } as never);

    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    const textarea = screen.getByPlaceholderText('Напишите ответ...');
    fireEvent.change(textarea, { target: { value: 'Мой ответ' } });
    fireEvent.click(screen.getByText('Отправить'));

    await waitFor(() => {
      expect(screen.getByText(/Не удалось отправить/)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button clicked', () => {
    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Отмена'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when close icon clicked', () => {
    render(<SubmitModal assignment={mockAssignment} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});
