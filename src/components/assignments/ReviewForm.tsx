import { useState, useCallback } from 'react';
import { useReviewStore } from '../../stores/useReviewStore';
import type { QueueItem } from '../../types/review';

interface Props {
  item: QueueItem;
  onClose: () => void;
}

const CRITERIA: { key: keyof ScoreState; label: string }[] = [
  { key: 'grammarScore',        label: 'Грамматика' },
  { key: 'vocabularyScore',     label: 'Словарный запас' },
  { key: 'pronunciationScore',  label: 'Произношение' },
  { key: 'fluencyScore',        label: 'Беглость' },
];

type ScoreState = {
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  fluencyScore: number;
};

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="review-form__score-row">
      <span className="review-form__score-label">{label}</span>
      <div className="review-form__score-dots">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`review-form__dot${value >= n ? ' active' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}`}
            type="button"
          />
        ))}
      </div>
      <span className="review-form__score-val">{value > 0 ? value : '—'}</span>
    </div>
  );
}

export function ReviewForm({ item, onClose }: Props) {
  const [scores, setScores] = useState<ScoreState>({
    grammarScore: 0,
    vocabularyScore: 0,
    pronunciationScore: 0,
    fluencyScore: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { submitReview } = useReviewStore();

  const allScored = Object.values(scores).every((v) => v > 0);

  const handleSubmit = useCallback(
    async (status: 'accepted' | 'needs_revision') => {
      setIsSubmitting(true);
      setError(null);
      try {
        await submitReview(item.submission.id, {
          ...scores,
          comment: comment.trim() || undefined,
          status,
        });
        onClose();
      } catch {
        setError('Не удалось сохранить проверку. Попробуйте снова.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [item.submission.id, scores, comment, submitReview, onClose],
  );

  return (
    <div className="submit-modal__backdrop" onClick={onClose}>
      <div className="submit-modal review-form" onClick={(e) => e.stopPropagation()}>
        <div className="submit-modal__header">
          <div className="submit-modal__title">{item.assignmentTitle}</div>
          <button className="submit-modal__close" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        <div className="review-form__student">
          <span className="review-form__student-label">Студент:</span>
          <span className="review-form__student-name">{item.studentName}</span>
        </div>

        {item.submission.textContent && (
          <div className="review-form__answer">
            <div className="review-form__answer-label">Ответ студента</div>
            <p className="review-form__answer-text">{item.submission.textContent}</p>
          </div>
        )}

        <div className="review-form__scores">
          {CRITERIA.map(({ key, label }) => (
            <ScoreRow
              key={key}
              label={label}
              value={scores[key]}
              onChange={(v) => setScores((s) => ({ ...s, [key]: v }))}
            />
          ))}
        </div>

        <label className="submit-modal__label">Комментарий (необязательно)</label>
        <textarea
          className="submit-modal__textarea"
          placeholder="Напишите комментарий студенту..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        {error && <p className="submit-modal__error">{error}</p>}

        <div className="submit-modal__actions">
          <button
            className="submit-modal__btn submit-modal__btn--ghost"
            onClick={() => void handleSubmit('needs_revision')}
            disabled={!allScored || isSubmitting}
          >
            На доработку
          </button>
          <button
            className="submit-modal__btn submit-modal__btn--primary"
            onClick={() => void handleSubmit('accepted')}
            disabled={!allScored || isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Принять'}
          </button>
        </div>
      </div>
    </div>
  );
}
