import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { HamburgerIcon, FlameIcon } from '../../icons';
import type { SectionType } from '../../types/lesson';

const VIEW_TITLES: Record<SectionType, { title: string; subtitle?: string }> = {
  home: { title: 'Главная' },
  lesson: { title: '\u0423\u0440\u043E\u043A 3' },
  video: { title: '\u0412\u0438\u0434\u0435\u043E' },
  audio: { title: '\u0410\u0443\u0434\u0438\u043E' },
  practice: { title: '\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430' },
  dictionary: { title: '\u0421\u043B\u043E\u0432\u0430\u0440\u044C' },
  notes: { title: '\u0417\u0430\u043C\u0435\u0442\u043A\u0438' },
  'live-lessons': { title: '\u0416\u0438\u0432\u044B\u0435 \u0443\u0440\u043E\u043A\u0438' },
  statistics: { title: '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430' },
  settings: { title: '\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438' },
};

export function MobileHeader() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const currentView = useAppStore((s) => s.currentView);
  const { title, subtitle } = VIEW_TITLES[currentView] ?? { title: 'Sovorir' };
  const streak = useStreakStore((s) => s.currentStreak);

  return (
    <header className="h-14 flex items-center px-4 gap-3 flex-shrink-0 z-30 relative">
      <button
        onClick={() => toggleSidebar()}
        className="mobile-header__btn"
        aria-label="Меню"
      >
        <HamburgerIcon />
      </button>
      <span className="flex-1 text-lg font-semibold text-dark">{title}</span>
      {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      <div className="mobile-header__streak">
        <FlameIcon size={16} />
        <span>{streak}</span>
      </div>
    </header>
  );
}
