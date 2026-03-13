import { useAppStore } from '../../stores/useAppStore';
import { LessonView } from './LessonView';
import { AudioMobileView } from './AudioMobileView';
import { DictionaryView } from './DictionaryView';
import { NotesView } from './NotesView';

export function CenterPanel() {
  const currentView = useAppStore((s) => s.currentView);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-content">
      {currentView === 'lesson' && <LessonView />}
      {currentView === 'audio' && <AudioMobileView />}
      {currentView === 'dictionary' && <DictionaryView />}
      {currentView === 'notes' && <NotesView />}
    </main>
  );
}
