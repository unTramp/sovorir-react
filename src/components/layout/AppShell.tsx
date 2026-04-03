import { useKeyboard } from '../../hooks/useKeyboard';
import { useAppStore } from '../../stores/useAppStore';
import { useSwipeEdge } from '../../hooks/useSwipeEdge';
import { MobileHeader } from './MobileHeader';
import { CenterPanel } from '../center/CenterPanel';
import { PWAInstallBanner } from './PWAInstallBanner';
import { DrawerBackdrop } from '../drawer/DrawerBackdrop';
import { FloatingDrawer } from '../drawer/FloatingDrawer';

export function AppShell() {
  useKeyboard();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  useSwipeEdge({
    isOpen: sidebarOpen,
    onOpen: () => toggleSidebar(true),
    onClose: () => toggleSidebar(false),
  });

  return (
    <div className="flex flex-col h-full">
      <MobileHeader />
      <DrawerBackdrop />
      <FloatingDrawer />
      <div className={`flex flex-1 min-h-0 main-content-area ${sidebarOpen ? 'drawer-open' : ''}`}>
        <CenterPanel />
      </div>
      <PWAInstallBanner />
    </div>
  );
}
