import { useState, useCallback, useMemo } from 'react';
import type { MatchPairsQuestion } from '../../types/quiz';

interface Props {
  question: MatchPairsQuestion;
  onComplete: (correct: boolean) => void;
}

export function MatchPairsCard({ question, onComplete }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);

  // Shuffle right column with seeded Fisher-Yates
  const shuffledRight = useMemo(() => {
    const indices = question.pairs.map((_, i) => i);
    // Seeded PRNG for deterministic shuffle
    let seed = question.pairs.length * 2654435761;
    for (let i = indices.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
      const j = seed % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [question]);

  const handleLeftClick = useCallback((index: number) => {
    if (matched.includes(index)) return;
    setSelectedLeft(index);
    setWrongPair(null);
  }, [matched]);

  const handleRightClick = useCallback((rightOriginalIndex: number) => {
    if (selectedLeft === null || matched.includes(rightOriginalIndex)) return;

    if (selectedLeft === rightOriginalIndex) {
      const newMatched = [...matched, rightOriginalIndex];
      setMatched(newMatched);
      setSelectedLeft(null);
      if (newMatched.length === question.pairs.length) {
        onComplete(true);
      }
    } else {
      setWrongPair({ left: selectedLeft, right: rightOriginalIndex });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
      }, 600);
    }
  }, [selectedLeft, matched, question.pairs.length, onComplete]);

  return (
    <div className="quiz-match">
      <div className="quiz-match__instruction">Соедините пары</div>
      <div className="quiz-match__columns">
        <div className="quiz-match__col">
          {question.pairs.map((pair, i) => (
            <button
              key={i}
              className={`quiz-match__item ${
                matched.includes(i) ? 'quiz-match__item--matched' : ''
              } ${selectedLeft === i ? 'quiz-match__item--selected' : ''} ${
                wrongPair?.left === i ? 'quiz-match__item--wrong' : ''
              }`}
              onClick={() => handleLeftClick(i)}
              disabled={matched.includes(i)}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="quiz-match__col">
          {shuffledRight.map((origIdx) => (
            <button
              key={origIdx}
              className={`quiz-match__item ${
                matched.includes(origIdx) ? 'quiz-match__item--matched' : ''
              } ${wrongPair?.right === origIdx ? 'quiz-match__item--wrong' : ''}`}
              onClick={() => handleRightClick(origIdx)}
              disabled={matched.includes(origIdx)}
            >
              {question.pairs[origIdx].right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
