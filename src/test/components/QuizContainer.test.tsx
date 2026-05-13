import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuizContainer } from '../../components/quiz/QuizContainer';
import type { Quiz, QuizResult } from '../../types/quiz';

const QUIZ: Quiz = {
  id: 'q1',
  sectionId: 1,
  questions: [
    {
      type: 'multiple-choice',
      question: 'Как будет "Привет" по-армянски?',
      options: ['Բarев', 'Ողджуйн', 'Шноракалутюн', 'Лав'],
      correctIndex: 0,
    },
    {
      type: 'multiple-choice',
      question: 'Что значит "Лав"?',
      options: ['Плохо', 'Хорошо', 'До свидания', 'Спасибо'],
      correctIndex: 1,
    },
    {
      type: 'multiple-choice',
      question: 'Как сказать "Спасибо"?',
      options: ['Барев', 'Лав', 'Шноракалутюн', 'Ողджуйн'],
      correctIndex: 2,
    },
  ],
};

describe('QuizContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders first question and progress', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);
    expect(screen.getByText('Как будет "Привет" по-армянски?')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('advances to next question after correct answer', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText('Բarев'));
    act(() => { vi.advanceTimersByTime(800); });
    expect(screen.getByText('Что значит "Лав"?')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('advances to next question after wrong answer', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText('Ողджуйн')); // wrong
    act(() => { vi.advanceTimersByTime(800); });
    expect(screen.getByText('Что значит "Лав"?')).toBeInTheDocument();
  });

  it('disables options after selection', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText('Բarев'));
    const options = screen.getAllByRole('button');
    options.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('calls onComplete with correct result after last question', () => {
    const onComplete = vi.fn();
    render(<QuizContainer quiz={QUIZ} onComplete={onComplete} />);

    // Q1 correct
    fireEvent.click(screen.getByText('Բarев'));
    act(() => { vi.advanceTimersByTime(800); });

    // Q2 correct
    fireEvent.click(screen.getByText('Хорошо'));
    act(() => { vi.advanceTimersByTime(800); });

    // Q3 correct
    fireEvent.click(screen.getByText('Шноракалутюн'));
    act(() => { vi.advanceTimersByTime(800); });

    expect(onComplete).toHaveBeenCalledOnce();
    const result: QuizResult = onComplete.mock.calls[0][0];
    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.passed).toBe(true);
  });

  it('shows passed result screen when score >= 70%', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByText('Բarев')); // correct
    act(() => { vi.advanceTimersByTime(800); });
    fireEvent.click(screen.getByText('Хорошо')); // correct
    act(() => { vi.advanceTimersByTime(800); });
    fireEvent.click(screen.getByText('Шноракалутюн')); // correct
    act(() => { vi.advanceTimersByTime(800); });

    expect(screen.getByText('Тест пройден!')).toBeInTheDocument();
    expect(screen.getByText('3 из 3 (100%)')).toBeInTheDocument();
  });

  it('shows failed result screen when score < 70%', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByText('Ողджуйн')); // wrong
    act(() => { vi.advanceTimersByTime(800); });
    fireEvent.click(screen.getByText('Плохо')); // wrong
    act(() => { vi.advanceTimersByTime(800); });
    fireEvent.click(screen.getByText('Барев')); // wrong
    act(() => { vi.advanceTimersByTime(800); });

    expect(screen.getByText('Попробуйте ещё раз')).toBeInTheDocument();
  });

  it('resets and shows first question after retry', () => {
    render(<QuizContainer quiz={QUIZ} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByText('Ողджуйн')); // wrong
    act(() => { vi.advanceTimersByTime(800); });
    fireEvent.click(screen.getByText('Плохо')); // wrong
    act(() => { vi.advanceTimersByTime(800); });
    fireEvent.click(screen.getByText('Барев')); // wrong
    act(() => { vi.advanceTimersByTime(800); });

    fireEvent.click(screen.getByText('Повторить'));
    expect(screen.getByText('Как будет "Привет" по-армянски?')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
