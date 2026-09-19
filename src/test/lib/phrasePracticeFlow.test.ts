import { describe, expect, it } from 'vitest';
import { getPhrasePracticePairs } from '../../lib/phrasePracticeFlow';
import type { ContentBlock } from '../../types/lessonContent';

const phrase = (armenian: string): ContentBlock => ({
  type: 'phrase',
  armenian,
  russian: armenian,
  transcription: armenian,
  translation: armenian,
});

const record = (prompt: string): ContentBlock => ({
  type: 'record',
  prompt,
});

describe('getPhrasePracticePairs', () => {
  it('recognizes an alternating phrase and recording sequence', () => {
    const result = getPhrasePracticePairs([
      phrase('Բարև'),
      record('Повторите: Բարև'),
      phrase('Բարև ձեզ'),
      record('Повторите: Բարև ձեզ'),
    ]);

    expect(result).toHaveLength(2);
    expect(result?.[0].phrase.armenian).toBe('Բարև');
    expect(result?.[1].interaction.prompt).toContain('Բարև ձեզ');
    expect(result?.[1].interactionBlockIndex).toBe(3);
  });

  it('does not hijack mixed lesson compositions', () => {
    const result = getPhrasePracticePairs([
      phrase('Բարև'),
      { type: 'text', content: 'Объяснение' },
    ]);

    expect(result).toBeNull();
  });
});
