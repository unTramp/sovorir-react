import { useEffect, useRef, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { usePdfStore } from '../stores/usePdfStore';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

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
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
      } catch (err) {
        console.error('Page render error:', err);
      }

      renderingRef.current = false;
    },
    [scale, canvasRef],
  );

  // Load PDF on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const doc = await pdfjs.getDocument('/assets/sample.pdf').promise;
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
