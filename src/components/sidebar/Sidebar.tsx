import { useAppStore } from '../../stores/useAppStore';
import { SidebarHeader } from './SidebarHeader';
import { LessonSections } from './LessonSections';

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
      <div className="sidebar-ararat">
        <img src="/assets/ararat.png" alt="" />
      </div>
      <div className="border-t border-border flex-shrink-0 px-4 py-3">
        <button className="sidebar-logout-btn">
          Выход
        </button>
      </div>
    </aside>
  );
}
