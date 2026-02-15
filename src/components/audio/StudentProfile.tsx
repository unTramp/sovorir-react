const TOTAL_STARS = 5;
const FILLED_STARS = 3;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="-2 -2 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {filled && (
          <>
            <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD54F" />
              <stop offset="40%" stopColor="#F4B400" />
              <stop offset="100%" stopColor="#C98A0E" />
            </linearGradient>
            <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </>
        )}
      </defs>
      <path
        d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3-1.1-6.5L.4 8.9l6.5-.9L12 2z"
        fill={filled ? 'url(#starGold)' : 'var(--color-star-empty)'}
        stroke={filled ? '#C98A0E' : 'var(--color-star-empty)'}
        strokeWidth={filled ? '0.5' : '1.5'}
        strokeLinejoin="round"
        filter={filled ? 'url(#starGlow)' : undefined}
      />
    </svg>
  );
}

export function StudentProfile() {
  return (
    <div className="h-[72px] bg-rightpanel border-b border-border px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
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
