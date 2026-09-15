import { useEffect, useId } from 'react';
import { PlayIcon, PauseIcon } from '../../icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';

interface Props {
  audioUrl: string;
  duration: number;
  id?: string;
}

export function RecordingPlayback({ audioUrl, duration, id }: Props) {
  const generatedId = useId();
  const audioId = id ?? `recording-${generatedId}`;
  const { togglePlay, release, playingId } = useAudioPlayer();
  const progress = useAudioStore((state) => state.progress[audioId] ?? 0);
  const playing = playingId === audioId;

  useEffect(() => () => release(audioId), [audioId, release]);

  return (
    <div className="recording-playback">
      <button
        className="recording-playback__btn"
        onClick={() => togglePlay(audioId, audioUrl, duration)}
        aria-label={playing ? 'Пауза' : 'Воспроизвести'}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="recording-playback__bar">
        <div className="recording-playback__fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="recording-playback__duration">{duration}с</span>
    </div>
  );
}
