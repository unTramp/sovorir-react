import { create } from 'zustand';

interface LessonState {
  currentPage: number;
  totalPages: number;
  isFullscreen: boolean;

  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  toggleFullscreen: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentPage: 1,
  totalPages: 0,
  isFullscreen: false,

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
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
