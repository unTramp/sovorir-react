import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PhraseCard } from '../../components/lesson/PhraseCard';
import { useAudioStore } from '../../stores/useAudioStore';

const phrase = {
  type: 'phrase' as const,
  armenian: 'Բարև',
  transcription: 'barev',
  russian: 'Барев',
  translation: 'Привет',
  audioSrc: '/audio/barev.opus',
};

describe('PhraseCard', () => {
  beforeEach(() => {
    useAudioStore.setState({
      playingId: null,
      loadingId: null,
      errorId: null,
      progress: {},
    });
  });

  afterEach(cleanup);

  it('exposes a specific accessible play action', () => {
    render(<PhraseCard block={phrase} audioId="phrase-1-0" />);

    expect(screen.getByRole('button', { name: 'Прослушать произношение Բարև' }))
      .toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the active playback state and progress', () => {
    useAudioStore.setState({ playingId: 'phrase-1-0', progress: { 'phrase-1-0': 0.4 } });
    const { container } = render(<PhraseCard block={phrase} audioId="phrase-1-0" />);

    expect(screen.getByRole('button', { name: 'Поставить произношение Բարև на паузу' }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('.word-card')).toHaveClass('word-card--playing');
    expect(container.querySelector('.word-card__audio-value')).toHaveStyle({ strokeDashoffset: 0.6 });
  });

  it('disables the control while audio is loading', () => {
    useAudioStore.setState({ loadingId: 'phrase-1-0' });
    render(<PhraseCard block={phrase} audioId="phrase-1-0" />);

    expect(screen.getByRole('button', { name: 'Загружается произношение Բարև' })).toBeDisabled();
  });
});
