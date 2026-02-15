import { create } from 'zustand';
import type { SectionType } from '../types/lesson';

type ViewType = SectionType | 'pdf';

interface AppState {
  currentView: ViewType;
  currentLesson: number;
  activeSection: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  videoOpen: boolean;

  setCurrentView: (view: ViewType) => void;
  setCurrentLesson: (lesson: number) => void;
  setActiveSection: (section: string) => void;
  toggleSidebar: (force?: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setVideoOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'pdf',
  currentLesson: 3,
  activeSection: 's3-0',
  sidebarOpen: false,
  sidebarCollapsed: false,
  videoOpen: true,

  setCurrentView: (view) => set({ currentView: view }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: (force) =>
    set((s) => ({ sidebarOpen: force !== undefined ? force : !s.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setVideoOpen: (open) => set({ videoOpen: open }),
}));
