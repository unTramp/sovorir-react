import { useEffect } from 'react';
import { usePdfStore } from '../../stores/usePdfStore';
import { lessonPages } from '../../data/lessonPages';
import { PdfControls } from './PdfControls';
import { LessonPageView } from './LessonPageView';

export function PdfView() {
  const isFullscreen = usePdfStore((s) => s.isFullscreen);
  const setTotalPages = usePdfStore((s) => s.setTotalPages);

  useEffect(() => {
    setTotalPages(lessonPages.length);
  }, [setTotalPages]);

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'pdf-fullscreen' : ''}`}>
      <PdfControls />
      <LessonPageView />
    </div>
  );
}
