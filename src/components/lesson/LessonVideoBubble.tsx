import { useState } from 'react';
import type { VideoBubbleBlock } from '../../types/lessonContent';
import { VideoOverlay } from '../audio/VideoOverlay';

interface Props {
  block: VideoBubbleBlock;
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 4l10 6-10 6V4z" fill="currentColor" />
    </svg>
  );
}

function VideoPoster({ block, className }: { block: VideoBubbleBlock; className: string }) {
  if (block.thumbnail) {
    return <img src={block.thumbnail} alt="" className={className} />;
  }

  return (
    <video
      src={block.videoSrc}
      className={className}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}

export function LessonVideoBubble({ block }: Props) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const presentation = block.presentation ?? 'lesson';
  const senderName = block.senderName ?? 'Ани';
  const openVideo = () => setOverlayOpen(true);

  return (
    <>
      {presentation === 'circle' && (
        <div className="my-6 flex items-start gap-4">
          <button
            type="button"
            className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[3px] border-primary/35 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={openVideo}
            aria-label={`Открыть видео-кружок: ${block.text ?? senderName}`}
          >
            <VideoPoster block={block} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 grid place-items-center bg-black/10 transition-colors group-hover:bg-black/20">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 pl-0.5 text-primary shadow-sm">
                <PlayIcon size={18} />
              </span>
            </span>
          </button>

          <div className="min-w-0 pt-2">
            <div className="text-sm font-semibold text-dark">{senderName}</div>
            {block.text && <div className="mt-1 text-sm leading-6 text-dark/80">{block.text}</div>}
            {block.duration && (
              <div className="mt-2 text-xs text-muted">Видео · {Math.round(block.duration)} сек</div>
            )}
          </div>
        </div>
      )}

      {presentation === 'scene' && (
        <div className="my-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <button
            type="button"
            className="group relative block aspect-video w-full overflow-hidden bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            onClick={openVideo}
            aria-label={`Открыть сцену: ${block.text ?? 'видео'}`}
          >
            <VideoPoster block={block} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]" />
            <span className="absolute inset-0 grid place-items-center bg-black/15 transition-colors group-hover:bg-black/25">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/95 pl-1 text-primary shadow-md">
                <PlayIcon size={24} />
              </span>
            </span>
            <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">
              Сцена
            </span>
          </button>
          {(block.senderName || block.text || block.duration) && (
            <div className="px-4 py-3">
              {block.senderName && <div className="text-xs font-semibold uppercase tracking-wide text-muted">{block.senderName}</div>}
              {block.text && <div className="mt-1 text-sm leading-6 text-dark">{block.text}</div>}
              {block.duration && <div className="mt-1 text-xs text-muted">{Math.round(block.duration)} сек</div>}
            </div>
          )}
        </div>
      )}

      {presentation === 'lesson' && (
        <div className="flex justify-start my-5">
          <div className="voice-bubble voice-bubble--teacher">
            <img
              src="/assets/teacher-avatar.png"
              className="voice-bubble__teacher-img"
              alt={senderName}
            />
            <div className="voice-bubble__name">{senderName}</div>
            {block.text && <div className="voice-bubble__text">{block.text}</div>}
            <button
              className="lesson-video-thumb"
              onClick={openVideo}
              aria-label={`Открыть видео: ${block.text ?? senderName}`}
              type="button"
            >
              <VideoPoster block={block} className="lesson-video-thumb__img" />
              <div className="lesson-video-thumb__overlay">
                <div className="lesson-video-thumb__play text-primary">
                  <PlayIcon />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {overlayOpen && (
        <VideoOverlay
          videoSrc={block.videoSrc}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}
