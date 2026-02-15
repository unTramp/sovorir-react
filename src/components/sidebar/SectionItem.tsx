import type { Section } from '../../types/lesson';
import { useAppStore } from '../../stores/useAppStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { VideoIcon, PdfIcon, AudioIcon, DictionaryIcon, NotesIcon } from '../../icons';
import type { SectionType } from '../../types/lesson';

const iconMap: Record<SectionType, React.FC<{ className?: string }>> = {
  video: VideoIcon,
  pdf: PdfIcon,
  audio: AudioIcon,
  dictionary: DictionaryIcon,
  notes: NotesIcon,
};

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
  const isCompleted = section.status === 'completed';
  const Icon = iconMap[section.type] || PdfIcon;

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
      className={`sidebar-tree-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer ${
        isActive ? 'active' : ''
      }`}
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`}>
        <Icon />
      </span>
      <span className="truncate">{section.title}</span>
    </div>
  );
}
