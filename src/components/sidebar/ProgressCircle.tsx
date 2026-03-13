import { useLessonProgress } from '../../stores/useLessonProgress';

export function ProgressCircle() {
  const percentage = useLessonProgress((s) => s.getOverallPercentage());

  return (
    <div className="px-2 mt-1">
      <div className="flex items-center gap-2">
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgb(var(--color-student-border-rgb) / 0.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentage}%`, borderRadius: 4, background: 'linear-gradient(90deg, #4FC3F7, #0288D1)', transition: 'width 1s ease' }} />
        </div>
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
          {percentage}%{percentage >= 100 && <span style={{ color: 'var(--color-star-filled)', marginLeft: 2 }}>★</span>}
        </span>
      </div>
    </div>
  );
}
