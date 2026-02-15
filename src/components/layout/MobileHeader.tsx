import { useAppStore } from '../../stores/useAppStore';
import { HamburgerIcon } from '../../icons';

export function MobileHeader() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3 flex-shrink-0 z-30 relative lg:hidden">
      <button
        onClick={() => toggleSidebar()}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent/15 hover:text-accent transition-colors"
        aria-label="Меню"
      >
        <HamburgerIcon />
      </button>
      <span className="text-lg font-semibold text-dark">Урок 3</span>
      <span className="text-xs text-muted ml-1">Чтение и произношение</span>
    </header>
  );
}
