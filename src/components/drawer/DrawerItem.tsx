import { useNavigate, useMatch } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import type { SectionType } from '../../types/lesson';

export interface DrawerItemProps {
  label: string;
  icon: React.ReactNode;
  viewId?: SectionType;
  badge?: string;
  pro?: boolean;
}

function viewToPath(viewId: SectionType): string {
  return viewId === 'home' ? '/' : `/${viewId}`;
}

export function DrawerItem({ label, icon, viewId, badge, pro }: DrawerItemProps) {
  const navigate = useNavigate();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const path = viewId ? viewToPath(viewId) : '/';
  const match = useMatch(path);
  const isActive = !!match;

  function handleClick() {
    if (viewId) navigate(path);
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
