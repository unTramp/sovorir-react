import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MiniDialogue } from '../../components/lesson/MiniDialogue';

const block = {
  type: 'dialogue' as const,
  characterName: 'Ани',
  characterRole: 'бариста',
  message: 'Բարև ձեզ։',
  instruction: 'Ответьте вежливо.',
  options: [
    { id: 'yes', text: 'Բարև ձեզ։', correct: true, reply: 'Ի՞նչ կցանկանաք։' },
    { id: 'no', text: 'Ցտեսություն։', correct: false, reply: '' },
  ],
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('MiniDialogue', () => {
  it('keeps the learner in the conversation until the correct reply', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<MiniDialogue block={block} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ցտեսություն։' }));
    expect(screen.getByText('Попробуйте выбрать вежливое приветствие.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Բարև ձեզ։' }));
    expect(screen.getByLabelText('Ани печатает')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(650));

    expect(screen.getByText('Ի՞նչ կցանկանաք։')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
