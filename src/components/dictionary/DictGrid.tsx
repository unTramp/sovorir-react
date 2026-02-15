import { useMemo, Fragment } from 'react';
import type { DictionaryWord } from '../../types/dictionary';
import { DictGroupHeader } from './DictGroupHeader';
import { DictCard } from './DictCard';

interface Props {
  words: DictionaryWord[];
}

export function DictGrid({ words }: Props) {
  const groups = useMemo(() => {
    const map: Record<string, DictionaryWord[]> = {};
    words.forEach((word) => {
      (map[word.category] ||= []).push(word);
    });
    return Object.entries(map);
  }, [words]);

  if (words.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <div className="text-4xl mb-2">{'\u{1F50D}'}</div>
        <p className="text-sm">Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className="dict-grid">
      {groups.map(([category, categoryWords]) => (
        <Fragment key={category}>
          <DictGroupHeader category={category} />
          {categoryWords.map((word) => (
            <DictCard key={word.id} word={word} />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
