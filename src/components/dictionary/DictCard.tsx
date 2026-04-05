import { memo } from 'react';
import type { DictionaryWord } from '../../types/dictionary';
import { PlayIcon } from '../../icons';

interface Props {
  word: DictionaryWord;
}

export const DictCard = memo(function DictCard({ word }: Props) {
  return (
    <div className="dict-bubble">
      <div className="dict-bubble__head">
        <div className="dict-bubble__left">
          <span className="dict-bubble__word" lang="hy">
            {word.armenian}
          </span>
          <span className="dict-bubble__tr">{word.transcription}</span>
        </div>
        <button
          className="dict-bubble__play"
          aria-label={`Прослушать ${word.armenian}`}
        >
          <PlayIcon size={14} />
        </button>
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
