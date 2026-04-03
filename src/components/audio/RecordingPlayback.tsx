import { useState, useRef, useCallback, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '../../icons';

interface Props {
  audioUrl: string;
  duration: number;
}

export function RecordingPlayback({ audioUrl, duration }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setPlaying(false);
      setProgress(0);
    };
    return () => {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(rafRef.current);
    };
  }, [audioUrl]);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      audio.play();
      rafRef.current = requestAnimationFrame(updateProgress);
    }
    setPlaying(!playing);
  }, [playing, updateProgress]);

  return (
    <div className="recording-playback">
      <button className="recording-playback__btn" onClick={toggle} aria-label={playing ? 'Пауза' : 'Воспроизвести'}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="recording-playback__bar">
        <div className="recording-playback__fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="recording-playback__duration">{duration}с</span>
    </div>
  );
}
