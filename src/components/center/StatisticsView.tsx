import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import { useReviewStore } from '../../stores/useReviewStore';

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  );
}

function StudentStats() {
  const streak = useStreakStore((s) => s.currentStreak);
  const { submissions, loadMySubmissions } = useAssignmentStore();

  useEffect(() => { void loadMySubmissions(); }, [loadMySubmissions]);

  const accepted       = submissions.filter((s) => s.status === 'accepted').length;
  const needsRevision  = submissions.filter((s) => s.status === 'needs_revision').length;
  const submitted      = submissions.filter((s) => s.status === 'submitted' || s.status === 'in_review').length;
  const total          = submissions.length;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Стрик" value={`${streak} 🔥`} hint="дней подряд" />
        <StatCard label="Принято" value={accepted} hint="заданий" />
        <StatCard label="На проверке" value={submitted} />
        <StatCard label="На доработке" value={needsRevision} />
      </div>

      {total > 0 && (
        <div className="stats-section">
          <div className="stats-section__title">Прогресс заданий</div>
          <div className="stats-progress-bar">
            <div
              className="stats-progress-bar__fill"
              style={{ width: `${Math.round((accepted / total) * 100)}%` }}
            />
          </div>
          <div className="stats-progress-bar__label">
            {accepted} из {total} принято ({Math.round((accepted / total) * 100)}%)
          </div>
        </div>
      )}
    </>
  );
}

function TeacherStats() {
  const { queue, loadQueue } = useReviewStore();

  useEffect(() => { void loadQueue(); }, [loadQueue]);

  const pending  = queue.filter((i) => i.submission.status === 'submitted').length;
  const inReview = queue.filter((i) => i.submission.status === 'in_review').length;

  // Stale: submitted more than 3 days ago
  const staleMs = 3 * 24 * 60 * 60 * 1000;
  const stale = queue.filter((i) => {
    if (!i.submission.submittedAt) return false;
    return Date.now() - new Date(i.submission.submittedAt).getTime() > staleMs;
  }).length;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Ожидают проверки" value={pending} />
        <StatCard label="На проверке" value={inReview} />
        <StatCard label="Зависших >3 дней" value={stale} hint={stale > 0 ? '⚠️ требуют внимания' : undefined} />
        <StatCard label="Всего в очереди" value={queue.length} />
      </div>

      {stale > 0 && (
        <div className="stats-alert">
          <span className="stats-alert__icon">⚠️</span>
          <span>{stale} {stale === 1 ? 'задание зависло' : 'задания зависли'} более 3 дней без проверки</span>
        </div>
      )}
    </>
  );
}

export function StatisticsView() {
  const role = useAuthStore((s) => s.profile?.role);

  return (
    <div className="view-panel home-screen">
      <div className="home-greeting-section">
        <h1 className="assignments__title">Статистика</h1>
      </div>

      {role === 'teacher' || role === 'admin' ? <TeacherStats /> : <StudentStats />}
    </div>
  );
}
