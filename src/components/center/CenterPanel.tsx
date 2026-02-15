import { useAppStore } from '../../stores/useAppStore';
import { VideoSection } from './VideoSection';
import { PdfView } from './PdfView';
import { AudioMobileView } from './AudioMobileView';
import { DictionaryView } from './DictionaryView';
import { NotesView } from './NotesView';

export function CenterPanel() {
  const currentView = useAppStore((s) => s.currentView);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-center">
      <VideoSection />
      {currentView === 'pdf' && <PdfView />}
      {currentView === 'audio' && <AudioMobileView />}
      {currentView === 'dictionary' && <DictionaryView />}
      {currentView === 'notes' && <NotesView />}
    </main>
  );
}
