import type { Section } from '../../types/lesson';
import { useAppStore } from '../../stores/useAppStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface Props {
  section: Section;
}

export function SectionItem({ section }: Props) {
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { isDesktop } = useMediaQuery();

  const isActive = section.id === activeSection;

  function handleClick() {
    setActiveSection(section.id);
    setCurrentView(section.type);

    if (!isDesktop) toggleSidebar(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      className={`sidebar-tree-item flex items-center text-[13px] ${
        isActive ? 'active' : ''
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
