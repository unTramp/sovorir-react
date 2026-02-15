import { useState, useCallback, useRef } from 'react';
import { dictionary } from '../../data/dictionary';
import { DictGrid } from '../dictionary/DictGrid';

export function DictionaryView() {
  const [filter, setFilter] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilter(value.trim().toLowerCase());
    }, 200);
  }, []);

  const filtered = filter
    ? dictionary.filter(
        (w) =>
          w.armenian.toLowerCase().includes(filter) ||
          w.translation.toLowerCase().includes(filter) ||
          w.transcription.toLowerCase().includes(filter) ||
          w.category.toLowerCase().includes(filter),
      )
    : dictionary;

  return (
    <div className="view-panel flex flex-col h-full">
      <div className="h-11 bg-content border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <span className="text-base font-semibold text-dark">Словарь урока</span>
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Поиск слова..."
            className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-app text-dark placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            aria-label="Поиск в словаре"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <DictGrid words={filtered} />
      </div>
    </div>
  );
}
