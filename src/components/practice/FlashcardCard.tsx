import type { DictionaryWord } from '../../types/dictionary';
import { PauseIcon, PlayIcon } from '../../icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface Props {
  word: DictionaryWord;
  revealed: boolean;
  onReveal: () => void;
}

export function FlashcardCard({ word, revealed, onReveal }: Props) {
  const { togglePlay, playingId, loadingId } = useAudioPlayer();
  const audioId = `flashcard-reference-${word.id}`;
  const isPlaying = playingId === audioId;
  const isLoading = loadingId === audioId;

  return (
    <div className="flashcard-scene">
      <div className={`flashcard ${revealed ? 'flashcard--flipped' : ''}`} aria-live="polite">
        <button
          className="flashcard__face flashcard__front surface-card--interactive"
          type="button"
          onClick={onReveal}
          tabIndex={revealed ? -1 : 0}
          aria-hidden={revealed}
          aria-label={`Показать перевод слова ${word.armenian}`}
        >
          <div className="flashcard__armenian" lang="hy">{word.armenian}</div>
          <div className="flashcard__transcription">{word.transcription}</div>
          <div className="flashcard__hint">Показать перевод</div>
        </button>
        <div className="flashcard__face flashcard__back surface-card" aria-hidden={!revealed}>
          <div className="flashcard__translation">{word.translation}</div>
          <div className="flashcard__example" lang="hy">{word.example}</div>
          <div className="flashcard__example-tr">{word.exampleTranslation}</div>
          {word.audioSrc && (
            <button
              className="flashcard__audio"
              type="button"
              onClick={() => togglePlay(audioId, word.audioSrc!)}
              disabled={isLoading}
              tabIndex={revealed ? 0 : -1}
              aria-label={isLoading ? 'Загружается эталонное произношение' : isPlaying ? 'Пауза эталонного произношения' : 'Прослушать эталонное произношение'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
              <span>{isPlaying ? 'Пауза' : 'Послушать'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
