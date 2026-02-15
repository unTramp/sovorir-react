import { useAppStore } from '../../stores/useAppStore';
import { SidebarHeader } from './SidebarHeader';
import { LessonSections } from './LessonSections';

import { ProgressCircle } from './ProgressCircle';

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <aside
      className={`sidebar-desktop bg-sidebar border-r border-border flex flex-col h-full overflow-hidden ${
        sidebarOpen ? 'open' : ''
      }`}
    >
      <SidebarHeader />
      <LessonSections />
      <ProgressCircle />
    </aside>
  );
}
