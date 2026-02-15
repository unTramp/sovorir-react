import { create } from 'zustand';

interface PdfState {
  currentPage: number;
  totalPages: number;
  scale: number;
  isFullscreen: boolean;

  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  nextPage: () => void;
  prevPage: () => void;
  toggleFullscreen: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;

export const usePdfStore = create<PdfState>((set, get) => ({
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  isFullscreen: false,

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setScale: (scale) =>
    set({ scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale)) }),
  zoomIn: () => {
    const { scale } = get();
    set({ scale: Math.min(MAX_SCALE, scale + SCALE_STEP) });
  },
  zoomOut: () => {
    const { scale } = get();
    set({ scale: Math.max(MIN_SCALE, scale - SCALE_STEP) });
  },
  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) set({ currentPage: currentPage + 1 });
  },
  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) set({ currentPage: currentPage - 1 });
  },
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
}));
