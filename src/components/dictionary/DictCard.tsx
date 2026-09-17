import { memo } from 'react';
import type { DictionaryWord } from '../../types/dictionary';
import { PauseIcon, PlayIcon } from '../../icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface Props {
  word: DictionaryWord;
}

export const DictCard = memo(function DictCard({ word }: Props) {
  const { togglePlay, playingId, loadingId } = useAudioPlayer();
  const audioId = `dictionary-${word.id}`;
  const isPlaying = playingId === audioId;
  const isLoading = loadingId === audioId;

  return (
    <div className="dict-bubble">
      <div className="dict-bubble__head">
        <div className="dict-bubble__left">
          <span className="dict-bubble__word" lang="hy">
            {word.armenian}
          </span>
          <span className="dict-bubble__tr">{word.transcription}</span>
        </div>
        {word.audioSrc && (
          <button
            className="dict-bubble__play"
            type="button"
            aria-label={isPlaying ? `Поставить ${word.armenian} на паузу` : `Прослушать ${word.armenian}`}
            aria-pressed={isPlaying}
            disabled={isLoading}
            onClick={() => togglePlay(audioId, word.audioSrc!)}
          >
            {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>
        )}
      </div>
      <div className="dict-bubble__meaning">{word.translation}</div>
      <div className="dict-bubble__detail">
        <div className="dict-bubble__example">
          <div lang="hy">{word.example}</div>
          <div className="dict-bubble__example-tr">{word.exampleTranslation}</div>
        </div>
      </div>
    </div>
  );
});
