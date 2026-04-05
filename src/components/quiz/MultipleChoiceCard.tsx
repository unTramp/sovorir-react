import { useState } from 'react';
import type { MultipleChoiceQuestion } from '../../types/quiz';

interface Props {
  question: MultipleChoiceQuestion;
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoiceCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    onAnswer(index === question.correctIndex);
  };

  return (
    <div className="quiz-mc">
      <div className="quiz-mc__question">{question.question}</div>
      <div className="quiz-mc__options">
        {question.options.map((option, i) => {
          let cls = 'quiz-mc__option';
          if (selected !== null) {
            if (i === question.correctIndex) cls += ' quiz-mc__option--correct';
            else if (i === selected) cls += ' quiz-mc__option--wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selected !== null}>
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null && question.explanation && (
        <div className="quiz-mc__explanation">{question.explanation}</div>
      )}
    </div>
  );
}
