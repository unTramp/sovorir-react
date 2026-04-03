import type { LessonPage, PhraseBlock } from '../types/lessonContent';
import type { Quiz, QuizQuestion, MultipleChoiceQuestion, MatchPairsQuestion } from '../types/quiz';
import type { DictionaryWord } from '../types/dictionary';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function extractPhrases(page: LessonPage): PhraseBlock[] {
  return page.blocks.filter((b): b is PhraseBlock => b.type === 'phrase');
}

function makeArmenianToRussianQuestion(
  phrase: PhraseBlock,
  allPhrases: PhraseBlock[],
  rng: () => number,
): MultipleChoiceQuestion {
  const distractors = shuffleArray(
    allPhrases.filter((p) => p.armenian !== phrase.armenian),
    rng,
  ).slice(0, 3);

  const options = shuffleArray(
    [phrase.russian, ...distractors.map((d) => d.russian)],
    rng,
  ) as [string, string, string, string];

  return {
    type: 'multiple-choice',
    question: `Как переводится "${phrase.armenian}" [${phrase.transcription}]?`,
    options,
    correctIndex: options.indexOf(phrase.russian),
  };
}

function makeTranscriptionQuestion(
  phrase: PhraseBlock,
  allPhrases: PhraseBlock[],
  rng: () => number,
): MultipleChoiceQuestion {
  const distractors = shuffleArray(
    allPhrases.filter((p) => p.transcription !== phrase.transcription),
    rng,
  ).slice(0, 3);

  const options = shuffleArray(
    [`[${phrase.transcription}]`, ...distractors.map((d) => `[${d.transcription}]`)],
    rng,
  ) as [string, string, string, string];

  return {
    type: 'multiple-choice',
    question: `Выберите правильную транскрипцию слова "${phrase.armenian}":`,
    options,
    correctIndex: options.indexOf(`[${phrase.transcription}]`),
  };
}

function makeMatchPairs(phrases: PhraseBlock[]): MatchPairsQuestion {
  const selected = phrases.slice(0, Math.min(4, phrases.length));
  return {
    type: 'match-pairs',
    pairs: selected.map((p) => ({ left: p.armenian, right: p.russian })),
  };
}

export function generateQuizForPage(
  page: LessonPage,
  fallbackWords?: DictionaryWord[],
): Quiz | null {
  let phrases = extractPhrases(page);

  // Fallback to dictionary words if page has < 4 phrases
  if (phrases.length < 4 && fallbackWords && fallbackWords.length >= 4) {
    const dictPhrases: PhraseBlock[] = fallbackWords.map((w) => ({
      type: 'phrase' as const,
      armenian: w.armenian,
      transcription: w.transcription.replace(/^\[|\]$/g, ''),
      russian: w.translation,
      translation: w.translation,
    }));
    phrases = [...phrases, ...dictPhrases].slice(0, 8);
  }

  if (phrases.length < 4) return null;

  const rng = seededRandom(page.id * 31337);
  const shuffled = shuffleArray(phrases, rng);
  const questions: QuizQuestion[] = [];

  // Generate 2-3 armenian→russian multiple choice
  const mcCount = Math.min(3, shuffled.length);
  for (let i = 0; i < mcCount; i++) {
    questions.push(makeArmenianToRussianQuestion(shuffled[i], phrases, rng));
  }

  // Generate 1 match-pairs
  questions.push(makeMatchPairs(shuffleArray(phrases, rng)));

  // Generate 1-2 transcription questions
  const transcriptionCount = Math.min(2, shuffled.length - mcCount);
  for (let i = 0; i < transcriptionCount; i++) {
    questions.push(makeTranscriptionQuestion(shuffled[mcCount + i], phrases, rng));
  }

  return {
    id: `quiz-page-${page.id}`,
    pageId: page.id,
    questions,
  };
}
