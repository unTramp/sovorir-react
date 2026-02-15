const TOTAL_STARS = 5;
const FILLED_STARS = 3;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {filled && (
          <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8C84A" />
            <stop offset="50%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#A8882E" />
          </linearGradient>
        )}
      </defs>
      <path
        d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3-1.1-6.5L.4 8.9l6.5-.9L12 2z"
        fill={filled ? 'url(#starGold)' : 'none'}
        stroke={filled ? '#A8882E' : '#E0D5B8'}
        strokeWidth={filled ? '0.5' : '1.5'}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StudentProfile() {
  return (
    <div className="border-b border-border px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-dark leading-tight truncate">
          Андрей Дорофеев
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: TOTAL_STARS }, (_, i) => (
            <StarIcon key={i} filled={i < FILLED_STARS} />
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
