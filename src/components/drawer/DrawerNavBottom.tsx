import { DrawerItem } from './DrawerItem';
import { BarChartIcon, SettingsGearIcon } from '../../icons';

export function DrawerNavBottom() {
  return (
    <div className="floating-drawer__bottom">
      <div className="drawer-divider" />
      <div className="py-2 px-3">
        <DrawerItem label="Статистика" icon={<BarChartIcon />} viewId="statistics" />
        <DrawerItem label="Настройки" icon={<SettingsGearIcon />} viewId="settings" />
      </div>
      <div className="drawer-version">Sovorir v1.0</div>
    </div>
  );
}
