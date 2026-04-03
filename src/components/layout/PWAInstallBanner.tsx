import { useState, useCallback } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAppStore } from '../../stores/useAppStore';

const DISMISSED_KEY = 'sovorir-pwa-banner-dismissed';

export function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const pagesViewed = useAppStore((s) => s.pagesViewed);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1',
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, '1');
  }, []);

  const handleInstall = useCallback(async () => {
    const accepted = await install();
    if (accepted) handleDismiss();
  }, [install, handleDismiss]);

  if (!canInstall || dismissed || pagesViewed < 2) return null;

  return (
    <div className="pwa-banner">
      <div className="pwa-banner__content">
        <div className="pwa-banner__icon">📚</div>
        <div className="pwa-banner__text">
          <div className="pwa-banner__title">Установить Sovorir</div>
          <div className="pwa-banner__desc">Учите армянский офлайн</div>
        </div>
        <button className="pwa-banner__install" onClick={handleInstall}>
          Установить
        </button>
        <button className="pwa-banner__close" onClick={handleDismiss} aria-label="Закрыть">
          ✕
        </button>
      </div>
    </div>
  );
}
