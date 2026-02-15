import { useEffect, useRef, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { usePdfStore } from '../stores/usePdfStore';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export function usePdfRenderer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const renderingRef = useRef(false);
  const { currentPage, scale, setTotalPages } = usePdfStore();

  const renderPage = useCallback(
    async (pageNum: number) => {
      const pdfDoc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!pdfDoc || !canvas || renderingRef.current) return;
      renderingRef.current = true;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error('Page render error:', err);
      } finally {
        renderingRef.current = false;
      }
    },
    [scale, canvasRef],
  );

  // Load PDF on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const doc = await pdfjs.getDocument({
          url: '/assets/sample.pdf',
          isOffscreenCanvasSupported: false,
        }).promise;
        if (cancelled) return;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        renderPage(1);
      } catch (err) {
        console.warn('PDF load failed:', err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [setTotalPages, renderPage]);

  // Re-render on page/scale change
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, renderPage]);

  return { hasPdf: pdfDocRef.current !== null };
}
