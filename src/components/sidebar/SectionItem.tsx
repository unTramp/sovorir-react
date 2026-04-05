import { useNavigate, useLocation } from 'react-router-dom';
import type { Section } from '../../types/lesson';
import { useAppStore } from '../../stores/useAppStore';

interface Props {
  section: Section;
}

export function SectionItem({ section }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const isActive = section.id === activeSection;
  const path = section.type === 'home' ? '/' : `/${section.type}`;

  function handleClick() {
    setActiveSection(section.id);
    navigate(path);
    toggleSidebar(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  // Also consider active by current route if no explicit activeSection set
  const isRouteActive = !activeSection && location.pathname === path;

  return (
    <div
      className={`sidebar-tree-item flex items-center text-[13px] ${
        isActive || isRouteActive ? 'active' : ''
      }`}
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="truncate">{section.title}</span>
    </div>
  );
}
