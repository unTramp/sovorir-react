import { lessons } from '../../data/lessons';

export function ProgressCircle() {
  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const totalCount = lessons.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="px-3 mt-2 mb-1">
      <div className="flex items-center gap-2">
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgb(var(--color-student-border-rgb) / 0.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentage}%`, borderRadius: 4, background: 'linear-gradient(90deg, #4FC3F7, #0288D1)', transition: 'width 1s ease' }} />
        </div>
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
          {completedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}
