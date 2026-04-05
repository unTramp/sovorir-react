import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { PhraseBlock } from '../../types/lessonContent';

const WORD_STATUS_LABELS: Record<NonNullable<PhraseBlock['status']>, string> = {
  new: 'Новое',
  learned: 'Изучено',
  review: 'Повтор',
};

function SpeakerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="btn-bg" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#F8EFEA"/>
          <stop offset="100%" stopColor="#D9C8BE"/>
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="24" fill="url(#btn-bg)"/>
      <path d="M26 32.75V30.7C27.5 30.2667 28.7083 29.4333 29.625 28.2C30.5417 26.9667 31 25.5667 31 24C31 22.4333 30.5417 21.0333 29.625 19.8C28.7083 18.5667 27.5 17.7333 26 17.3V15.25C28.0667 15.7167 29.75 16.7625 31.05 18.3875C32.35 20.0125 33 21.8833 33 24C33 26.1167 32.35 27.9875 31.05 29.6125C29.75 31.2375 28.0667 32.2833 26 32.75V32.75M15 27.025V21.025H19L24 16.025V32.025L19 27.025H15V27.025M26 28.025V19.975C26.7833 20.3417 27.3958 20.8917 27.8375 21.625C28.2792 22.3583 28.5 23.1583 28.5 24.025C28.5 24.875 28.2792 25.6625 27.8375 26.3875C27.3958 27.1125 26.7833 27.6583 26 28.025V28.025M22 20.875L19.85 23.025H17V25.025H19.85L22 27.175V20.875V20.875M19.5 24.025V24.025V24.025V24.025V24.025V24.025V24.025V24.025" fill="#8D4A2A"/>
    </svg>
  );
}

interface Props {
  block: PhraseBlock;
}

export function PhraseCard({ block }: Props) {
  const { togglePlay } = useAudioPlayer();
  const msgId = `phrase-${block.armenian}`;
  const status = block.status ?? 'new';

  return (
    <div className={`word-card word-card--${status}`}>
      <div className="word-card__info">
        <div className="word-card__header">
          <span className="word-card__armenian" lang="hy">{block.armenian}</span>
          <span className="word-card__badge">{WORD_STATUS_LABELS[status]}</span>
        </div>
        <div className="word-card__meta">
          <span className="word-card__transcription">{block.transcription}</span>
          <span className="word-card__dot" aria-hidden="true" />
          <span className="word-card__russian">{block.russian}</span>
        </div>
        {block.translation && (
          <div className="word-card__translation">{block.translation}</div>
        )}
      </div>
      <button
        className="word-card__audio-btn"
        aria-label="Прослушать произношение"
        onClick={() => block.audioSrc && togglePlay(msgId, block.audioSrc)}
      >
        <SpeakerIcon />
      </button>
    </div>
  );
}
