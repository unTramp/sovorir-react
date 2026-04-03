import { create } from 'zustand';
import type { SectionType } from '../types/lesson';
import { lessons } from '../data/lessons';

interface AppState {
  currentView: SectionType;
  currentLesson: number;
  activeSection: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  pagesViewed: number;

  setCurrentView: (view: SectionType) => void;
  setCurrentLesson: (lesson: number) => void;
  setActiveSection: (section: string) => void;
  toggleSidebar: (force?: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  incrementPagesViewed: () => void;
}

const currentLessonData = lessons.find((l) => l.status === 'current');

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  currentLesson: currentLessonData?.id ?? 1,
  activeSection: '',
  sidebarOpen: false,
  sidebarCollapsed: false,
  pagesViewed: 0,

  setCurrentView: (view) => set((s) => ({ currentView: view, pagesViewed: s.pagesViewed + 1 })),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: (force) =>
    set((s) => ({ sidebarOpen: force !== undefined ? force : !s.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  incrementPagesViewed: () => set((s) => ({ pagesViewed: s.pagesViewed + 1 })),
}));
