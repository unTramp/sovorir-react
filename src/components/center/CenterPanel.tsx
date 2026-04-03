import { useAppStore } from '../../stores/useAppStore';
import { HomeView } from './HomeView';
import { LessonView } from './LessonView';
import { AudioMobileView } from './AudioMobileView';
import { DictionaryView } from './DictionaryView';
import { NotesView } from './NotesView';
import { PracticeView } from './PracticeView';
import { LiveLessonsView } from './LiveLessonsView';
import { StatisticsView } from './StatisticsView';
import { SettingsView } from './SettingsView';

export function CenterPanel() {
  const currentView = useAppStore((s) => s.currentView);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-content">
      {currentView === 'home' && <HomeView />}
      {currentView === 'lesson' && <LessonView />}
      {currentView === 'audio' && <AudioMobileView />}
      {currentView === 'dictionary' && <DictionaryView />}
      {currentView === 'notes' && <NotesView />}
      {currentView === 'practice' && <PracticeView />}
      {currentView === 'live-lessons' && <LiveLessonsView />}
      {currentView === 'statistics' && <StatisticsView />}
      {currentView === 'settings' && <SettingsView />}
    </main>
  );
}
