import { teacherNotes } from '../../data/teacherNotes';
import { TeacherNoteCard } from './TeacherNoteCard';

export function NotesView() {
  return (
    <div className="view-panel flex flex-col h-full">
      <div className="h-11 bg-content border-b border-border flex items-center px-4 flex-shrink-0">
        <span className="text-base font-semibold text-dark">Заметки преподавателя</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {teacherNotes.map((note) => (
            <TeacherNoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}
