import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionary } from '../../data/dictionary';
import { useFlashcardStore } from '../../stores/useFlashcardStore';

describe('lesson-linked review queue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-15T09:00:00Z'));
    useFlashcardStore.setState({ progress: {}, availableWordIds: [], session: null });
    useFlashcardStore.getState()._initWords(dictionary);
  });

  afterEach(() => vi.useRealTimers());

  it('unlocks only lesson phrases and returns them the next day', () => {
    useFlashcardStore.getState().unlockWords(['greeting-polite', 'unknown']);

    expect(useFlashcardStore.getState().availableWordIds).toEqual(['greeting-polite']);
    expect(useFlashcardStore.getState().getDueCount()).toBe(0);

    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    expect(useFlashcardStore.getState().getDueCount()).toBe(1);

    useFlashcardStore.getState().startSession();
    expect(useFlashcardStore.getState().session?.cards).toEqual(['greeting-polite']);
  });

  it('keeps unlocked canonical phrases when another word source initializes later', () => {
    const canonicalWord = {
      ...dictionary[0],
      id: 'canonical-phrase-id',
      armenian: 'Բարև',
      translation: 'Привет',
    };

    useFlashcardStore.getState()._initWords([canonicalWord]);
    useFlashcardStore.getState().unlockWords([canonicalWord.id]);
    useFlashcardStore.getState()._initWords(dictionary);

    expect(useFlashcardStore.getState().availableWordIds).toContain(canonicalWord.id);
    expect(useFlashcardStore.getState().words[canonicalWord.id]).toMatchObject({ translation: 'Привет' });
  });
});
