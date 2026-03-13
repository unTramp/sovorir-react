import { lessons } from '../../data/lessons';

export function StudentProfile() {
  const completedLessons = lessons.filter((l) => l.status === 'completed').length;
  const totalStars = lessons.length;
  const allDone = completedLessons >= totalStars;

  return (
    <div className="h-[72px] bg-content border-b border-border px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-dark leading-tight truncate">
          Андрей Дорофеев
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: totalStars }, (_, i) => (
              <span
                key={i}
                className={i < completedLessons ? 'profile-star filled' : 'profile-star'}
              >
                {'\u2605'}
              </span>
            ))}
          </div>
          {allDone && <span className="rpg-trophy rpg-trophy--earned">{'\u{1F3C6}'}</span>}
        </div>
      </div>
      <div className="rpg-avatar">
        <img src="/assets/student-avatar.png" alt="Андрей Дорофеев" />
      </div>
    </div>
  );
}
