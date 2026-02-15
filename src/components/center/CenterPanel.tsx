import { useAppStore } from '../../stores/useAppStore';
import { PdfView } from './PdfView';
import { AudioMobileView } from './AudioMobileView';
import { DictionaryView } from './DictionaryView';
import { NotesView } from './NotesView';

export function CenterPanel() {
  const currentView = useAppStore((s) => s.currentView);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-center">
      {currentView === 'pdf' && <PdfView />}
      {currentView === 'video' && <PdfView />}
      {currentView === 'audio' && <AudioMobileView />}
      {currentView === 'dictionary' && <DictionaryView />}
      {currentView === 'notes' && <NotesView />}
    </main>
  );
}
