import { useState, useCallback } from 'react';
import type { Quiz, QuizResult } from '../../types/quiz';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { MatchPairsCard } from './MatchPairsCard';
import { QuizResultCard } from './QuizResult';

interface Props {
  quiz: Quiz;
  onComplete: (result: QuizResult) => void;
}

export function QuizContainer({ quiz, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = useCallback((correct: boolean) => {
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (currentIndex + 1 >= quiz.questions.length) {
        const total = quiz.questions.length;
        const result: QuizResult = {
          quizId: quiz.id,
          score: newScore,
          total,
          passed: newScore / total >= 0.7,
          completedAt: Date.now(),
        };
        setFinished(true);
        onComplete(result);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 800);
  }, [currentIndex, score, quiz, onComplete]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  }, []);

  if (finished) {
    return (
      <QuizResultCard
        score={score}
        total={quiz.questions.length}
        passed={score / quiz.questions.length >= 0.7}
        onRetry={handleRetry}
      />
    );
  }

  const question = quiz.questions[currentIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-container__header">
        <span className="quiz-container__title">Тест</span>
        <span className="quiz-container__progress">{currentIndex + 1} / {quiz.questions.length}</span>
      </div>
      {question.type === 'multiple-choice' && (
        <MultipleChoiceCard key={question.question} question={question} onAnswer={handleAnswer} />
      )}
      {question.type === 'match-pairs' && (
        <MatchPairsCard question={question} onComplete={handleAnswer} />
      )}
    </div>
  );
}
