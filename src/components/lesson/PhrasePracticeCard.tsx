import { useEffect, useState } from 'react';
import { PauseIcon, PlayIcon } from '../../icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { formatDuration } from '../../lib/formatDuration';
import { useAudioStore } from '../../stores/useAudioStore';
import type { PhrasePracticePhrase } from '../../lib/phrasePracticeFlow';
import { WaveformBars } from '../audio/WaveformBars';

interface Props {
  block: PhrasePracticePhrase;
  audioId: string;
}

export function PhrasePracticeCard({ block, audioId }: Props) {
  const { togglePlay, playingId, loadingId, errorId } = useAudioPlayer();
  const progress = useAudioStore((state) => state.progress[audioId] || 0);
  const isPlaying = playingId === audioId;
  const isLoading = loadingId === audioId;
  const hasError = errorId === audioId;
  const hasAudio = Boolean(block.audioSrc);
  const [metadataDuration, setMetadataDuration] = useState(0);

  useEffect(() => {
    if (!block.audioSrc) {
      setMetadataDuration(0);
      return;
    }

    let cancelled = false;
    const audio = new Audio();

    const handleLoadedMetadata = () => {
      if (cancelled) return;
      const nextDuration = Number.isFinite(audio.duration)
        ? Math.max(0, Math.round(audio.duration))
        : 0;
      setMetadataDuration(nextDuration);
    };

    const handleError = () => {
      if (!cancelled) setMetadataDuration(0);
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
  }, [block.audioSrc]);

  const remaining = isPlaying
    ? Math.max(0, Math.ceil(metadataDuration * (1 - progress)))
    : metadataDuration;

  const audioLabel = !hasAudio
    ? `Аудио для ${block.armenian} пока недоступно`
    : hasError
      ? `Повторить загрузку произношения ${block.armenian}`
      : isLoading
        ? `Загружается произношение ${block.armenian}`
        : isPlaying
          ? `Поставить произношение ${block.armenian} на паузу`
          : `Прослушать произношение ${block.armenian}`;

  return (
    <article className="phrase-practice-card">
      <div className="phrase-practice-card__content">
        <div className="phrase-practice-card__armenian" lang="hy">{block.armenian}</div>
        <div className="phrase-practice-card__transcription">{block.transcription}</div>
        {block.translation && (
          <div className="phrase-practice-card__translation">{block.translation}</div>
        )}
        {block.context && (
          <div className="phrase-practice-card__context">{block.context}</div>
        )}
      </div>

      <div className="phrase-practice-card__player">
        <button
          type="button"
          className={`phrase-practice-card__play${isPlaying ? ' is-playing' : ''}`}
          aria-label={audioLabel}
          aria-pressed={isPlaying}
          disabled={!hasAudio || isLoading}
          onClick={() => block.audioSrc && togglePlay(audioId, block.audioSrc, metadataDuration)}
        >
          {isLoading ? (
            <span className="phrase-practice-card__spinner" aria-hidden="true" />
          ) : hasError ? (
            <span aria-hidden="true">!</span>
          ) : isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        <WaveformBars
          messageId={audioId}
          progress={progress}
          isTeacher
          isPlaying={isPlaying}
        />

        <span className="phrase-practice-card__duration">
          {remaining > 0 ? formatDuration(remaining) : '—'}
        </span>
      </div>
    </article>
  );
}
