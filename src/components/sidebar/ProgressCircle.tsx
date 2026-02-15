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
      <div className="flex items-center justify-end mb-1 gap-1">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {percentage}%
        </span>
        {percentage >= 100 && (
          <span className="text-xs" style={{ color: 'var(--color-star-filled)' }}>★</span>
        )}
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: 'var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            borderRadius: 2,
            background: 'linear-gradient(90deg, var(--color-student), var(--color-student-dark))',
            transition: 'width 1s ease',
          }}
        />
      </div>
    </div>
  );
}
