import { useKeyboard } from '../../hooks/useKeyboard';
import { useAppStore } from '../../stores/useAppStore';
import { MobileHeader } from './MobileHeader';
import { SidebarBackdrop } from './SidebarBackdrop';
import { Sidebar } from '../sidebar/Sidebar';
import { CenterPanel } from '../center/CenterPanel';
import { ChevronLeftIcon } from '../../icons';

export function AppShell() {
  useKeyboard();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);

  return (
    <div className="flex flex-col h-full">
      <MobileHeader />

      <div className="flex flex-1 min-h-0 main-content-area">
        <SidebarBackdrop />

        {/* Sidebar */}
        <div className={`sidebar-wrapper relative flex-shrink-0 ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <Sidebar />
          <button
            onClick={toggleSidebarCollapsed}
            className="sidebar-toggle-btn"
            aria-label="Свернуть меню"
          >
            <ChevronLeftIcon />
          </button>
        </div>

        {/* Center */}
        <CenterPanel />
      </div>
    </div>
  );
}
