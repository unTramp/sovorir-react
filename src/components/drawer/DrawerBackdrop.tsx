import { useAppStore } from '../../stores/useAppStore';

export function DrawerBackdrop() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div
      className={`drawer-backdrop ${sidebarOpen ? 'visible' : ''}`}
      aria-hidden="true"
      onClick={() => toggleSidebar(false)}
    />
  );
}
