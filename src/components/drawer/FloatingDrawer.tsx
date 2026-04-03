import { useAppStore } from '../../stores/useAppStore';
import { DrawerProfile } from './DrawerProfile';
import { DrawerNav } from './DrawerNav';
import { DrawerUpgrade } from './DrawerUpgrade';

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
      <DrawerUpgrade />
    </div>
  );
}
