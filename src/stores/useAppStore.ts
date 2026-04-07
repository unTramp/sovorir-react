import { create } from 'zustand';

interface AppState {
  currentLesson: number;
  activeSection: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  pagesViewed: number;

  setCurrentLesson: (lesson: number) => void;
  setActiveSection: (section: string) => void;
  toggleSidebar: (force?: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  incrementPagesViewed: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLesson: 1,
  activeSection: '',
  sidebarOpen: false,
  sidebarCollapsed: false,
  pagesViewed: 0,

  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: (force) =>
    set((s) => ({ sidebarOpen: force !== undefined ? force : !s.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  incrementPagesViewed: () => set((s) => ({ pagesViewed: s.pagesViewed + 1 })),
}));
