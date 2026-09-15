import { useAppStore } from '../../stores/useAppStore';
import { DrawerProfile } from './DrawerProfile';
import { DrawerNav } from './DrawerNav';

export function FloatingDrawer() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div
      className={`floating-drawer ${sidebarOpen ? 'open' : ''}`}
      role="navigation"
      aria-label="Навигация"
    >
      <DrawerProfile />
      <div className="floating-drawer__scroll">
        <DrawerNav />
      </div>
    </div>
  );
}
