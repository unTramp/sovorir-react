const TOTAL_STARS = 5;
const FILLED_STARS = 3;

export function StudentProfile() {
  return (
    <div className="h-[72px] bg-content border-b border-border px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-dark leading-tight truncate">
          Андрей Дорофеев
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: TOTAL_STARS }, (_, i) => (
            <span
              key={i}
              className={i < FILLED_STARS ? 'profile-star filled' : 'profile-star'}
            >
              {'\u2605'}
            </span>
          ))}
          <span className="rpg-trophy">{'\u{1F3C6}'}</span>
        </div>
      </div>
      <div className="rpg-avatar">
        <img src="/assets/student-avatar.png" alt="Андрей Дорофеев" />
      </div>
    </div>
  );
}
