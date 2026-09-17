import { useNavigate, useLocation } from 'react-router-dom';
import type { Section } from '../../types/lesson';
import { useAppStore } from '../../stores/useAppStore';
import { useLessonStore } from '../../stores/useLessonStore';

interface Props {
  section: Section;
  sectionNumber: number;
}

export function SectionItem({ section, sectionNumber }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const currentSection = useLessonStore((s) => s.currentSection);

  const isLessonRoute = location.pathname === '/lesson';
  const isActive = isLessonRoute && currentSection === sectionNumber;

  function handleClick() {
    setActiveSection(section.id);
    useLessonStore.getState().setCurrentSection(sectionNumber);
    navigate(`/lesson?section=${sectionNumber}`);
    toggleSidebar(false);
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
