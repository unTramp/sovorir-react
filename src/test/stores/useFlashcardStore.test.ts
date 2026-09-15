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
});
