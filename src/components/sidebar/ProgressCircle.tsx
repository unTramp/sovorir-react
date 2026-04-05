import { lessons } from '../../data/lessons';

export function ProgressCircle() {
  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const totalCount = lessons.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="px-3 mt-2 mb-1">
      <div className="flex items-center gap-2">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <span className="progress-bar-label">{completedCount}/{totalCount}</span>
      </div>
    </div>
  );
}
