import { useAppStore } from '../../stores/useAppStore';
import { DrawerProfile } from './DrawerProfile';
import { DrawerNav } from './DrawerNav';
import { DrawerNavBottom } from './DrawerNavBottom';

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function FloatingDrawer() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div
      className={`floating-drawer ${sidebarOpen ? 'open' : ''}`}
      role="navigation"
      aria-label="Навигация"
    >
      <button className="drawer-close-btn" onClick={() => toggleSidebar(false)} aria-label="Закрыть меню">
        <XIcon />
      </button>
      <DrawerProfile />
      <div className="floating-drawer__scroll">
        <DrawerNav />
      </div>
      <DrawerNavBottom />
    </div>
  );
}
