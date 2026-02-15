import { lessons } from '../../data/lessons';

export function ProgressCircle() {
  const currentLesson = lessons.find((l) => l.status === 'current') || lessons[0];
  const totalSections = currentLesson.sections.length;
  const completedSections = currentLesson.sections.filter(
    (s) => s.status === 'completed',
  ).length;
  const inProgressSections = currentLesson.sections.filter(
    (s) => s.status === 'current' || s.status === 'in-progress',
  ).length;
  const percentage =
    totalSections > 0
      ? Math.round(((completedSections + inProgressSections * 0.5) / totalSections) * 100)
      : 0;

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
