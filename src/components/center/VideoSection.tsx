import { useAppStore } from '../../stores/useAppStore';
import { CloseIcon } from '../../icons';

const VIMEO_SRC = 'https://player.vimeo.com/video/1158598174?h=5a76718eef';

export function VideoSection() {
  const videoOpen = useAppStore((s) => s.videoOpen);
  const setVideoOpen = useAppStore((s) => s.setVideoOpen);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  if (!videoOpen) return null;

  function handleClose() {
    setVideoOpen(false);
    setCurrentView('pdf');
    setActiveSection('s3-1');
  }

  return (
    <div className="video-section flex-shrink-0">
      <div className="h-11 bg-center/95 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <svg className="w-[20px] h-[20px]" viewBox="0 0 20 14" fill="none">
            <rect className="video-icon-rect" width="20" height="14" rx="3" />
            <path d="M8 3.5v7l5.5-3.5L8 3.5z" fill="white" />
          </svg>
          <span className="text-base font-semibold text-dark">
            Видео преподавателя к уроку
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">12:34</span>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent/15 text-muted hover:text-primary transition-colors"
            aria-label="Закрыть видео"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="relative bg-black border-b border-border" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={VIMEO_SRC}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title="Видео урока"
        />
      </div>
    </div>
  );
}
