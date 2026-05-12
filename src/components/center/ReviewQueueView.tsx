import { useEffect, useState } from 'react';
import { useReviewStore } from '../../stores/useReviewStore';
import { ReviewForm } from '../assignments/ReviewForm';
import type { QueueItem } from '../../types/review';

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Отправлено',
  in_review: 'На проверке',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ReviewQueueView() {
  const [activeItem, setActiveItem] = useState<QueueItem | null>(null);
  const { queue, isLoading, loadQueue } = useReviewStore();

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  return (
    <div className="view-panel home-screen">
      <div className="home-greeting-section">
        <h1 className="assignments__title">Очередь проверки</h1>
      </div>

      {isLoading && queue.length === 0 && (
        <div className="assignments__loading">Загрузка...</div>
      )}

      {!isLoading && queue.length === 0 && (
        <div className="assignments__empty">
          <div className="assignments__empty-icon">✅</div>
          <p>Нет работ на проверке</p>
        </div>
      )}

      <div className="assignments__list">
        {queue.map((item) => (
          <div key={item.submission.id} className="assignment-card">
            <div className="assignment-card__top">
              <span className="assignment-card__title">{item.assignmentTitle}</span>
              <span className={`badge badge--${item.submission.status === 'in_review' ? 'review' : 'submitted'}`}>
                {STATUS_LABEL[item.submission.status] ?? item.submission.status}
              </span>
            </div>

            <div className="review-queue__student">
              <span className="review-queue__student-name">{item.studentName}</span>
              {item.submission.submittedAt && (
                <span className="review-queue__date">{formatDate(item.submission.submittedAt)}</span>
              )}
            </div>

            {item.submission.textContent && (
              <p className="assignment-card__desc review-queue__preview">
                {item.submission.textContent.slice(0, 120)}
                {item.submission.textContent.length > 120 ? '…' : ''}
              </p>
            )}

            <div className="assignment-card__bottom">
              <button
                className="assignment-card__submit-btn"
                onClick={() => setActiveItem(item)}
              >
                Проверить
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeItem && (
        <ReviewForm
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  );
}
