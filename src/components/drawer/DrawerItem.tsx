import { useAppStore } from '../../stores/useAppStore';
import type { SectionType } from '../../types/lesson';

interface DrawerItemProps {
  label: string;
  icon: React.ReactNode;
  viewId?: SectionType;
  badge?: string;
  pro?: boolean;
}

export function DrawerItem({ label, icon, viewId, badge, pro }: DrawerItemProps) {
  const activeSection = useAppStore((s) => s.activeSection);
  const currentView = useAppStore((s) => s.currentView);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const isActive = viewId
    ? activeSection === viewId || currentView === viewId
    : false;

  function handleClick() {
    if (viewId) {
      setActiveSection(viewId);
      setCurrentView(viewId);
    }
    toggleSidebar(false);
  }

  return (
    <div
      className={`drawer-item${isActive ? ' active' : ''}`}
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
      }}
    >
      <span className="drawer-item__icon">{icon}</span>
      <span className="truncate flex-1">{label}</span>
      {badge && <span className="drawer-item-badge">{badge}</span>}
      {pro && <span className="drawer-item-pro">PRO</span>}
    </div>
  );
}
