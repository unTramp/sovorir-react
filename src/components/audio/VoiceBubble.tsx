import { useEffect, useState } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { WaveformBars } from './WaveformBars';
import { PlayIcon, PauseIcon } from '../../icons';
import { formatDuration } from '../../lib/formatDuration';
import type { AudioMessage } from '../../types/audio';

interface Props {
  message: AudioMessage;
}

export function VoiceBubble({ message }: Props) {
  const { togglePlay, playingId } = useAudioPlayer();
  const progress = useAudioStore((s) => s.progress[message.id] || 0);
  const isPlaying = playingId === message.id;
  const isTeacher = message.sender === 'teacher';
  const [metadataDuration, setMetadataDuration] = useState<number>(0);

  useEffect(() => {
    if (message.duration && message.duration > 0) {
      return;
    }

    let cancelled = false;
    const audio = new Audio();
    const handleLoadedMetadata = () => {
      if (cancelled) return;
      const nextDuration = Number.isFinite(audio.duration) ? Math.max(0, Math.round(audio.duration)) : 0;
      setMetadataDuration(nextDuration);
    };

    const handleError = () => {
      if (cancelled) return;
      setMetadataDuration(0);
    };

    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.src = message.src;

    return () => {
      cancelled = true;
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [message.duration, message.src]);

  const resolvedDuration = message.duration && message.duration > 0 ? message.duration : metadataDuration;

  const remaining = isPlaying
    ? Math.max(0, Math.ceil(resolvedDuration * (1 - progress)))
    : resolvedDuration;

  return (
    <div className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`voice-bubble ${
          isTeacher ? 'voice-bubble--teacher' : 'voice-bubble--student'
        }`}
      >
        {isTeacher && (
          <img
            src="/assets/teacher-avatar.png"
            className="voice-bubble__teacher-img"
            alt="Лусине"
          />
        )}
        <div className="voice-bubble__name">{message.senderName}</div>
        {isTeacher && <div className="voice-bubble__text">{message.text}</div>}
        <div className="voice-bubble__player">
          <button
            className="voice-bubble__play"
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            onClick={() => togglePlay(message.id, message.src, resolvedDuration)}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <WaveformBars
            messageId={message.id}
            progress={progress}
            isTeacher={isTeacher}
          />
          {remaining > 0 ? (
            <span className="voice-bubble__duration">
              {formatDuration(remaining)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
