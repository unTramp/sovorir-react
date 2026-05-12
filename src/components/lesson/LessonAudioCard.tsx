import { useEffect, useState } from 'react';
import { AudioIcon, PauseIcon, PlayIcon } from '../../icons';
import { formatDuration } from '../../lib/formatDuration';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { WaveformBars } from '../audio/WaveformBars';
import type { AudioExampleBlock } from '../../types/lessonContent';

interface Props {
  block: AudioExampleBlock;
  index: number;
}

export function LessonAudioCard({ block, index }: Props) {
  const { togglePlay, playingId } = useAudioPlayer();
  const messageId = `lesson-audio-example-${index}`;
  const progress = useAudioStore((state) => state.progress[messageId] || 0);
  const isPlaying = playingId === messageId;
  const [metadataDuration, setMetadataDuration] = useState<number>(0);

  useEffect(() => {
    if (block.duration && block.duration > 0) {
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
    audio.src = block.audioSrc;

    return () => {
      cancelled = true;
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [block.audioSrc, block.duration]);

  const resolvedDuration = block.duration && block.duration > 0 ? block.duration : metadataDuration;
  const remaining = isPlaying
    ? Math.max(0, Math.ceil(resolvedDuration * (1 - progress)))
    : resolvedDuration;

  return (
    <div className="lesson-audio-card">
      <div className="lesson-audio-card__icon">
        <AudioIcon />
      </div>

      <div className="lesson-audio-card__content">
        <div className="lesson-audio-card__title">{block.title}</div>
        {block.description && (
          <div className="lesson-audio-card__description">{block.description}</div>
        )}

        <div className="lesson-audio-card__player">
          <button
            className="lesson-audio-card__play"
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            onClick={() => togglePlay(messageId, block.audioSrc, resolvedDuration)}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <WaveformBars
            messageId={messageId}
            progress={progress}
            isTeacher={false}
          />

          {remaining > 0 ? (
            <span className="lesson-audio-card__duration">{formatDuration(remaining)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
