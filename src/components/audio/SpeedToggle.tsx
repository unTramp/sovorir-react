import { useAudioStore } from '../../stores/useAudioStore';

const speeds = [0.75, 1, 1.25];

export function SpeedToggle() {
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const setPlaybackRate = useAudioStore((s) => s.setPlaybackRate);

  return (
    <div className="flex gap-1.5">
      {speeds.map((s) => (
        <button
          key={s}
          className={`speed-btn ${playbackRate === s ? 'active' : ''}`}
          onClick={() => setPlaybackRate(s)}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
