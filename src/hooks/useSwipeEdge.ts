import { useEffect } from 'react';

interface Options {
  /** Width of the left-edge hit zone that initiates a drag (px) */
  edgeWidth?: number;
  /** Minimum horizontal distance to trigger open (px) */
  threshold?: number;
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Detects left-edge swipe-right to open the drawer and right-to-left swipe
 * on the backdrop to close it. Uses passive touch listeners so it never
 * blocks scroll.
 */
export function useSwipeEdge({
  edgeWidth = 24,
  threshold = 60,
  onOpen,
  onClose,
  isOpen,
}: Options) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      // Only track if starting from the left edge (when closed) or anywhere (when open)
      tracking = isOpen || startX <= edgeWidth;
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking) return;
      tracking = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // Ignore mostly-vertical swipes
      if (Math.abs(dy) > Math.abs(dx)) return;

      if (!isOpen && dx >= threshold) {
        onOpen();
      } else if (isOpen && dx <= -threshold) {
        onClose();
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpen, edgeWidth, threshold, onOpen, onClose]);
}
