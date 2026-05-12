import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useReviewStore } from '../../stores/useReviewStore';

export function TeacherDashboardView() {
  const firstName = useAuthStore((s) => s.firstName);
  const { queue, isLoading, loadQueue } = useReviewStore();
  const navigate = useNavigate();

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  return (
    <div className="view-panel home-screen">
      <div className="home-greeting-section">
        <h1 className="home-greeting__title">Барев, {firstName}!</h1>
        <p className="home-greeting__sub">Панель преподавателя</p>
      </div>

      <div className="teacher-dash__section">
        <div className="teacher-dash__section-header">
          <div className="teacher-dash__section-title">Очередь проверки</div>
          {queue.length > 0 && (
            <button
              className="teacher-dash__see-all"
              onClick={() => navigate('/review-queue')}
            >
              Все ({queue.length})
            </button>
          )}
        </div>

        {isLoading && (
          <div className="assignments__loading">Загрузка...</div>
        )}

        {!isLoading && queue.length === 0 && (
          <div className="teacher-dash__empty">
            <span className="teacher-dash__empty-icon">📋</span>
            <p className="teacher-dash__empty-text">Нет заданий на проверке</p>
            <p className="teacher-dash__empty-hint">Когда студенты отправят задания, они появятся здесь</p>
          </div>
        )}

        {queue.slice(0, 3).map((item) => (
          <div
            key={item.submission.id}
            className="teacher-dash__queue-item"
            onClick={() => navigate('/review-queue')}
          >
            <div className="teacher-dash__queue-title">{item.assignmentTitle}</div>
            <div className="teacher-dash__queue-student">{item.studentName}</div>
          </div>
        ))}
      </div>

      <div className="teacher-dash__section">
        <div className="teacher-dash__section-header">
          <div className="teacher-dash__section-title">Консультации</div>
          <button
            className="teacher-dash__see-all"
            onClick={() => navigate('/consultations')}
          >
            Управление
          </button>
        </div>
        <div className="teacher-dash__empty">
          <span className="teacher-dash__empty-icon">📅</span>
          <p className="teacher-dash__empty-text">Откройте расписание консультаций</p>
        </div>
      </div>
    </div>
  );
}
