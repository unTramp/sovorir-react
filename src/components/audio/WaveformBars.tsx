import { useMemo, useRef, useState, useEffect } from 'react';

const BAR_WIDTH = 2.5;
const GAP = 1.5;

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

function generateBars(seed: string, count: number): number[] {
  const rng = seededRandom(seed);
  const result: number[] = [];
  const center = count / 2;
  for (let i = 0; i < count; i++) {
    const dist = Math.abs(i - center) / center;
    const base = (1 - dist * 0.5) * 22;
    const variation = (rng() - 0.5) * 14;
    result.push(Math.max(3, Math.min(30, Math.round(base + variation))));
  }
  return result;
}

interface Props {
  messageId: string;
  progress: number;
  isTeacher: boolean;
  isPlaying?: boolean;
}

export function WaveformBars({ messageId, progress, isPlaying }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [barCount, setBarCount] = useState(40);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const count = Math.floor((width + GAP) / (BAR_WIDTH + GAP));
      setBarCount(Math.max(1, count));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bars = useMemo(() => generateBars(messageId, barCount), [messageId, barCount]);
  const playedCount = Math.floor(progress * barCount);

  return (
    <div className={`waveform-container${isPlaying ? ' waveform-container--playing' : ''}`} ref={containerRef}>
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
