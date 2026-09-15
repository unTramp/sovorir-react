import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveRecall } from '../../components/lesson/ActiveRecall';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';

const block = {
  type: 'activeRecall' as const,
  prompt: 'Поздоровайтесь вежливо.',
  hint: 'Начните с «Барев…»',
  answer: { armenian: 'Բարև ձեզ։', transcription: 'barev dzez', translation: 'Здравствуйте.' },
  reviewIds: ['greeting-polite'],
  tracking: {
    lessonId: 'dd473bdf-f7a8-4560-aaff-1778d4ba6705', lessonRevision: 1,
    stepId: '81d3f8a4-3d95-46a0-8fab-b3b2bcc876b5',
    interactionId: '93604e4a-21ee-4b73-83a1-9a6e2a45849b',
    learningItemIds: ['59400459-0a85-4d9a-b46b-a2d75d930b40'],
  },
};

afterEach(cleanup);
beforeEach(() => {
  useInteractionAttemptStore.setState({ attempts: {} });
  useLessonAttemptSessionStore.setState({ attemptIds: {} });
});

describe('ActiveRecall', () => {
  it('keeps the answer hidden and uses a neutral hint action', () => {
    const onComplete = vi.fn();
    render(<ActiveRecall block={block} onComplete={onComplete} />);

    expect(screen.queryByText('Բարև ձեզ։')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Нужна подсказка' }));
    expect(screen.getByRole('dialog', { name: 'Вспомните звучание' })).toBeInTheDocument();
    expect(screen.getByText('Начните с «Барев…»')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать самому' }));

    fireEvent.click(screen.getByRole('button', { name: 'Я ответил' }));
    expect(screen.getByText('Բարև ձեզ։')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Получилось' }));
    expect(onComplete).toHaveBeenCalledOnce();
    const attempt = Object.values(useInteractionAttemptStore.getState().attempts)[0];
    expect(attempt).toMatchObject({ status: 'completed', outcome: 'correct', hintUsed: true });
  });
});
