import { useState } from 'react';
import type { AudioMessage } from '../../types/audio';
import { VideoOverlay } from './VideoOverlay';

interface Props {
  message: AudioMessage;
}

export function VideoBubble({ message }: Props) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <>
      <div className="flex justify-start">
        <div className="voice-bubble voice-bubble--teacher">
          <img
            src="/assets/teacher-avatar.png"
            className="voice-bubble__teacher-img"
            alt={message.senderName}
          />
          <div className="voice-bubble__name">{message.senderName}</div>
          <div className="voice-bubble__text">{message.text}</div>
          <button
            className="relative w-full mt-1 rounded-xl overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '16/9' }}
            onClick={() => setOverlayOpen(true)}
            aria-label="Открыть видео"
          >
            <img
              src={message.thumbnail}
              alt={message.text}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4l10 6-10 6V4z" fill="#7A3E34" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
      {overlayOpen && message.videoSrc && (
        <VideoOverlay
          videoSrc={message.videoSrc}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}
