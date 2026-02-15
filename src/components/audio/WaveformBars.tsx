import { useMemo } from 'react';

const BAR_COUNT = 40;

// Deterministic PRNG seeded by message ID
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = (h ^ (h << 13)) | 0;
    h = (h ^ (h >> 17)) | 0;
    h = (h ^ (h << 5)) | 0;
    return ((h >>> 0) / 4294967296);
  };
}

interface Props {
  messageId: string;
  progress: number;
  isTeacher: boolean;
}

export function WaveformBars({ messageId, progress }: Props) {
  const bars = useMemo(() => {
    const rng = seededRandom(messageId);
    const result: number[] = [];
    const center = BAR_COUNT / 2;
    for (let i = 0; i < BAR_COUNT; i++) {
      const dist = Math.abs(i - center) / center;
      const base = (1 - dist * 0.5) * 22;
      const variation = (rng() - 0.5) * 14;
      result.push(Math.max(3, Math.min(30, Math.round(base + variation))));
    }
    return result;
  }, [messageId]);

  const playedCount = Math.floor(progress * BAR_COUNT);

  return (
    <div className="waveform-container">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`waveform-bar ${i < playedCount ? 'played' : 'unplayed'}`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}
