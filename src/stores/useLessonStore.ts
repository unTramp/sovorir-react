import { create } from 'zustand';

interface LessonState {
  currentSection: number;
  totalSections: number;
  isFullscreen: boolean;

  setCurrentSection: (section: number) => void;
  setTotalSections: (total: number) => void;
  nextSection: () => void;
  prevSection: () => void;
  toggleFullscreen: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentSection: 1,
  totalSections: 0,
  isFullscreen: false,

  setCurrentSection: (section) => set({ currentSection: section }),
  setTotalSections: (total) => set({ totalSections: total }),
  nextSection: () => {
    const { currentSection, totalSections } = get();
    if (currentSection < totalSections) set({ currentSection: currentSection + 1 });
  },
  prevSection: () => {
    const { currentSection } = get();
    if (currentSection > 1) set({ currentSection: currentSection - 1 });
  },
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
}));
