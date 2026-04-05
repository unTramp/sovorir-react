import { useState } from 'react';
import type { VideoBubbleBlock } from '../../types/lessonContent';
import { VideoOverlay } from '../audio/VideoOverlay';

interface Props {
  block: VideoBubbleBlock;
}

export function LessonVideoBubble({ block }: Props) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <>
      <div className="flex justify-start my-5">
        <div className="voice-bubble voice-bubble--teacher">
          <img
            src="/assets/teacher-avatar.png"
            className="voice-bubble__teacher-img"
            alt={block.senderName}
          />
          <div className="voice-bubble__name">{block.senderName}</div>
          <div className="voice-bubble__text">{block.text}</div>
          <button
            className="lesson-video-thumb"
            onClick={() => setOverlayOpen(true)}
            aria-label="Открыть видео"
          >
            <img
              src={block.thumbnail}
              alt={block.text}
              className="lesson-video-thumb__img"
            />
            <div className="lesson-video-thumb__overlay">
              <div className="lesson-video-thumb__play">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4l10 6-10 6V4z" fill="#7A3E34" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
      {overlayOpen && (
        <VideoOverlay
          videoSrc={block.videoSrc}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}
