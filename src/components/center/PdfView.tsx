import { usePdfStore } from '../../stores/usePdfStore';
import { VideoSection } from './VideoSection';
import { PdfControls } from './PdfControls';
import { PdfCanvas } from './PdfCanvas';

export function PdfView() {
  const isFullscreen = usePdfStore((s) => s.isFullscreen);

  return (
    <div className={`view-panel flex flex-col h-full ${isFullscreen ? 'pdf-fullscreen' : ''}`}>
      <VideoSection />
      <PdfControls />
      <PdfCanvas />
    </div>
  );
}
