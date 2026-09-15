import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginView } from './components/auth/LoginView';
import { RoleRoute } from './components/auth/RoleRoute';
import { useAppStore } from './stores/useAppStore';
import { useAuthStore } from './stores/useAuthStore';

// Lazy-loaded views — each gets its own chunk
const HomeView              = lazy(() => import('./components/center/HomeView').then(m => ({ default: m.HomeView })));
const LessonView            = lazy(() => import('./components/center/LessonView').then(m => ({ default: m.LessonView })));
const PracticeView          = lazy(() => import('./components/center/PracticeView').then(m => ({ default: m.PracticeView })));
const DictionaryView        = lazy(() => import('./components/center/DictionaryView').then(m => ({ default: m.DictionaryView })));
const NotesView             = lazy(() => import('./components/center/NotesView').then(m => ({ default: m.NotesView })));
const SettingsView          = lazy(() => import('./components/center/SettingsView').then(m => ({ default: m.SettingsView })));
const TeacherDashboardView  = lazy(() => import('./components/center/TeacherDashboardView').then(m => ({ default: m.TeacherDashboardView })));
const AssignmentsView       = lazy(() => import('./components/center/AssignmentsView').then(m => ({ default: m.AssignmentsView })));
const ReviewQueueView       = lazy(() => import('./components/center/ReviewQueueView').then(m => ({ default: m.ReviewQueueView })));

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
          <Route path="lesson"      element={<RoleRoute allow={['student']}><Suspense fallback={<ViewFallback />}><LessonView /></Suspense></RoleRoute>} />
          <Route path="practice"    element={<RoleRoute allow={['student']}><Suspense fallback={<ViewFallback />}><PracticeView /></Suspense></RoleRoute>} />
          <Route path="dictionary"  element={<RoleRoute allow={['student']}><Suspense fallback={<ViewFallback />}><DictionaryView /></Suspense></RoleRoute>} />
          <Route path="notes"       element={<RoleRoute allow={['student']}><Suspense fallback={<ViewFallback />}><NotesView /></Suspense></RoleRoute>} />
          <Route path="settings"    element={<Suspense fallback={<ViewFallback />}><SettingsView /></Suspense>} />
          <Route path="teacher"      element={<RoleRoute allow={['teacher', 'admin']}><Suspense fallback={<ViewFallback />}><TeacherDashboardView /></Suspense></RoleRoute>} />
          <Route path="assignments"   element={<RoleRoute allow={['student']}><Suspense fallback={<ViewFallback />}><AssignmentsView /></Suspense></RoleRoute>} />
          <Route path="review-queue"    element={<RoleRoute allow={['teacher', 'admin']}><Suspense fallback={<ViewFallback />}><ReviewQueueView /></Suspense></RoleRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
