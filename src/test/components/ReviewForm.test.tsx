import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from '../../components/assignments/ReviewForm';
import { useReviewStore } from '../../stores/useReviewStore';
import type { QueueItem } from '../../types/review';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockItem: QueueItem = {
  submission: {
    id: 'sub-1',
    assignmentId: 'asgn-1',
    studentId: 'student-1',
    status: 'submitted',
    audioUrl: null,
    textContent: 'Мой ответ на задание',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  assignmentTitle: 'Запишите приветствие',
  studentName: 'Андрей Дорофеев',
};

const mockOnClose = vi.fn();

beforeEach(() => {
  useReviewStore.setState({ queue: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

function fillAllScores() {
  // Click score 5 for each of 4 criteria
  const dots = screen.getAllByLabelText(/5$/);
  dots.forEach((dot) => fireEvent.click(dot));
}

describe('ReviewForm', () => {
  it('renders assignment title and student name', () => {
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    expect(screen.getByText('Запишите приветствие')).toBeInTheDocument();
    expect(screen.getByText('Андрей Дорофеев')).toBeInTheDocument();
  });

  it('renders student answer text', () => {
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    expect(screen.getByText('Мой ответ на задание')).toBeInTheDocument();
  });

  it('renders 4 score criteria', () => {
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    expect(screen.getByText('Грамматика')).toBeInTheDocument();
    expect(screen.getByText('Словарный запас')).toBeInTheDocument();
    expect(screen.getByText('Произношение')).toBeInTheDocument();
    expect(screen.getByText('Беглость')).toBeInTheDocument();
  });

  it('accept and revision buttons disabled when scores not filled', () => {
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    expect(screen.getByText('Принять')).toBeDisabled();
    expect(screen.getByText('На доработку')).toBeDisabled();
  });

  it('accept button enabled after all scores filled', () => {
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    fillAllScores();
    expect(screen.getByText('Принять')).not.toBeDisabled();
    expect(screen.getByText('На доработку')).not.toBeDisabled();
  });

  it('accept button calls submitReview with status accepted', async () => {
    useReviewStore.setState({
      submitReview: vi.fn().mockResolvedValue(undefined),
    } as never);
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    fillAllScores();
    fireEvent.click(screen.getByText('Принять'));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    expect(useReviewStore.getState().submitReview).toHaveBeenCalledWith(
      'sub-1',
      expect.objectContaining({ status: 'accepted' }),
    );
  });

  it('revision button calls submitReview with status needs_revision', async () => {
    useReviewStore.setState({
      submitReview: vi.fn().mockResolvedValue(undefined),
    } as never);
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    fillAllScores();
    fireEvent.click(screen.getByText('На доработку'));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    expect(useReviewStore.getState().submitReview).toHaveBeenCalledWith(
      'sub-1',
      expect.objectContaining({ status: 'needs_revision' }),
    );
  });

  it('shows error message on API failure', async () => {
    useReviewStore.setState({
      submitReview: vi.fn().mockRejectedValue(new Error('Server error')),
    } as never);
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    fillAllScores();
    fireEvent.click(screen.getByText('Принять'));
    await waitFor(() =>
      expect(screen.getByText(/Не удалось сохранить проверку/)).toBeInTheDocument(),
    );
  });

  it('calls onClose when close button clicked', () => {
    render(<ReviewForm item={mockItem} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});
