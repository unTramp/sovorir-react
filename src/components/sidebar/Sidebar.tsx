import { useAppStore } from '../../stores/useAppStore';
import { SidebarHeader } from './SidebarHeader';
import { LessonSections } from './LessonSections';

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <aside
      className={`sidebar-desktop flex flex-col h-full overflow-hidden ${
        sidebarOpen ? 'open' : ''
      }`}
    >
      <SidebarHeader />
      <LessonSections />
      <div className="sidebar-ararat">
        <img src="/assets/ararat.png" alt="" />
      </div>
    </aside>
  );
}
