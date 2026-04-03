import type { TeacherNote } from '../../types/teacherNote';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

interface TeacherNoteCardProps {
  note: TeacherNote;
}

export function TeacherNoteCard({ note }: TeacherNoteCardProps) {
  return (
    <div className={`teacher-note-card teacher-note-card--${note.type}`}>
      <img
        className="teacher-note-card__avatar"
        src="/assets/teacher-avatar.png"
        alt="Лусине"
      />
      <div className="teacher-note-card__bubble">
        <div className="teacher-note-card__meta">
          <span className="teacher-note-card__name">Лусине</span>
          <span className="teacher-note-card__date">{formatDate(note.date)}</span>
          {note.lessonTitle && (
            <span className="teacher-note-card__lesson">{note.lessonTitle}</span>
          )}
        </div>

        <div className="teacher-note-card__body">
          {note.type === 'tip' && <span className="teacher-note-card__tip-icon">💡</span>}
          {note.text}
        </div>

        {note.highlight && (
          <div className="teacher-note-card__highlight">
            <span className="teacher-note-card__highlight-armenian">{note.highlight.armenian}</span>
            <span className="teacher-note-card__highlight-transcription">{note.highlight.transcription}</span>
            <span className="teacher-note-card__highlight-translation">{note.highlight.translation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
