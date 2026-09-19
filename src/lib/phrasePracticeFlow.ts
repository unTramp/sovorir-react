import type { ContentBlock, PhraseBlock, PhraseCardBlock, PronunciationPromptBlock, RecordBlock } from '../types/lessonContent';

export type PhrasePracticePhrase = PhraseBlock | PhraseCardBlock;
export type PhrasePracticeInteraction = RecordBlock | PronunciationPromptBlock;

export interface PhrasePracticePair {
  phrase: PhrasePracticePhrase;
  interaction: PhrasePracticeInteraction;
  phraseBlockIndex: number;
  interactionBlockIndex: number;
}

function isPhrase(block: ContentBlock): block is PhrasePracticePhrase {
  return block.type === 'phrase' || block.type === 'phraseCard';
}

function isListenRepeatInteraction(block: ContentBlock): block is PhrasePracticeInteraction {
  return block.type === 'record' || block.type === 'pronunciationPrompt';
}

/**
 * Phrase-practice sections are intentionally strict: the complete section must be
 * an alternating phrase → listen/repeat interaction sequence. This keeps the
 * single-phrase runtime isolated from other lesson compositions.
 */
export function getPhrasePracticePairs(blocks: ContentBlock[]): PhrasePracticePair[] | null {
  if (blocks.length < 2 || blocks.length % 2 !== 0) return null;

  const pairs: PhrasePracticePair[] = [];

  for (let index = 0; index < blocks.length; index += 2) {
    const phrase = blocks[index];
    const interaction = blocks[index + 1];

    if (!isPhrase(phrase) || !isListenRepeatInteraction(interaction)) return null;

    pairs.push({
      phrase,
      interaction,
      phraseBlockIndex: index,
      interactionBlockIndex: index + 1,
    });
  }

  return pairs.length > 0 ? pairs : null;
}
