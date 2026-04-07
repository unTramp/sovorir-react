import { useNavigate, useMatch } from 'react-router-dom';
import { DrawerItem } from './DrawerItem';
import { useAppStore } from '../../stores/useAppStore';
import { HouseIcon, BookOpenIcon, ZapIcon, FilmIcon, BarChartIcon, SettingsGearIcon } from '../../icons';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';

export function DrawerNav() {
  const navigate = useNavigate();
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const lessonMatch = useMatch('/lesson');
  const { lessons, currentLesson } = useLessonCatalog();

  const totalLessons = lessons.length;
  const lessonBadge = currentLesson ? `${currentLesson.id} / ${totalLessons}` : '—';

  function handleLessonsClick() {
    if (!currentLesson) return;
    const firstLessonSection = currentLesson.sections.find((s) => s.type === 'lesson');
    setActiveSection(firstLessonSection?.id ?? 'lesson');
    navigate('/lesson');
    toggleSidebar(false);
  }

  return (
    <div className="drawer-nav px-3 pt-4 pb-2" role="list">
      <div className="drawer-nav-group">
        <div className="drawer-nav-group__label">УЧЁБА</div>
        <DrawerItem label="Главная" icon={<HouseIcon />} viewId="home" />
        <div
          className={`drawer-item${lessonMatch ? ' active' : ''}${currentLesson ? '' : ' opacity-60'}`}
          role="listitem"
          tabIndex={0}
          onClick={handleLessonsClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLessonsClick(); }
          }}
        >
          <span className="drawer-item__icon"><BookOpenIcon /></span>
          <span className="truncate flex-1">Уроки</span>
          <span className="drawer-item-badge">{lessonBadge}</span>
        </div>
        <DrawerItem label="Тренировка" icon={<ZapIcon />} viewId="practice" />
      </div>

      <div className="drawer-nav-group">
        <div className="drawer-nav-group__label">ЕЩЁ</div>
        <DrawerItem label="Живые уроки" icon={<FilmIcon />} viewId="live-lessons" pro />
        <DrawerItem label="Статистика" icon={<BarChartIcon />} viewId="statistics" />
        <DrawerItem label="Настройки" icon={<SettingsGearIcon />} viewId="settings" />
      </div>
    </div>
  );
}
