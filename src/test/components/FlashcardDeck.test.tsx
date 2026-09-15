import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlashcardDeck } from '../../components/practice/FlashcardDeck';
import { useFlashcardStore } from '../../stores/useFlashcardStore';

vi.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({ togglePlay: vi.fn(), playingId: null, loadingId: null }),
}));

describe('FlashcardDeck reveal flow', () => {
  beforeEach(() => {
    useFlashcardStore.setState({
      session: { cards: ['w1'], currentIndex: 0, results: {} },
      progress: {},
    });
  });

  afterEach(cleanup);

  it('shows rating controls only after revealing the translation', () => {
    render(<FlashcardDeck />);

    expect(screen.queryByText('Не помню')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Показать перевод слова/ }));

    expect(screen.getByText('Привет')).toBeInTheDocument();
    expect(screen.getByText('Не помню')).toBeInTheDocument();
    expect(screen.getByText('Сложно')).toBeInTheDocument();
    expect(screen.getByText('Легко')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Прослушать эталонное произношение' })).toBeInTheDocument();
  });
});
