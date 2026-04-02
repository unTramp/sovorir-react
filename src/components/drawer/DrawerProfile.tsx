import { lessons } from '../../data/lessons';
import { useStreakStore } from '../../stores/useStreakStore';

const LEVELS = [
  { label: 'A1', min: 0,   next: 200,  nextLabel: 'A2'  },
  { label: 'A2', min: 200, next: 500,  nextLabel: 'A2+' },
  { label: 'B1', min: 500, next: 900,  nextLabel: 'B2'  },
  { label: 'B2', min: 900, next: 9999, nextLabel: '—'   },
];

export function DrawerProfile() {
  const streak = useStreakStore((s) => s.currentStreak);

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
      {/* Avatar row */}
      <div className="flex items-center gap-3">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div className="drawer-profile__avatar">
            <img src="/assets/student-avatar.png" alt="Андрей Дорофеев" className="w-full h-full object-cover" />
          </div>
          <span className="drawer-profile__level-badge">{currentLevel.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="drawer-profile__name truncate">Андрей Дорофеев</div>
          <div className="drawer-profile__meta">
            <span className="drawer-profile__meta-xp">{xp} XP</span>
            {streak > 0 && <span>· 🔥 {streak} дней</span>}
          </div>
        </div>
      </div>

      {/* Progress card */}
      <div className="drawer-profile__progress-card">
        <div className="drawer-profile__progress-header">
          <span>Прогресс уровня</span>
          <span className="drawer-profile__progress-pct">{progressPct}%</span>
        </div>
        <div className="drawer-profile__progress-track">
          <div
            className="drawer-profile__progress-bar"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="drawer-profile__progress-sub">
          {xp} / {currentLevel.next} XP до {currentLevel.nextLabel}
        </div>
      </div>
    </div>
  );
}
