import { PauseIcon, PlayIcon } from '../../icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import type { PhraseBlock, PhraseCardBlock } from '../../types/lessonContent';

interface Props {
  block: PhraseBlock | PhraseCardBlock;
  audioId: string;
  grouped?: boolean;
}

export function PhraseCard({ block, audioId, grouped = false }: Props) {
  const { togglePlay, playingId, loadingId, errorId } = useAudioPlayer();
  const progress = useAudioStore((state) => state.progress[audioId] || 0);
  const isPlaying = playingId === audioId;
  const isLoading = loadingId === audioId;
  const hasError = errorId === audioId;
  const hasAudio = Boolean(block.audioSrc);

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
    <div className={`word-card${grouped ? ' word-card--grouped' : ''}${isPlaying ? ' word-card--playing' : ''}`}>
      <div className="word-card__info">
        <span className="word-card__armenian" lang="hy">{block.armenian}</span>
        <span className="word-card__transcription">{block.transcription}</span>
        {block.translation && <div className="word-card__translation">{block.translation}</div>}
        {block.context && <div className="word-card__context">{block.context}</div>}
        {block.russian && <div className="word-card__russian">Произношение: {block.russian}</div>}
      </div>
      <button
        className={`word-card__audio-btn${isPlaying ? ' is-playing' : ''}${isLoading ? ' is-loading' : ''}${hasError ? ' has-error' : ''}`}
        type="button"
        aria-label={audioLabel}
        aria-pressed={isPlaying}
        disabled={!hasAudio || isLoading}
        onClick={() => block.audioSrc && togglePlay(audioId, block.audioSrc)}
      >
        <svg className="word-card__audio-progress" viewBox="0 0 44 44" aria-hidden="true">
          <circle className="word-card__audio-track" cx="22" cy="22" r="20" pathLength="1" />
          <circle
            className="word-card__audio-value"
            cx="22"
            cy="22"
            r="20"
            pathLength="1"
            style={{ strokeDashoffset: 1 - progress }}
          />
        </svg>
        <span className="word-card__audio-icon" aria-hidden="true">
          {isLoading ? <span className="word-card__audio-spinner" /> : hasError ? '!' : isPlaying ? <PauseIcon size={17} /> : <PlayIcon size={18} />}
        </span>
      </button>
    </div>
  );
}
