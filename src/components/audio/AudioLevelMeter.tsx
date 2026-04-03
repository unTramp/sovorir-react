interface Props {
  level: number; // 0-1
}

export function AudioLevelMeter({ level }: Props) {
  const bars = 5;

  return (
    <div className="audio-level-meter">
      {Array.from({ length: bars }, (_, i) => {
        const threshold = (i + 1) / bars;
        const active = level >= threshold * 0.7;
        return (
          <div
            key={i}
            className={`audio-level-meter__bar ${active ? 'audio-level-meter__bar--active' : ''}`}
            style={{ height: `${(i + 1) * 20}%` }}
          />
        );
      })}
    </div>
  );
}
