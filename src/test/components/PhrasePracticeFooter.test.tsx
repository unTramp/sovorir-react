import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PhrasePracticeFooter } from '../../components/lesson/PhrasePracticeFooter';

afterEach(cleanup);

describe('PhrasePracticeFooter', () => {
  it('keeps Continue disabled until the phrase recording is ready', () => {
    const onContinue = vi.fn();

    const { rerender } = render(
      <PhrasePracticeFooter
        current={2}
        total={4}
        canContinue={false}
        onContinue={onContinue}
      />,
    );

    expect(screen.getByText('Фраза 2 из 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Продолжить/i })).toBeDisabled();

    rerender(
      <PhrasePracticeFooter
        current={2}
        total={4}
        canContinue
        onContinue={onContinue}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
