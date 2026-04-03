import { lessons } from '../../data/lessons';
import { useStreakStore } from '../../stores/useStreakStore';
import { FlameIcon } from '../../icons';

export function StudentProfile() {
  const completedLessons = lessons.filter((l) => l.status === 'completed').length;
  const totalStars = lessons.length;
  const allDone = completedLessons >= totalStars;
  const streak = useStreakStore((s) => s.currentStreak);

  return (
    <div className="h-[72px] bg-content px-3 py-3 flex items-center gap-3 flex-shrink-0">
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
          {streak > 0 && <span style={{ fontSize: 12, marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}><FlameIcon size={12} /> {streak}</span>}
        </div>
      </div>
      <div className="rpg-avatar">
        <img src="/assets/student-avatar.png" alt="Андрей Дорофеев" />
      </div>
    </div>
  );
}
