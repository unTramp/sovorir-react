import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DialogueScene } from '../../components/lesson/DialogueScene';

const block = {
  type: 'dialogue' as const,
  characterName: 'Ани',
  characterRole: 'бариста',
  message: 'Բարև ձեզ։',
  instruction: 'Ответьте вежливо.',
  options: [
    { id: 'yes', text: 'Բարև ձեզ։', correct: true, reply: 'Ի՞նչ կցանկանաք։' },
    { id: 'no', text: 'Ցտեսություն։', correct: false, reply: '', feedback: 'Это прощание — разговор только начинается.' },
  ],
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('DialogueScene', () => {
  it('keeps the learner in the conversation until the correct reply', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<DialogueScene block={block} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ցտեսություն։' }));
    expect(screen.getByText('Это прощание — разговор только начинается.')).toBeInTheDocument();
    expect(screen.getByText('Лусине').closest('.voice-bubble--teacher')).toBeInTheDocument();
    expect(screen.getByText('Ցտեսություն։').closest('.student-bubble')).toHaveClass('student-bubble--error');

    fireEvent.click(screen.getByRole('button', { name: 'Բարև ձեզ։' }));
    expect(screen.getByLabelText('Ани печатает')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1200));

    expect(screen.getByText('Ի՞նչ կցանկանաք։')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
