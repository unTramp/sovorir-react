import { useEffect } from 'react';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useAppStore } from '../../stores/useAppStore';
import { useSwipeEdge } from '../../hooks/useSwipeEdge';
import { MobileHeader } from './MobileHeader';
import { CenterPanel } from '../center/CenterPanel';
import { PWAInstallBanner } from './PWAInstallBanner';
import { DrawerBackdrop } from '../drawer/DrawerBackdrop';
import { FloatingDrawer } from '../drawer/FloatingDrawer';
import { BottomTabBar } from './BottomTabBar';

export function AppShell() {
  useKeyboard();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  useEffect(() => {
    const { body, documentElement } = document;

    if (!sidebarOpen) {
      const scrollY = Number(body.dataset.drawerScrollY ?? '0');

      body.classList.remove('drawer-lock');
      documentElement.classList.remove('drawer-lock');
      body.style.removeProperty('position');
      body.style.removeProperty('top');
      body.style.removeProperty('left');
      body.style.removeProperty('right');
      body.style.removeProperty('width');
      body.style.removeProperty('overflow');
      delete body.dataset.drawerScrollY;

      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }

      return;
    }

    const scrollY = window.scrollY;
    body.dataset.drawerScrollY = String(scrollY);
    body.classList.add('drawer-lock');
    documentElement.classList.add('drawer-lock');
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      const savedScrollY = Number(body.dataset.drawerScrollY ?? '0');

      body.classList.remove('drawer-lock');
      documentElement.classList.remove('drawer-lock');
      body.style.removeProperty('position');
      body.style.removeProperty('top');
      body.style.removeProperty('left');
      body.style.removeProperty('right');
      body.style.removeProperty('width');
      body.style.removeProperty('overflow');
      delete body.dataset.drawerScrollY;

      if (savedScrollY > 0) {
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [sidebarOpen]);

  useSwipeEdge({
    isOpen: sidebarOpen,
    onOpen: () => toggleSidebar(true),
    onClose: () => toggleSidebar(false),
  });

  return (
    <div className="app-shell flex flex-col h-full">
      <MobileHeader />
      <DrawerBackdrop />
      <FloatingDrawer />
      <div className={`flex flex-1 min-h-0 main-content-area ${sidebarOpen ? 'drawer-open' : ''}`}>
        <CenterPanel />
      </div>
      <PWAInstallBanner />
      <BottomTabBar />
    </div>
  );
}
