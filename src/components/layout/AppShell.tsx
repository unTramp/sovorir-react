import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useAppStore } from '../../stores/useAppStore';
import { MobileHeader } from './MobileHeader';
import { BottomTabBar } from './BottomTabBar';
import { SidebarBackdrop } from './SidebarBackdrop';
import { Sidebar } from '../sidebar/Sidebar';
import { CenterPanel } from '../center/CenterPanel';
import { AudioPanel } from '../audio/AudioPanel';
import { ChevronLeftIcon } from '../../icons';

export function AppShell() {
  useKeyboard();
  const { isDesktop } = useMediaQuery();
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

        {/* Right Panel — Audio (desktop only) */}
        {isDesktop && <AudioPanel />}
      </div>

      <BottomTabBar />
    </div>
  );
}
