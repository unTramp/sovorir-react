import { useRef } from 'react';
import { usePdfRenderer } from '../../hooks/usePdfRenderer';

export function PdfCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePdfRenderer(canvasRef);

  return (
    <div className="pdf-canvas-container flex-1 bg-center no-scrollbar">
      <canvas ref={canvasRef} />
    </div>
  );
}
