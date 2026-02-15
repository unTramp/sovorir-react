import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { usePdfStore } from '../stores/usePdfStore';

export function useKeyboard() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const currentView = useAppStore((s) => s.currentView);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Escape closes overlays
      if (e.key === 'Escape') {
        if (sidebarOpen) toggleSidebar(false);
        const { isFullscreen, toggleFullscreen } = usePdfStore.getState();
        if (isFullscreen) toggleFullscreen();
      }

      // PDF shortcuts
      if (currentView === 'pdf') {
        const store = usePdfStore.getState();
        if (e.key === 'ArrowLeft') store.prevPage();
        if (e.key === 'ArrowRight') store.nextPage();
        if ((e.ctrlKey || e.metaKey) && e.key === '+') {
          e.preventDefault();
          store.zoomIn();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
          e.preventDefault();
          store.zoomOut();
        }
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [sidebarOpen, toggleSidebar, currentView]);
}
