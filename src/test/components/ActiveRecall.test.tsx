import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActiveRecall } from '../../components/lesson/ActiveRecall';

const block = {
  type: 'activeRecall' as const,
  prompt: 'Поздоровайтесь вежливо.',
  hint: 'Начните с «Барев…»',
  answer: { armenian: 'Բարև ձեզ։', transcription: 'barev dzez', translation: 'Здравствуйте.' },
  reviewIds: ['greeting-polite'],
};

afterEach(cleanup);

describe('ActiveRecall', () => {
  it('keeps the answer hidden and uses a neutral hint action', () => {
    const onComplete = vi.fn();
    render(<ActiveRecall block={block} onComplete={onComplete} />);

    expect(screen.queryByText('Բարև ձեզ։')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Подсказка' }));
    expect(screen.getByText('Начните с «Барев…»')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Я ответил' }));
    expect(screen.getByText('Բարև ձեզ։')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Получилось' }));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
