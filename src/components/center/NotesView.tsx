import { useMemo } from 'react';
import { teacherNotes } from '../../data/teacherNotes';
import { renderMarkdown } from '../../lib/markdown';

export function NotesView() {
  const html = useMemo(() => renderMarkdown(teacherNotes), []);

  return (
    <div className="view-panel flex flex-col h-full">
      <div className="h-11 bg-rightpanel border-b border-border flex items-center px-4 flex-shrink-0">
        <span className="text-base font-semibold text-dark">Заметки преподавателя</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="max-w-2xl mx-auto">
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
