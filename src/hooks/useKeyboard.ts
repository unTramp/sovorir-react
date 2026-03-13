import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useLessonStore } from '../stores/useLessonStore';

export function useKeyboard() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const currentView = useAppStore((s) => s.currentView);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Escape closes overlays
      if (e.key === 'Escape') {
        if (sidebarOpen) toggleSidebar(false);
        const { isFullscreen, toggleFullscreen } = useLessonStore.getState();
        if (isFullscreen) toggleFullscreen();
      }

      // Lesson shortcuts
      if (currentView === 'lesson') {
        const store = useLessonStore.getState();
        if (e.key === 'ArrowLeft') store.prevPage();
        if (e.key === 'ArrowRight') store.nextPage();
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [sidebarOpen, toggleSidebar, currentView]);
}
