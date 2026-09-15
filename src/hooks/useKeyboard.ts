import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLessonStore } from '../stores/useLessonStore';

export function useKeyboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLesson = location.pathname === '/lesson';

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
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
  }, [isLesson, navigate]);
}
