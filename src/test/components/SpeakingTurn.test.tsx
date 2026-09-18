import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SpeakingTurn } from '../../components/lesson/SpeakingTurn';

afterEach(cleanup);

describe('SpeakingTurn', () => {
  it('presents an active speaking prompt as the learner turn', () => {
    const onSkip = vi.fn();

    render(
      <SpeakingTurn
        block={{ type: 'record', prompt: 'Произнесите: Բարև' }}
        onSkip={onSkip}
        completed={false}
        sectionId={1}
        recordIndex={0}
      />,
    );

    expect(screen.getByLabelText('Ваш ход')).toBeInTheDocument();
    expect(screen.getByText('Произнесите')).toBeInTheDocument();
    expect(screen.getByText('Բարև')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Пропустить' }));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
