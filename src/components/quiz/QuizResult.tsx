interface Props {
  score: number;
  total: number;
  passed: boolean;
  onRetry: () => void;
}

export function QuizResultCard({ score, total, passed, onRetry }: Props) {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="quiz-result">
      <div className="quiz-result__emoji">{passed ? '🎉' : '📚'}</div>
      <div className="quiz-result__title">
        {passed ? 'Тест пройден!' : 'Попробуйте ещё раз'}
      </div>
      <div className="quiz-result__score">
        {score} из {total} ({percentage}%)
      </div>
      <div className="quiz-result__threshold">
        {passed ? 'Вы набрали 70% и более' : 'Необходимо набрать минимум 70%'}
      </div>
      {!passed && (
        <button className="quiz-result__btn" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
