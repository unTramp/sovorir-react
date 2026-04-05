import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginView } from './components/auth/LoginView';
import { useAppStore } from './stores/useAppStore';
import { useAuthStore } from './stores/useAuthStore';

// Lazy-loaded views — each gets its own chunk
const HomeView         = lazy(() => import('./components/center/HomeView').then(m => ({ default: m.HomeView })));
const LessonView       = lazy(() => import('./components/center/LessonView').then(m => ({ default: m.LessonView })));
const PracticeView     = lazy(() => import('./components/center/PracticeView').then(m => ({ default: m.PracticeView })));
const DictionaryView   = lazy(() => import('./components/center/DictionaryView').then(m => ({ default: m.DictionaryView })));
const NotesView        = lazy(() => import('./components/center/NotesView').then(m => ({ default: m.NotesView })));
const LiveLessonsView  = lazy(() => import('./components/center/LiveLessonsView').then(m => ({ default: m.LiveLessonsView })));
const StatisticsView   = lazy(() => import('./components/center/StatisticsView').then(m => ({ default: m.StatisticsView })));
const SettingsView     = lazy(() => import('./components/center/SettingsView').then(m => ({ default: m.SettingsView })));
const AudioMobileView  = lazy(() => import('./components/center/AudioMobileView').then(m => ({ default: m.AudioMobileView })));

function ViewFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    useAppStore.getState().incrementPagesViewed();
  }, [location.pathname]);

  return null;
}

function AppContent() {
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, []);

  useEffect(() => {
    void useAuthStore.getState().initialize();
  }, []);

  if (!authReady || (isLoading && !profile)) {
    return <ViewFallback />;
  }

  if (!profile) {
    return <LoginView />;
  }

  return (
    <ErrorBoundary>
      <RouteChangeTracker />
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Suspense fallback={<ViewFallback />}><HomeView /></Suspense>} />
          <Route path="lesson"      element={<Suspense fallback={<ViewFallback />}><LessonView /></Suspense>} />
          <Route path="practice"    element={<Suspense fallback={<ViewFallback />}><PracticeView /></Suspense>} />
          <Route path="dictionary"  element={<Suspense fallback={<ViewFallback />}><DictionaryView /></Suspense>} />
          <Route path="notes"       element={<Suspense fallback={<ViewFallback />}><NotesView /></Suspense>} />
          <Route path="live-lessons"element={<Suspense fallback={<ViewFallback />}><LiveLessonsView /></Suspense>} />
          <Route path="statistics"  element={<Suspense fallback={<ViewFallback />}><StatisticsView /></Suspense>} />
          <Route path="settings"    element={<Suspense fallback={<ViewFallback />}><SettingsView /></Suspense>} />
          <Route path="audio"       element={<Suspense fallback={<ViewFallback />}><AudioMobileView /></Suspense>} />
          <Route path="video"       element={<Suspense fallback={<ViewFallback />}><HomeView /></Suspense>} />
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
