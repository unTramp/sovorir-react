import { useAppStore } from '../../stores/useAppStore';

export function SidebarBackdrop() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div
      className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
      aria-hidden="true"
      onClick={() => toggleSidebar(false)}
    />
  );
}
