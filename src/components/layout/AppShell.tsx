import { useLocation } from 'react-router-dom';
import { useKeyboard } from '../../hooks/useKeyboard';
import { MobileHeader } from './MobileHeader';
import { CenterPanel } from '../center/CenterPanel';
import { PWAInstallBanner } from './PWAInstallBanner';
import { BottomTabBar } from './BottomTabBar';

export function AppShell() {
  useKeyboard();
  const location = useLocation();
  const isLessonRoute = location.pathname === '/lesson';

  return (
    <div className={`app-shell flex flex-col h-full${isLessonRoute ? ' app-shell--lesson' : ''}`}>
      <MobileHeader />
      <div className="flex flex-1 min-h-0 main-content-area">
        <CenterPanel />
      </div>
      <PWAInstallBanner />
      <BottomTabBar />
    </div>
  );
}
