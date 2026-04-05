import { lessons } from '../../data/lessons';
import { useStreakStore } from '../../stores/useStreakStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { FlameIcon } from '../../icons';

const LEVELS = [
  { label: 'A1', min: 0,   next: 200,  nextLabel: 'A2'  },
  { label: 'A2', min: 200, next: 500,  nextLabel: 'A2+' },
  { label: 'B1', min: 500, next: 900,  nextLabel: 'B2'  },
  { label: 'B2', min: 900, next: 9999, nextLabel: '—'   },
];

export function DrawerProfile() {
  const streak = useStreakStore((s) => s.currentStreak);
  const user = useAuthStore();

  const xp = lessons
    .flatMap((l) => l.sections)
    .filter((s) => s.type !== 'video' && s.status === 'completed')
    .length * 32;

  const currentLevel = LEVELS.slice().reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const progressPct = Math.min(
    100,
    Math.round(((xp - currentLevel.min) / (currentLevel.next - currentLevel.min)) * 100)
  );

  return (
    <div className="drawer-profile">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="drawer-profile__avatar">
            <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
          </div>
          <span className="drawer-profile__level-badge">{currentLevel.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="drawer-profile__name truncate">{user.firstName}</div>
          <div className="drawer-profile__meta">
            <span>Уровень {currentLevel.label}</span>
            <span>·</span>
            <span>{xp} XP</span>
            {streak > 0 && (
              <>
                <span>·</span>
                <span className="streak-inline"><FlameIcon size={13} /> {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="drawer-profile__progress-section">
        <div className="drawer-profile__progress-header">
          <span>Прогресс уровня</span>
          <span className="drawer-profile__progress-pct">{progressPct}% до {currentLevel.nextLabel}</span>
        </div>
        <div className="drawer-profile__progress-track">
          <div
            className="drawer-profile__progress-bar"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
