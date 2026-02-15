import { useAppStore } from '../../stores/useAppStore';
import type { SectionType } from '../../types/lesson';

const tabs: { view: SectionType; icon: string; label: string }[] = [
  { view: 'pdf', icon: '\u{1F4C4}', label: 'PDF' },
  { view: 'audio', icon: '\u{1F3A7}', label: 'Аудио' },
  { view: 'dictionary', icon: '\u{1F4D8}', label: 'Словарь' },
  { view: 'notes', icon: '\u{1F4DD}', label: 'Заметки' },
];

export function BottomTabBar() {
  const currentView = useAppStore((s) => s.currentView);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div className="bottom-tab-bar" role="tablist" aria-label="Навигация">
      {tabs.map((tab) => (
        <button
          key={tab.view}
          data-view={tab.view}
          className={currentView === tab.view ? 'active' : ''}
          role="tab"
          aria-selected={currentView === tab.view}
          onClick={() => {
            setCurrentView(tab.view);
            toggleSidebar(false);
          }}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
