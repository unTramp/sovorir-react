import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useLessonStore } from '../stores/useLessonStore';

export function useKeyboard() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const location = useLocation();
  const navigate = useNavigate();
  const isLesson = location.pathname === '/lesson';

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (sidebarOpen) toggleSidebar(false);
        const { isFullscreen, toggleFullscreen } = useLessonStore.getState();
        if (isFullscreen) toggleFullscreen();
      }

      if (isLesson) {
        const store = useLessonStore.getState();
        if (e.key === 'ArrowLeft' && store.currentSection > 1) {
          const previousSection = store.currentSection - 1;
          store.setCurrentSection(previousSection);
          navigate(`/lesson?section=${previousSection}`, { replace: true });
        }
        if (e.key === 'ArrowRight' && store.currentSection < store.totalSections) {
          const nextSection = store.currentSection + 1;
          store.setCurrentSection(nextSection);
          navigate(`/lesson?section=${nextSection}`);
        }
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [sidebarOpen, toggleSidebar, isLesson, navigate]);
}
