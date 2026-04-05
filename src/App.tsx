import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './components/center/HomeView';
import { LessonView } from './components/center/LessonView';
import { AudioMobileView } from './components/center/AudioMobileView';
import { DictionaryView } from './components/center/DictionaryView';
import { NotesView } from './components/center/NotesView';
import { PracticeView } from './components/center/PracticeView';
import { LiveLessonsView } from './components/center/LiveLessonsView';
import { StatisticsView } from './components/center/StatisticsView';
import { SettingsView } from './components/center/SettingsView';
import { useAppStore } from './stores/useAppStore';

function RouteChangeTracker() {
  const location = useLocation();
  const incrementPagesViewed = useAppStore((s) => s.incrementPagesViewed);

  useEffect(() => {
    incrementPagesViewed();
  }, [location.pathname]);

  return null;
}

function AppContent() {
  useEffect(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, []);

  return (
    <ErrorBoundary>
      <RouteChangeTracker />
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomeView />} />
          <Route path="lesson" element={<LessonView />} />
          <Route path="practice" element={<PracticeView />} />
          <Route path="dictionary" element={<DictionaryView />} />
          <Route path="notes" element={<NotesView />} />
          <Route path="live-lessons" element={<LiveLessonsView />} />
          <Route path="statistics" element={<StatisticsView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="audio" element={<AudioMobileView />} />
          <Route path="video" element={<HomeView />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
