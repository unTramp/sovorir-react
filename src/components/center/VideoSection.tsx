import { useAppStore } from '../../stores/useAppStore';
import { ChevronUpIcon, ChevronDownIcon } from '../../icons';

const VIMEO_SRC = 'https://player.vimeo.com/video/1158598174?h=5a76718eef';

export function VideoSection() {
  const videoOpen = useAppStore((s) => s.videoOpen);
  const videoMinimized = useAppStore((s) => s.videoMinimized);
  const toggleVideoMinimized = useAppStore((s) => s.toggleVideoMinimized);

  if (!videoOpen) return null;

  return (
    <div className="video-section flex-shrink-0">
      {/* Toggle bar — always visible at top */}
      <button
        onClick={toggleVideoMinimized}
        className="w-full h-7 px-3 bg-rightpanel border-b border-border flex items-center justify-center relative text-muted hover:bg-accent/10 transition-colors"
        aria-label={videoMinimized ? 'Развернуть видео' : 'Свернуть видео'}
      >
        <svg className="w-5 h-4" viewBox="0 0 20 14" fill="none">
          <defs>
            <linearGradient id="video-icon-grad" x1="0" y1="0" x2="20" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C68473" />
              <stop offset="100%" stopColor="#7A3E34" />
            </linearGradient>
          </defs>
          <rect width="20" height="14" rx="3" fill="url(#video-icon-grad)" />
          <path d="M8 3.5v7l5.5-3.5L8 3.5z" fill="white" />
        </svg>
        <span className="absolute right-3 hover:text-accent transition-colors">
          {videoMinimized ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </span>
      </button>
      {/* Video — expands downward */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: videoMinimized ? '0fr' : '1fr' }}
      >
        <div className="overflow-hidden">
          <div className="relative bg-black rounded-[18px] overflow-hidden mx-8 my-8" style={{ aspectRatio: '16/9', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
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
      </div>
    </div>
  );
}
